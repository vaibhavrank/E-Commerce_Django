from rest_framework.decorators import api_view, permission_classes, parser_classes
from .models import Product, Category, ProductVariant, Order, OrderItem, Payment, User, ProductImage , Color, Size  
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from django.contrib.auth.hashers import check_password
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch, Sum
import json
from decimal import Decimal
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import os
from django.conf import settings
# import cloudinary.uploader
from .cloudinary import *
# ==============================================register the useer
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def register_user(request):
    data = request.data.copy()

    # Upload image file to Cloudinary
    if 'profile_image' in request.FILES:
        upload_result = cloudinary.uploader.upload(request.FILES['profile_image'])
        # Save the secure URL to model field
        data['profile_image_url'] = upload_result.get('secure_url')

    serializer = UserRegisterSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# =================================verify teh user
User = get_user_model()

@api_view(['GET'])  
def activate_user(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError):
        return Response({"detail": "Invalid activation link"}, status=400)

    if user.is_active:
        return Response({"detail": "Account already activated."})

    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({"detail": "Account activated successfully."})
    else:
        return Response({"detail": "Invalid or expired token."}, status=400)

# =================================login tehr user
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = UserLoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if not user.is_active:
            return Response({'error': 'Account is not activated'}, status=403)

        if not check_password(password, user.password):
            return Response({'error': 'Invalid password'}, status=400)

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        })

    return Response(serializer.errors, status=400)

# =====================================================get profile
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_view(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


# ======================================================update profile
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # Required to parse file upload
def update_profile_view(request):
    user = request.user
    data = request.data.copy()

    # Upload image to Cloudinary if file is sent
    if 'profile_image' in request.FILES:
        upload_result = cloudinary.uploader.upload(request.FILES['profile_image'])
        data['profile_image_url'] = upload_result.get('secure_url')

    # Use the modified `data` dict instead of `request.data`
    serializer = UserProfileSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Profile updated', 'user': serializer.data})
    return Response(serializer.errors, status=400)







# Configure Cloudinary (add these to your settings.py)
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def get_all_products(request):
    """
    Fetch all products with pagination, filtering, and search,
    along with all available categories, colors, and sizes.
    If no main image is found, return any available image for the product.
    """
    try:
        # Get query parameters
        page = request.GET.get('page', 1)
        category_ids = request.GET.getlist('categories')
        colors_selected = request.GET.getlist('colors')
        sizes_selected = request.GET.getlist('sizes')
        search = request.GET.get('search', '')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sort_by = request.GET.get('sort_by', '')
        per_page = int(request.GET.get('per_page', 12))

        # Start with all products
        products_queryset = Product.objects.select_related('category').prefetch_related(
            # Prefetch all images for a product, ordered so main image is first, then by ID
            Prefetch('images', queryset=ProductImage.objects.all().order_by('-is_main', 'id')), # THIS IS THE KEY LINE
            'variants__size',
            'variants__color'
        ).annotate(
            total_stock=Sum('variants__stock')
        ).distinct()
 

        # Paginate
        paginator = Paginator(products_queryset, per_page)
        page_obj = paginator.get_page(page)

        # Serialize products
        products_data = []
        for product in page_obj:
            # Get the first image from the prefetched 'images' which is ordered by '-is_main', then 'id'
            # This means the main image will be first if it exists, otherwise the first image by ID.
            display_image = product.images.first() # THIS WILL BE THE "ANY" IMAGE IF NO MAIN

            # product_colors = list(set([variant.color.name for variant in product.variants.filter(stock__gt=0)]))
            # product_sizes = list(set([variant.size.name for variant in product.variants.filter(stock__gt=0)]))

            products_data.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'base_price': str(product.base_price),
                'category': {
                    'id': product.category.id,
                    'name': product.category.name,
                    'image': product.category.image
                },
                'main_image': display_image.image_url if display_image else None, # This should now get an image if any exist
                'in_stock': product.total_stock > 0,
                'variants_count': product.variants.count(),
                # 'available_colors': product_colors,
                # 'available_sizes': product_sizes,
                'created_at': product.created_at.isoformat()
            })

        # Fetch all categories, colors, and sizes for filters
        all_categories = list(Category.objects.values('id', 'name', 'image'))
        all_colors = list(Color.objects.values('id', 'name', 'hex_code'))
        all_sizes = list(Size.objects.values('id', 'name'))

        return JsonResponse({
            'success': True,
            'products': products_data,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_products': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'per_page': per_page
            },
            'filters_data': {
                'categories': all_categories,
                'colors': all_colors,
                'sizes': all_sizes,
            }
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db.models import Prefetch, Q # Import Q for complex lookups

# Assuming your models (Category, Color, Size, Product, ProductImage, ProductVariant)
# are defined and imported correctly from models.py
from .models import Product, ProductImage, ProductVariant, Category, Color, Size


def get_product_detail(request, product_id):
    """
    Get specific product details with related products, including all variants,
    their colors, sizes, and stock information.
    """
    try:
        # Fetch the main product with related data
        product = get_object_or_404(
            Product.objects.select_related('category').prefetch_related(
                'images',
                'variants__size',
                'variants__color'
            ),
            id=product_id
        )

        # Prepare product variants data
        variants_data = []
        # To get unique available colors and sizes for the main product
        available_colors = set()
        available_sizes = set()

        for variant in product.variants.all():
            variants_data.append({
                'id': variant.id,
                'size': {
                    'id': variant.size.id,
                    'name': variant.size.name
                },
                'color': {
                    'id': variant.color.id,
                    'name': variant.color.name,
                    'hex_code': variant.color.hex_code
                },
                'stock': variant.stock,
                'price': str(variant.price) if variant.price is not None else str(product.base_price),
                'in_stock': variant.stock > 0
            })
            available_colors.add(variant.color.name)
            available_sizes.add(variant.size.name)

        # Prepare product images data
        images_data = [{'id': img.id, 'url': img.image_url, 'is_main': img.is_main}
                       for img in product.images.all()]

        # Determine if the main product is in stock (at least one variant has stock > 0)
        is_product_in_stock = any(v['in_stock'] for v in variants_data)

        # Get related products (same category, exclude current, only main image)
        related_products_qs = Product.objects.filter(
            category=product.category
        ).exclude(id=product.id).prefetch_related(
            Prefetch('images', queryset=ProductImage.objects.filter(is_main=True))
        )[:6] # Limit to 6 related products

        related_data = []
        for related_product in related_products_qs:
            main_image = related_product.images.first() # This gets the pre-fetched main image
            related_data.append({
                'id': related_product.id,
                'name': related_product.name,
                'base_price': str(related_product.base_price),
                'main_image': main_image.image_url if main_image else None,
                'in_stock': related_product.variants.filter(stock__gt=0).exists()
            })

        # Construct the final product data dictionary
        product_detail_data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'base_price': str(product.base_price),
            'category': {
                'id': product.category.id,
                'name': product.category.name,
                'description': product.category.description,
                'image': product.category.image # Assuming this is a URL or path string
            },
            'images': images_data,
            'variants': variants_data,
            'available_colors': sorted(list(available_colors)), # Add unique available colors
            'available_sizes': sorted(list(available_sizes)),   # Add unique available sizes
            'in_stock': is_product_in_stock,                    # Add overall product stock status
            'created_at': product.created_at.isoformat(),
            'related_products': related_data
        }

        return JsonResponse({
            'success': True,
            'product': product_detail_data
        })

    except Product.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Product not found.'
        }, status=404)
    except Exception as e:
        # Catch any other unexpected errors
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        
        
        
def generate_invoice_pdf(order):
    """
    Generate PDF invoice for an order
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor('#2c3e50')
    )
    
    # Header
    story.append(Paragraph("INVOICE", title_style))
    story.append(Spacer(1, 20))
    
    # Order Information
    order_info = [
        ['Invoice Number:', f'INV-{order.id:06d}'],
        ['Order Date:', order.created_at.strftime('%B %d, %Y')],
        ['Customer:', f'{order.user.first_name} {order.user.last_name}'],
        ['Email:', order.user.email],
        ['Payment Status:', 'Paid' if order.is_paid else 'Pending']
    ]
    
    order_table = Table(order_info, colWidths=[2*inch, 3*inch])
    order_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    story.append(order_table)
    story.append(Spacer(1, 30))
    
    # Items table header
    story.append(Paragraph("Order Items", styles['Heading2']))
    story.append(Spacer(1, 10))
    
    # Items data
    items_data = [['Product', 'Quantity', 'Price', 'Total']]
    
    for item in order.items.all():
        items_data.append([
            item.product.name,
            str(item.quantity),
            f'${item.price}',
            f'${item.price * item.quantity}'
        ])
    
    # Add total row
    items_data.append(['', '', 'Total:', f'${order.total_amount}'])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -2), 1, colors.black),
        ('LINEABOVE', (0, -1), (-1, -1), 2, colors.black),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 30))
    
    # Footer
    story.append(Paragraph("Thank you for your business!", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

@csrf_exempt
@login_required
def buy_product(request):
    """
    Handle product purchase and generate invoice
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'})
    
    try:
        data = json.loads(request.body)
        items = data.get('items', [])  # [{'variant_id': 1, 'quantity': 2}, ...]
        payment_method = data.get('payment_method', 'razorpay')
        
        if not items:
            return JsonResponse({'success': False, 'error': 'No items in order'})
        
        with transaction.atomic():
            # Calculate total and validate items
            total_amount = Decimal('0.00')
            order_items_data = []
            
            for item_data in items:
                variant_id = item_data.get('variant_id')
                quantity = int(item_data.get('quantity', 1))
                
                variant = get_object_or_404(ProductVariant, id=variant_id)
                
                if variant.stock < quantity:
                    return JsonResponse({
                        'success': False, 
                        'error': f'Insufficient stock for {variant.product.name}'
                    })
                
                price = variant.price or variant.product.base_price
                item_total = price * quantity
                total_amount += item_total
                
                order_items_data.append({
                    'variant': variant,
                    'quantity': quantity,
                    'price': price,
                    'total': item_total
                })
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                is_paid=True  # Assuming payment is processed
            )
            
            # Create order items and update stock
            for item_data in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['variant'].product,
                    quantity=item_data['quantity'],
                    price=item_data['price']
                )
                
                # Update stock
                variant = item_data['variant']
                variant.stock -= item_data['quantity']
                variant.save()
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                method=payment_method,
                payment_id=f'pay_{order.id}_{datetime.now().strftime("%Y%m%d%H%M%S")}',
                status='completed'
            )
            
            # Generate invoice PDF
            pdf_buffer = generate_invoice_pdf(order)
            
            # Upload to Cloudinary
            try:
                upload_result = cloudinary.uploader.upload(
                    pdf_buffer.getvalue(),
                    resource_type="raw",
                    public_id=f"invoices/invoice_{order.id}",
                    format="pdf"
                )
                
                invoice_url = upload_result['secure_url']
                
                # You might want to store this URL in your Order model
                # For now, we'll return it in the response
                
            except Exception as e:
                print(f"Cloudinary upload error: {e}")
                invoice_url = None
            
            return JsonResponse({
                'success': True,
                'order_id': order.id,
                'total_amount': str(total_amount),
                'payment_id': payment.payment_id,
                'invoice_url': invoice_url,
                'message': 'Order placed successfully!'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def get_user_purchases(request):
    """
    Get all purchased products for the logged-in user with invoice links
    """
    try:
        user = request.user
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        # Get user's orders
        orders = Order.objects.filter(
            user=user, 
            is_paid=True
        ).prefetch_related(
            'items__product__images',
            'items__product__category'
        ).order_by('-created_at')
        
        # Paginate
        paginator = Paginator(orders, per_page)
        page_obj = paginator.get_page(page)
        
        orders_data = []
        for order in page_obj:
            # Generate invoice URL (you might want to store this in the database)
            invoice_url = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/raw/upload/invoices/invoice_{order.id}.pdf"
            
            order_items = []
            for item in order.items.all():
                main_image = item.product.images.filter(is_main=True).first()
                order_items.append({
                    'id': item.id,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'category': item.product.category.name,
                        'main_image': main_image.image_url if main_image else None
                    },
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'total': str(item.price * item.quantity)
                })
            
            orders_data.append({
                'id': order.id,
                'total_amount': str(order.total_amount),
                'created_at': order.created_at.isoformat(),
                'is_paid': order.is_paid,
                'items': order_items,
                'invoice_url': invoice_url
            })
        
        # Get unique purchased products for summary
        purchased_products = Product.objects.filter(
            orderitem__order__user=user,
            orderitem__order__is_paid=True
        ).distinct().prefetch_related(
            Prefetch('images', queryset=ProductImage.objects.filter(is_main=True))
        )
        
        products_summary = []
        for product in purchased_products:
            main_image = product.images.first()
            # Calculate total quantity purchased
            total_qty = sum(
                item.quantity for item in OrderItem.objects.filter(
                    product=product,
                    order__user=user,
                    order__is_paid=True
                )
            )
            
            products_summary.append({
                'id': product.id,
                'name': product.name,
                'category': product.category.name,
                'main_image': main_image.image_url if main_image else None,
                'total_purchased': total_qty
            })
        
        return JsonResponse({
            'success': True,
            'orders': orders_data,
            'products_summary': products_summary,
            'pagination': {
                'current_page': page_obj.number,
                'total_pages': paginator.num_pages,
                'total_orders': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'per_page': per_page
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def download_invoice(request, order_id):
    """
    Download or redirect to invoice PDF
    """
    try:
        order = get_object_or_404(Order, id=order_id, user=request.user, is_paid=True)
        
        # Construct Cloudinary URL
        invoice_url = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/raw/upload/invoices/invoice_{order.id}.pdf"
        
        # You can either redirect to the URL or regenerate and serve the PDF
        from django.http import HttpResponseRedirect
        return HttpResponseRedirect(invoice_url)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Additional utility views

def get_categories(request):
    """
    Get all product categories
    """
    try:
        categories = Category.objects.all()
        categories_data = [{
            'id': cat.id,
            'name': cat.name,
            'description': cat.description,
            'image': cat.image,
            'products_count': cat.products.count()
        } for cat in categories]
        
        return JsonResponse({
            'success': True,
            'categories': categories_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
def get_order_detail(request, order_id):
    """
    Get detailed information about a specific order
    """
    try:
        order = get_object_or_404(
            Order.objects.prefetch_related(
                'items__product__images',
                'items__product__category'
            ),
            id=order_id,
            user=request.user
        )
        
        invoice_url = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/raw/upload/invoices/invoice_{order.id}.pdf"
        
        order_items = []
        for item in order.items.all():
            main_image = item.product.images.filter(is_main=True).first()
            order_items.append({
                'id': item.id,
                'product': {
                    'id': item.product.id,
                    'name': item.product.name,
                    'description': item.product.description,
                    'category': item.product.category.name,
                    'main_image': main_image.image_url if main_image else None
                },
                'quantity': item.quantity,
                'price': str(item.price),
                'total': str(item.price * item.quantity)
            })
        
        order_data = {
            'id': order.id,
            'total_amount': str(order.total_amount),
            'created_at': order.created_at.isoformat(),
            'is_paid': order.is_paid,
            'items': order_items,
            'invoice_url': invoice_url
        }
        
        return JsonResponse({
            'success': True,
            'order': order_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
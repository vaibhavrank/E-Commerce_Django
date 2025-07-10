from rest_framework.decorators import api_view, permission_classes, parser_classes
from .models import Product, Category, ProductVariant, Order, OrderItem, Payment, User, ProductImage , Color, Size ,Invoice
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from django.contrib.auth.hashers import check_password
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer,OrderSerializer, OrderItemSerializer, PaymentSerializer, InvoiceSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
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

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
 

# For payment gateway integration (dummy example)
import uuid # For generating dummy transaction IDs
import razorpay


# ==============================================register the useer
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def register_user(request):
    data = request.data.copy()

    if 'profile_image' in request.FILES:
        upload_result = cloudinary.uploader.upload(request.FILES['profile_image'])
        data['profile_image_url'] = upload_result.get('secure_url')

    serializer = UserRegisterSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    
    print("Registration errors:", serializer.errors)  # ✅ Add this
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
@parser_classes([MultiPartParser, FormParser,JSONParser])  # Required to parse file upload
def update_profile_view(request):
    print(request)
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


# ============================================================================================================================#
# ===============================================get all product details======================================================#
# ============================================================================================================================#
def get_all_products(request):
    """
    Fetch all products with pagination, filtering, and search,
    along with all available categories, colors, and sizes.
    If no main image is found, return any available image for the product.
    """
    try:
        # Get query parameters
        page = request.GET.get('page', 1)
        category_names = request.GET.getlist('categories')
        colors_selected_names = request.GET.getlist('colors')
        sizes_selected_names = request.GET.getlist('sizes')
        search = request.GET.get('search', '')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        sort_by = request.GET.get('sort_by', '')
        per_page = int(request.GET.get('per_page', 9))

        # Start with all products, prefetch related data
        products_queryset = Product.objects.select_related('category').prefetch_related(
            # Prefetch all images for a product, ordered so main image is first, then by ID
            # Use 'image_url' here as per your ProductImage model field name
            Prefetch('images', queryset=ProductImage.objects.all().order_by('-is_main', 'id')),
            'variants__size',
            'variants__color'
        ).annotate(
            total_stock=Sum('variants__stock')
        ).distinct()

        # --- Apply Filters ---
        if category_names:
            products_queryset = products_queryset.filter(category__name__in=category_names)

        if colors_selected_names:
            # Assuming ProductVariant has a ForeignKey to Color, and Color has a 'name' field
            products_queryset = products_queryset.filter(variants__color__name__in=colors_selected_names)

        if sizes_selected_names:
            # Assuming ProductVariant has a ForeignKey to Size, and Size has a 'name' field
            products_queryset = products_queryset.filter(variants__size__name__in=sizes_selected_names)

        if search:
            products_queryset = products_queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        if min_price:
            try:
                products_queryset = products_queryset.filter(base_price__gte=float(min_price))
            except ValueError:
                pass

        if max_price:
            try:
                products_queryset = products_queryset.filter(base_price__lte=float(max_price))
            except ValueError:
                pass

        # --- Apply Sorting ---
        if sort_by == 'price-low':
            products_queryset = products_queryset.order_by('base_price')
        elif sort_by == 'price-high':
            products_queryset = products_queryset.order_by('-base_price')
        elif sort_by == 'name':
            products_queryset = products_queryset.order_by('name')
        else:
            products_queryset = products_queryset.order_by('id') # Default order

        # --- Now Paginate the FILTERED and SORTED queryset ---
        paginator = Paginator(products_queryset, per_page)
        page_obj = paginator.get_page(page)

        # Serialize products
        products_data = []
        for product in page_obj:
            # Get the first image from the prefetched 'images'
            display_image = product.images.first()

            products_data.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'base_price': str(product.base_price),
                'category': {
                    'id': product.category.id,
                    'name': product.category.name,
                    # Access category.image directly, as it's a TextField storing the URL
                    'image': product.category.image if product.category.image else None
                },
                # Access ProductImage.image_url directly, as it's a URLField storing the URL
                'main_image': display_image.image_url if display_image and display_image.image_url else None,
                'in_stock': product.total_stock > 0,
                'variants_count': product.variants.count(),
                'created_at': product.created_at.isoformat()
            })

        # Fetch all categories, colors, and sizes for filters
        # Iterate over Category objects to get image URLs directly from TextField
        all_categories = []
        for category in Category.objects.all():
            all_categories.append({
                'id': category.id,
                'name': category.name,
                'image': category.image if category.image else None # Access category.image directly
            })

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
        # It's good practice to log the full traceback in a production environment,
        # but for development, printing to console and returning the error string is fine.
        print(f"Error in get_all_products: {e}")
        import traceback
        traceback.print_exc() # This will print the full traceback to your console

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


# ============================================================================================================================#
# ===============================================get a specific product details======================================================#
# ============================================================================================================================#
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
        
        
# =============================================================================================================================================================
# ======================================================payment and order management=========================================================================




# --- Order Management Views ---

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.save()

        # Initialize Razorpay client
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Amount must be in paise (i.e., *100)
        amount_in_paise = int(order.total_amount * 100)

        razorpay_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"order_rcptid_{order.id}",
            "payment_capture": 1
        })

        # Save Razorpay order ID to your order model (optional)
        order.razorpay_order_id = razorpay_order['id']
        order.save()

        # Store this razorpay_order_id in your response (optional)
        self.razorpay_order_id = razorpay_order['id']


class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only list orders belonging to the authenticated user
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class UserOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk' # Use 'id' for lookup

    def get_queryset(self):
        # Only allow authenticated user to retrieve their own orders
        return Order.objects.filter(user=self.request.user)

# Optional: View to cancel an order (if allowed based on status)
class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)

        if order.status in ['PENDING', 'PROCESSING']: # Only allow cancellation if order is in these states
            with transaction.atomic():
                order.status = 'CANCELLED'
                order.save(update_fields=['status'])
                # You might want to also:
                # - Refund any payment if it was made (via payment gateway API)
                # - Revert stock for order items
                # - Log the cancellation reason
            return Response({"detail": "Order cancelled successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": f"Order cannot be cancelled in {order.status} status."}, 
                            status=status.HTTP_400_BAD_REQUEST)

# --- Payment Management Views ---
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class PaymentInitiateView(APIView):
    """
    Initiates a Razorpay payment for an order.
    Creates a Payment record in DB and a Razorpay Order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)

        if order.is_paid:
            return Response({"detail": "Order is already paid."}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'CANCELLED':
            return Response({"detail": "Cannot initiate payment for a cancelled order."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if a pending payment already exists for this order using razorpay_order_id
        existing_payment = Payment.objects.filter(order=order, status='PENDING').first()
        if existing_payment:
            # If a pending payment exists, return its details to allow user to retry
            if existing_payment.razorpay_order_id:
                 return Response({
                    "detail": "A pending payment exists. Returning existing Razorpay order ID.",
                    "razorpay_order_id": existing_payment.razorpay_order_id,
                    "amount_paid": str(order.total_amount), # Use amount_paid to match serializer
                    "currency": "INR", # Assuming INR
                    "key_id": settings.RAZORPAY_KEY_ID,
                    "order_id": order.id # Your backend order ID
                 }, status=status.HTTP_200_OK)


        method = request.data.get('method')
        if not method:
            return Response({"detail": "Payment method is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                amount_paisa = int(order.total_amount * 100)
                currency = "INR"

                razorpay_order = razorpay_client.order.create({
                    'amount': amount_paisa,
                    'currency': currency,
                    'receipt': f'order_rcptid_{order.id}',
                    'payment_capture': 1
                })
                print(razorpay_order['id'])
                # Create Payment record with Razorpay Order ID stored in razorpay_order_id field
                payment = Payment.objects.create(
                    order=order,
                    method=method,
                    status='PENDING',
                    amount_paid=order.total_amount,
                    razorpay_order_id=razorpay_order['id'] # Store Razorpay Order ID here
                )
                print(f"Created Payment ID: {payment.id}, Razorpay Order ID: {payment.razorpay_order_id}")

                # Return Razorpay order details and payment ID from your DB to frontend
                serializer = PaymentSerializer(payment)
                response_data = serializer.data
                response_data['razorpay_order_id'] = razorpay_order['id'] # Ensure this is explicitly sent
                response_data['key_id'] = settings.RAZORPAY_KEY_ID # Send key_id to frontend
                response_data['currency'] = currency # Send currency to frontend
                # 'amount_paid' is already in serializer data

                return Response(response_data, status=status.HTTP_201_CREATED)

        except razorpay.errors.BadRequestError as e:
            print(f"Razorpay API error: {e}")
            return Response({"detail": f"Payment initiation failed: {e.description}"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error during payment initiation: {e}")
            return Response({"detail": "An unexpected error occurred during payment initiation."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentVerifyView(APIView):
    """
    Verifies the Razorpay payment signature and updates the order status.
    This is called by the frontend after successful payment modal.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.data.get('razorpay_order_id'))
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id') # This is the Razorpay Order ID
        razorpay_signature = request.data.get('razorpay_signature')
        
        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            return Response({"detail": "Missing Razorpay payment details."}, status=status.HTTP_400_BAD_REQUEST)
        print("HI")
        try:
            # FIX: Fetch the payment by razorpay_order_id, NOT transaction_id
            print(razorpay_order_id)
            payment = get_object_or_404(Payment, razorpay_order_id=razorpay_order_id)
            order = payment.order

            # Verify Razorpay signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            razorpay_client.utility.verify_payment_signature(params_dict)

            with transaction.atomic():
                # Update payment details
                payment.status = 'SUCCESS'
                payment.amount_paid = order.total_amount # Confirm paid amount matches order total
                payment.transaction_id = razorpay_payment_id # Store the actual Razorpay Payment ID here
                payment.save()

                return Response({"detail": "Payment successful and verified."}, status=status.HTTP_200_OK)

        except razorpay.errors.SignatureVerificationError as e:
            print(f"Signature verification failed: {e}")
            # Mark payment as failed if signature verification fails
            # Make sure 'payment' object is available before trying to save it
            if 'payment' in locals():
                payment.status = 'FAILED'
                payment.save(update_fields=['status'])
            return Response({"detail": "Payment verification failed: Invalid signature."},
                            status=status.HTTP_400_BAD_REQUEST)
        except Payment.DoesNotExist:
            # This means no Payment record with that razorpay_order_id was found
            return Response({"detail": "Payment record not found for the provided Razorpay order ID."},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Catch all other unexpected errors
            import traceback
            traceback.print_exc() # Print full traceback to console for debugging
            print(f"Error during payment verification: {e}")
            return Response({"detail": "An unexpected server error occurred during payment verification."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        return Response({"detail": "GET method not allowed on this endpoint. Use POST."},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

# View for Payment Gateway Webhook (Example - specific to your gateway)
class PaymentWebhookView(APIView):
    """
    This view receives callbacks from payment gateways (e.g., Razorpay, Stripe)
    to update payment status.
    **IMPORTANT:** This endpoint should be protected with a shared secret or IP whitelisting
    from your payment gateway for security.
    """
    # No permission_classes here as it's called by the payment gateway, not a logged-in user.
    # Implement custom authentication/verification based on gateway's webhook security.

    def post(self, request):
        payload = request.data
        # You'll need to verify the webhook signature first for security
        # e.g., for Razorpay: razorpay.utility.verify_webhook_signature(...)
        # for Stripe: stripe.Webhook.construct_event(...)

        event_type = payload.get('event') # e.g., 'payment.captured', 'payment.failed'
        transaction_id = payload.get('payload', {}).get('payment', {}).get('entity', {}).get('id') # Gateway's ID

        if not transaction_id:
            return Response({"detail": "Missing transaction ID"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return Response({"detail": "Payment record not found for this transaction ID"}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            if event_type == 'payment.captured' or event_type == 'payment.succeeded':
                payment.status = 'SUCCESS'
                payment.amount_paid = Decimal(payload.get('payload', {}).get('payment', {}).get('entity', {}).get('amount')) / 100 # amount is usually in smallest unit
                # Also update order.is_paid and order.status via payment.save()
            elif event_type == 'payment.failed':
                payment.status = 'FAILED'
                # Optionally, update order status to 'PENDING' or 'CANCELLED'
            elif event_type == 'refund.processed' or event_type == 'payment.refunded':
                payment.status = 'REFUNDED'
            # Add more event types as per your payment gateway's documentation

            payment.save() # This will trigger the save logic in the Payment model

        return Response(status=status.HTTP_200_OK)

# --- Invoice Management Views ---

class InvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order__pk' # Lookup invoice by its related order's ID

    def get_queryset(self):
        # Only allow authenticated user to retrieve invoices for their own orders
        return Invoice.objects.filter(order__user=self.request.user)

# View for generating an invoice (typically triggered after successful payment)
class InvoiceGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)

        if not order.is_paid:
            return Response({"detail": "Invoice can only be generated for paid orders."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(order, 'invoice') and order.invoice:
            serializer = InvoiceSerializer(order.invoice)
            return Response({"detail": "Invoice already exists for this order.", "invoice": serializer.data}, 
                            status=status.HTTP_200_OK) # Return existing invoice

        try:
            with transaction.atomic():
                invoice = Invoice.objects.create(order=order)
                # In a real application, here you would trigger a task
                # to generate the PDF file for the invoice and set `invoice.file_url`.
                # For example: generate_invoice_pdf_task.delay(invoice.id)
                # For this example, we'll just set a dummy URL:
                invoice.file_url = f"/media/invoices/{invoice.invoice_number}.pdf"
                invoice.save(update_fields=['file_url'])

                serializer = InvoiceSerializer(invoice)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error generating invoice: {e}")
            return Response({"detail": "An unexpected error occurred during invoice generation."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
            
            
            
            
            
            
            
            
            
            
from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .models import User,Product, Order, OrderItem, Payment, Invoice, ProductVariant
from decimal import Decimal

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['role']  

class  UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        
        fields = ['first_name', 'last_name', 'email', 'password', 'profile_image_url', 'address']
        extra_kwargs = {'password': {'write_only': True}}
    def send_activation_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        activation_link = f"http://localhost:8000/api/auth/activate/{uid}/{token}/"

        subject = "Activate Your Account"
        message = f"""
        Hi {user.first_name},

        Thank you for registering.

        Please click the link below to activate your account:
        {activation_link}

        If you did not request this, please ignore this email.
        """
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        
        
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['is_active'] = False  # User must activate via email
        user = super().create(validated_data)
        self.send_activation_email(user)
        return user

    
        
        
        
class   UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_image_url', 'address', 'created_at']



# ===============================================payment and order management



class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    size_name = serializers.CharField(source='size.name', read_only=True)
    color_name = serializers.CharField(source='color.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'product_name', 'size', 'size_name', 'color', 'color_name', 'stock', 'price']
        read_only_fields = ['stock', 'price'] # Price here is the current variant price, not purchase price

class OrderItemSerializer(serializers.ModelSerializer):
    # Snapshot fields are read-only as they are populated by the model's save method
    product_name = serializers.CharField(read_only=True)
    size_name = serializers.CharField(read_only=True)
    color_name = serializers.CharField(read_only=True)
    price_at_purchase = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False) # For creating an OrderItem with Product ID
    product_variant_id = serializers.IntegerField(write_only=True, required=False) # For creating an OrderItem with ProductVariant ID

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'product_name', 'product_variant', 'product_variant_id', 
            'size_name', 'color_name', 'quantity', 'price_at_purchase'
        ]
        extra_kwargs = {
            'product': {'read_only': True}, # Product FK will be resolved by the ID
            'product_variant': {'read_only': True}, # ProductVariant FK will be resolved by the ID
        }

    def validate(self, data):
        product_id = data.get('product_id')
        product_variant_id = data.get('product_variant_id')

        if not product_id and not product_variant_id:
            raise serializers.ValidationError("Either 'product_id' or 'product_variant_id' must be provided.")
        
        if product_variant_id:
            try:
                variant = ProductVariant.objects.get(id=product_variant_id)
                data['product_variant'] = variant
                data['product'] = variant.product # Link product from variant
                # Set price_at_purchase if not provided, using variant price
                if 'price_at_purchase' not in data or data['price_at_purchase'] is None:
                    data['price_at_purchase'] = variant.price if variant.price is not None else variant.product.base_price
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError(f"ProductVariant with ID {product_variant_id} does not exist.")
        elif product_id:
            try:
                product = Product.objects.get(id=product_id)
                data['product'] = product
                # Set price_at_purchase if not provided, using base product price
                if 'price_at_purchase' not in data or data['price_at_purchase'] is None:
                    data['price_at_purchase'] = product.base_price
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with ID {product_id} does not exist.")

        return data

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True) # Nested serializer for order items
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_full_name = serializers.SerializerMethodField(read_only=True)
    razorpay_order_id = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id','razorpay_order_id', 'user', 'user_email', 'user_full_name', 'status', 'shipping_address', 
            'subtotal_amount', 'discount_amount', 'coupon_code', 'shipping_charge', 
            'gst_percentage', 'gst_amount', 'total_amount', 'created_at', 'updated_at', 
            'is_paid', 'items'
        ]
        read_only_fields = [
            'id','razorpay_order_id', 'user', 'user_email', 'user_full_name', 'status', 'subtotal_amount', 
            'gst_amount', 'total_amount', 'created_at', 'updated_at', 'is_paid'
        ] # User, status, and calculated amounts are set by the system

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Ensure the user making the request is assigned to the order
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            validated_data['shipping_address'] = request.user.address # Default to user's address
        else:
            raise serializers.ValidationError("Authentication required to create an order.")

        # Calculate subtotal based on items provided
        subtotal = Decimal('0.00')
        for item_data in items_data:
            # Ensure price_at_purchase is set from validation or explicit value
            if 'price_at_purchase' not in item_data or item_data['price_at_purchase'] is None:
                 raise serializers.ValidationError("Price at purchase must be set for all order items.")
            subtotal += item_data['price_at_purchase'] * item_data['quantity']

        validated_data['subtotal_amount'] = subtotal
        
        # Apply default for shipping_charge, gst_percentage if not provided in request
        validated_data.setdefault('shipping_charge', Decimal('0.00'))
        validated_data.setdefault('gst_percentage', Decimal('0.00'))
        validated_data.setdefault('discount_amount', Decimal('0.00'))


        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            # Pop product_id/product_variant_id as OrderItem model uses product/product_variant FK
            item_data.pop('product_id', None) 
            item_data.pop('product_variant_id', None)
            OrderItem.objects.create(order=order, **item_data)
        
        # Trigger Order's save method to calculate total_amount, gst_amount etc.
        order.save() 
        return order

    def update(self, instance, validated_data):
        # Prevent direct update of items via order serializer in update method
        # Items should be managed separately or via a dedicated endpoint if needed.
        if 'items' in validated_data:
            raise serializers.ValidationError("Order items cannot be updated directly via this endpoint. Please use specific item management.")

        # Update specific fields
        instance.shipping_address = validated_data.get('shipping_address', instance.shipping_address)
        instance.discount_amount = validated_data.get('discount_amount', instance.discount_amount)
        instance.coupon_code = validated_data.get('coupon_code', instance.coupon_code)
        instance.shipping_charge = validated_data.get('shipping_charge', instance.shipping_charge)
        instance.gst_percentage = validated_data.get('gst_percentage', instance.gst_percentage)
        # Status can be updated by admin or specific actions, not directly by user in this generic update
        # instance.status = validated_data.get('status', instance.status) 

        instance.save() # This will re-calculate total_amount, gst_amount
        return instance

class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_id', 'method', 'transaction_id', 
            'status', 'amount_paid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'order_id']

    def validate(self, data):
        # Ensure amount_paid is provided when creating a payment
        if self.instance is None and 'amount_paid' not in data: # Only for creation
            raise serializers.ValidationError({"amount_paid": "This field is required for payment creation."})
        return data


class InvoiceSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'order', 'order_id', 'invoice_number', 'file_url', 'generated_at']
        read_only_fields = ['id', 'invoice_number', 'generated_at', 'order_id']
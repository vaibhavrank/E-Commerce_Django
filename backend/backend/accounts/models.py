from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from decimal import Decimal

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('SUPPORT', 'Support'),
        ('USER','Customer')
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='SUPPORT')

    username = None
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    profile_image_url = models.URLField(blank=True, null=True)
    address = models.TextField()

    REQUIRED_FIELDS = ['first_name', 'last_name']
    USERNAME_FIELD = 'email'
    objects = UserManager()

    # Favorite products (users can mark products they like)
    favorite_products = models.ManyToManyField('Product', related_name='favorited_by', blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} {self.email}"

    @property
    def bought_products(self):
        """
        Dynamically fetch products this user has purchased (via orders)
        """
        return Product.objects.filter(orderitem__order__user=self).distinct()


class Category(models.Model):
    name = models.CharField(max_length=50)
    image = models.TextField()
    description = models.TextField()
    def __str__(self):
        return self.name

class Color(models.Model):
    name = models.CharField(max_length=50)
    hex_code = models.CharField(max_length=7, blank=True)
    
    def __str__(self):
        return self.name
    
class Size(models.Model):
    name = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name



class Product(models.Model):
    name = models.CharField(max_length=200)
    # image_url = models.URLField(blank=True, null=True)  
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
# NEW MODEL FOR PRODUCT IMAGES
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500) # Use a longer max_length for URLs
    is_main = models.BooleanField(default=False) # To designate a primary image for the product
    
    class Meta:
        # Ensures that only one image can be marked as main for a given product
        constraints = [
            models.UniqueConstraint(fields=['product'], condition=models.Q(is_main=True), name='unique_main_image_for_product')
        ]

    def __str__(self):
        return f"Image for {self.product.name} ({self.image_url[:30]}...)"


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.ForeignKey(Size, on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.CASCADE)
    stock = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # override base price if needed
    class Meta:
        unique_together = ('product', 'size', 'color')  # No duplicate variants

    def __str__(self):
        return f"{self.product.name} - {self.size.name} - {self.color.name}"
    
class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('CANCELLED', 'Cancelled'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('REFUNDED', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Order Status
    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='PENDING'
    )

    # Address snapshot at the time of order
    shipping_address = models.TextField(help_text="Snapshot of the shipping address at the time of order")
    
    # Financial details
    subtotal_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Sum of prices of all order items before discounts/taxes/shipping"
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'), # Use Decimal for defaults
        help_text="Total discount applied (e.g., from coupon codes)"
    )
    coupon_code = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        help_text="The coupon code used for this order, if any"
    )
    shipping_charge = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        help_text="Cost of shipping for this order"
    )
    gst_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.00'),
        help_text="Applicable GST percentage for the order"
    )
    gst_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        help_text="Calculated GST amount"
    )
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Final amount after all calculations (subtotal - discount + shipping + GST)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) # To track when the order status or details change
    
    is_paid = models.BooleanField(default=False) # Indicates if the payment for the order has been successfully processed

    class Meta:
        ordering = ['-created_at'] # Default ordering for orders

    def __str__(self):
        return f"Order #{self.id} - {self.user.email} - {self.status}"

    def save(self, *args, **kwargs):
        # Calculate total_amount before saving
        # This is a basic calculation; you might want more complex logic (e.g., based on OrderItems)
        # Ensure Decimal type for calculations to avoid float precision issues
        if self.subtotal_amount is not None:
            calculated_total = self.subtotal_amount - self.discount_amount + self.shipping_charge
            if self.gst_percentage > 0:
                self.gst_amount = (calculated_total * self.gst_percentage) / Decimal('100.00')
                self.total_amount = calculated_total + self.gst_amount
            else:
                self.gst_amount = Decimal('0.00')
                self.total_amount = calculated_total
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    
    # Snapshot of product details at the time of purchase
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, 
                                help_text="Reference to the product (can be null if product is deleted)")
    product_name = models.CharField(max_length=200)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True,
                                        help_text="Reference to the specific product variant purchased")
    
    # Snapshot of variant details for historical record
    size_name = models.CharField(max_length=50, blank=True)
    color_name = models.CharField(max_length=50, blank=True)
    
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Price of the single item at the time of purchase"
    )

    def __str__(self):
        return f"{self.quantity} x {self.product_name} ({self.size_name}/{self.color_name}) for Order #{self.order.id}"

    def save(self, *args, **kwargs):
        # Populate snapshot fields if product and variant are set
        if self.product:
            self.product_name = self.product.name
        if self.product_variant:
            self.size_name = self.product_variant.size.name if self.product_variant.size else ''
            self.color_name = self.product_variant.color.name if self.product_variant.color else ''
            # If price_at_purchase is not explicitly set, use variant price
            if not self.price_at_purchase and self.product_variant.price is not None:
                self.price_at_purchase = self.product_variant.price
            elif not self.price_at_purchase:
                self.price_at_purchase = self.product.base_price # Fallback to base price if variant price is null

        super().save(*args, **kwargs)

  
class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
        ('CAPTURED', 'Captured'), # For payment gateways where payment is first authorized then captured
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=50, help_text="e.g., razorpay, stripe, PayPal")
    transaction_id = models.CharField(
        max_length=255, 
        unique=True, 
        blank=True, 
        null=True, 
        help_text="Unique ID from the payment gateway"
    ) # Changed from payment_id to transaction_id for clarity
    razorpay_order_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        help_text="Razorpay's generated order ID"
    )

    status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES, 
        default='PENDING'
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.method} - {self.status}"

    def save(self, *args, **kwargs):
        # Update order's is_paid status based on payment status
        if self.status == 'SUCCESS' and not self.order.is_paid:
            self.order.is_paid = True
            self.order.status = 'PROCESSING' # Or a suitable initial status after payment
            self.order.save(update_fields=['is_paid', 'status'])
        elif self.status != 'SUCCESS' and self.order.is_paid:
            self.order.is_paid = False
            # You might want to revert order status or log this
            self.order.save(update_fields=['is_paid'])
        super().save(*args, **kwargs)



class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True, blank=True, null=True) # Increased max_length for flexibility
    file_url = models.URLField(blank=True, null=True, help_text="URL to the generated PDF invoice, if applicable") # Can be null initially
    generated_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only generate on first save (i.e., when creating a new Invoice object)
            # Check if an invoice for this order already exists to prevent duplicates
            if Invoice.objects.filter(order=self.order).exists():
                # You might choose to log this or raise a more specific exception
                raise ValueError(f"An invoice for Order ID {self.order.id} already exists.")
                
            # Generate a unique invoice number
            # Using a combination of timestamp and order ID for better uniqueness
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f') # Added %f for microseconds for higher uniqueness
            self.invoice_number = f'INV-{timestamp}-{self.order.id:06d}'
            
            # Very rare: Ensure uniqueness if there's a collision (though unlikely with timestamp+microseconds)
            # This loop is mostly for robustness; in practice, collisions are improbable with microseconds.
            while Invoice.objects.filter(invoice_number=self.invoice_number).exists():
                timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
                self.invoice_number = f'INV-{timestamp}-{self.order.id:06d}'

        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'Invoice {self.invoice_number} for Order #{self.order.id}'

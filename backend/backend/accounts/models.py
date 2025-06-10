from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of purchase

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    method = models.CharField(max_length=50)  # razorpay, stripe, etc.
    payment_id = models.CharField(max_length=100)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=20, unique=True)
    file_url = models.URLField()
    generated_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = f'INV-{self.order.id:06d}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f'Invoice {self.invoice_number}'
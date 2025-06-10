from django.contrib import admin
from .models import User, Category, Color, Size, Product, ProductVariant, Order, OrderItem, Payment, ProductImage

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'created_at')
    ordering = ('-created_at',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'image')
    search_fields = ('name',)

@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'hex_code')
    search_fields = ('name', 'hex_code')

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

class ProductImageInline(admin.TabularInline):
    """
    Inline for ProductImage to be displayed within the Product admin.
    This allows you to add/edit images directly when editing a product.
    """
    model = ProductImage
    extra = 1  # Number of empty forms to display
    fields = ('image_url', 'is_main') # Specify which fields to show

class ProductVariantInline(admin.TabularInline):
    """
    Inline for ProductVariant to be displayed within the Product admin.
    """
    model = ProductVariant
    extra = 1  # Number of empty forms to display

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'base_price', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('category', 'created_at')
    # Add ProductImageInline here
    inlines = [ProductImageInline, ProductVariantInline]

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'is_paid', 'created_at')
    list_filter = ('is_paid', 'created_at')
    search_fields = ('user__email',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price')
    search_fields = ('order__id', 'product__name')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'method', 'status', 'created_at')
    list_filter = ('method', 'status', 'created_at')
    search_fields = ('order__id', 'payment_id')
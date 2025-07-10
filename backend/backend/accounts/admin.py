from django.contrib import admin
from .models import User, Category, Color, Size, Invoice, ProductVariant, Order, OrderItem, Payment, ProductImage

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

# Inline OrderItems for Orders
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product_name', 'size_name', 'color_name', 'price_at_purchase')
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'is_paid', 'created_at')
    list_filter = ('status', 'is_paid', 'created_at')
    search_fields = ('user__email', 'id', 'coupon_code')
    readonly_fields = ('subtotal_amount', 'discount_amount', 'gst_percentage', 'gst_amount', 'total_amount')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product_name', 'size_name', 'color_name', 'quantity', 'price_at_purchase')
    list_filter = ('size_name', 'color_name')
    search_fields = ('product_name', 'order__id')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'method', 'transaction_id', 'status', 'amount_paid', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('order__id', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'invoice_number', 'generated_at')
    search_fields = ('invoice_number', 'order__id')
    readonly_fields = ('invoice_number', 'generated_at')
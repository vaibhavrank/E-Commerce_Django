from django.urls import path
from .views import register_user, login_view, get_profile_view, update_profile_view, activate_user,get_all_products,get_product_detail
 
from .views import (
    OrderCreateView, UserOrderListView, UserOrderDetailView, OrderCancelView,
    PaymentInitiateView, PaymentWebhookView,
    InvoiceDetailView, InvoiceGenerateView,
    PaymentVerifyView
)
urlpatterns = [
    
    path('register/', register_user),
    path('login/', login_view),
    path('profile/', get_profile_view),
    path('profile/update/', update_profile_view),
    path('activate/<uidb64>/<token>/', activate_user, name='activate-user'),
    
    # Product views
    path('products/',  get_all_products, name='get_all_products'),
    path('products/<int:product_id>/', get_product_detail, name='get_product_detail'),
     
    
   # Order URLs
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/my/', UserOrderListView.as_view(), name='user-order-list'),
    path('orders/<int:pk>/', UserOrderDetailView.as_view(), name='user-order-detail'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),

    # Payment URLs
    path('orders/<int:order_id>/payment/initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    # This URL is for your payment gateway to call you. Protect it securely.
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment-verify'), # New endpoint for frontend verification
    
    
    
    
    path('payments/webhook/', PaymentWebhookView.as_view(), name='payment-webhook'), 

    # Invoice URLs
    path('orders/<int:order_id>/invoice/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('orders/<int:order_id>/invoice/generate/', InvoiceGenerateView.as_view(), name='invoice-generate'),
    
]

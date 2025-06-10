from django.urls import path
from .views import register_user, login_view, get_profile_view, update_profile_view, activate_user,get_all_products,get_product_detail,get_categories,buy_product
from .views import get_user_purchases,get_order_detail,download_invoice
urlpatterns = [
    path('register/', register_user),
    path('login/', login_view),
    path('profile/', get_profile_view),
    path('profile/update/', update_profile_view),
    path('activate/<uidb64>/<token>/', activate_user, name='activate-user'),
    
    # Product views
    path('products/',  get_all_products, name='get_all_products'),
    path('products/<int:product_id>/', get_product_detail, name='get_product_detail'),
    path('categories/',  get_categories, name='get_categories'),
    
    # Purchase and order views
    path('buy/',  buy_product, name='buy_product'),
    path('my-purchases/',  get_user_purchases, name='get_user_purchases'),
    path('orders/<int:order_id>/',  get_order_detail, name='get_order_detail'),
    path('invoices/<int:order_id>/download/',  download_invoice, name='download_invoice'),
]

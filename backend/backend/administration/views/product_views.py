from rest_framework.generics import ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from administration.permissions import IsAdminOrManager
from accounts.models import Product
from administration.serializers.product_serializers import ProductSerializer

class ProductListAPIView(ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]

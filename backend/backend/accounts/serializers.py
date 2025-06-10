from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

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

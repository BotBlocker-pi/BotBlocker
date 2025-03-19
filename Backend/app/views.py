import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from app.dtos import *
from app.models import *


def create_profile(username, platform, image=None):

    social_instance, _ = Social.objects.get_or_create(social=platform)

    profile = Profile.objects.create(
        username=username,
        social=social_instance,
        url=f"https://{platform}.com/{username}",
    )
    return profile

def get_probability(request):

    url = request.GET.get("url")
    print("url",url)
    username, platform = extractPerfilNameAndPlataformOfURL(url)
    print(username, platform)
    if not platform:
        return JsonResponse({'error': 'Invalid platform'}, status=400)

    if not Profile.objects.filter(username=username, social__social=platform).exists():
        create_profile(username, platform)

    serializer = ProfileDTO(username, platform)
    return JsonResponse(serializer.initial_data, safe=False)


from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings


from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


from urllib.parse import urljoin

import requests
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class GoogleLoginCallback(APIView):
    def get(self, request, *args, **kwargs):
        code = request.GET.get("code")

        if code is None:
            return Response({"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)

        token_endpoint_url = "https://oauth2.googleapis.com/token"
        payload = {
            "code": code,
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_OAUTH_CALLBACK_URL,
            "grant_type": "authorization_code",
        }

        response = requests.post(token_endpoint_url, data=payload)

        if response.status_code != 200:
            return Response({"error": "Failed to get token", "details": response.text}, status=status.HTTP_400_BAD_REQUEST)

        token_data = response.json()
        
        access_token = token_data.get("access_token")
        print(access_token)
        if not access_token:
            return Response({"error": "No access token received"}, status=status.HTTP_400_BAD_REQUEST)
        
        return JsonResponse({
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
        }, status=200)

    
from django.conf import settings
from django.shortcuts import render
from django.views import View


class LoginPage(View):
    def get(self, request, *args, **kwargs):
        return render(
            request,
            "pages/login.html",
            {
                "google_callback_uri": settings.GOOGLE_OAUTH_CALLBACK_URL,
                "google_client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            },
        )
    

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(["GET"])
@permission_classes([IsAuthenticated])  # ✅ Exige autenticação
def protected_view(request):
    user = request.user  # ✅ Obtém o utilizador autenticado
    print(user)
    return Response({
        "message": "Bem-vindo!",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.get_full_name()
        }
    }, status=status.HTTP_200_OK)
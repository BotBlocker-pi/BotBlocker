import json
from django.http import JsonResponse
from django.shortcuts import render
from app.dtos import *
from app.models import *
from app.serializers import *
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_avaliacao(request):
    try:
        print("Received Data:", request.data)

        try:
            user_bb = User_BB.objects.get(user=request.user)
        except User_BB.DoesNotExist:
            return Response({'error': 'User_BB não encontrado para este utilizador'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['user'] = request.user.username

        serializer = EvaluationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Validation Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
            print("Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_perfis(request):
    print("GET /perfis")
    perfis = Profile.objects.all()
    serializer = ProfileListSerializer(perfis, many=True)
    return Response({'perfis': serializer.data})  # Padronizando para sempre retornar um objeto com campo 'perfis'


class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({"auth": True})
    

class CustomTokenObtainView(APIView):
    """
    View para autenticação de utilizador e geração de tokens JWT.
    """
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        print(username,password)
        if not username or not password:
            return Response({"error": "Email e senha são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)



def criar_dados_para_joao():
    # Criar utilizador Django
    user, created = User.objects.get_or_create(
        username="joao",
        defaults={"email": "joao@example.com"}
    )
    if created:
        user.set_password("1234")
        user.save()
        print("✅ Utilizador Django 'joao' criado")
    else:
        print("ℹ️ Utilizador 'joao' já existia")

    # Criar User_BB associado
    user_bb, created = User_BB.objects.get_or_create(user=user, email=user.email)
    if created:
        print("✅ User_BB criado")
    else:
        print("ℹ️ User_BB já existia")

    # Criar rede social 'x'
    social, created = Social.objects.get_or_create(social="x")
    if created:
        print("✅ Social 'x' criado")
    else:
        print("ℹ️ Social 'x' já existia")

    # Criar perfil
    profile, created = Profile.objects.get_or_create(
        username="matt_vanswol",
        social=social,
        defaults={"url": "https://x.com/matt_vanswol"}
    )
    if created:
        print("✅ Profile 'matt_vanswol' criado")
    else:
        print("ℹ️ Profile 'matt_vanswol' já existia")

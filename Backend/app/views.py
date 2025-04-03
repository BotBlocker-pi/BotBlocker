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
    try:
        perfis = Profile.objects.all()
        serializer = ProfileShortSerializer(perfis, many=True)
        return Response({'perfis': serializer.data})
    except Exception as e:
        print(f"Error in get_perfis: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({"auth": True})


class CustomTokenObtainView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        print(f"Login attempt - Username: {username}")

        # Log all existing users for debugging
        from django.contrib.auth.models import User
        existing_users = User.objects.all()
        print("Existing users:")
        for user in existing_users:
            print(f"- {user.username}")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_settings(request):
    try:
        user_bb = User_BB.objects.get(user=request.user)
    except User_BB.DoesNotExist:
        return Response({'error': 'User_BB não encontrado para este utilizador'}, status=status.HTTP_400_BAD_REQUEST)


    settings, created = Settings.objects.get_or_create(
        user=user_bb,
        defaults={
            'tolerance': 50.0,
            'badge': Badge.EMPTY
        }
    )

    serializer = SettingsSerializer(settings)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_settings(request):
    try:
        user_bb = User_BB.objects.get(user=request.user)
    except (User_BB.DoesNotExist, Settings.DoesNotExist):
        return Response({'error': 'Settings or user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    settings, created = Settings.objects.get_or_create(
        user=user_bb,
        defaults={
            'tolerance': 50.0,
            'badge': Badge.EMPTY
        }
    )
    blocklist_data = request.data.pop('blocklist', None)

    serializer = SettingsSerializer(settings, data=request.data, partial=True)

    if serializer.is_valid():
        if blocklist_data is not None:
            settings.blocklist.clear()
            for profile_data in blocklist_data:
                try:
                    profile = Profile.objects.get(username=profile_data["username"], social__social=profile_data["social"])
                    settings.blocklist.add(profile)
                except Profile.DoesNotExist:
                    continue
        
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_evaluation_history(request):
    url = request.GET.get("url")
    print("url",url)
    username, platform = extractPerfilNameAndPlataformOfURL(url)
    print(username, platform)

    history = Evaluation.objects.filter(
        profile__username=username,
        profile__social__social=platform
    ).order_by('-created_at')

    serializer = EvaluationSerializer(history, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def createUserBB(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")

    if not username or not password or not email:
        return Response({"error": "Username, password and email are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if User_BB.objects.filter(email=email).exists():
        return Response({"error": "The email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)

    User_BB.objects.create(user=user, email=email)

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)

    return Response({"error": "Authentication failed after user creation"}, status=status.HTTP_400_BAD_REQUEST)

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


@api_view(['POST'])
def block_profile(request):
    try:
        # Get profile data from request
        username = request.data.get('username')
        platform = request.data.get('platform', 'x')  # Default to X/Twitter if not specified

        if not username:
            return Response({'error': 'É necessário fornecer um nome de utilizador'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create the profile
        social_instance, _ = Social.objects.get_or_create(social=platform)
        profile, created = Profile.objects.get_or_create(
            username=username,
            social=social_instance,
            defaults={"url": f"https://{platform}.com/{username}"}
        )

        return Response({
            'success': True,
            'message': f'Perfil {username} bloqueado com sucesso',
            'profile': {
                'id': str(profile.id),
                'username': profile.username,
                'platform': platform
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error in block_profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def unblock_profile(request):
    try:
        # Get profile data from request
        username = request.data.get('username')
        platform = request.data.get('platform', 'x')  # Default to X/Twitter if not specified

        if not username:
            return Response({'error': 'É necessário fornecer um nome de utilizador'}, status=status.HTTP_400_BAD_REQUEST)

        # Find the profile
        try:
            social = Social.objects.get(social=platform)
            profile = Profile.objects.get(username=username, social=social)
        except (Social.DoesNotExist, Profile.DoesNotExist):
            return Response({'error': 'Perfil não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'message': f'Perfil {username} desbloqueado com sucesso'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in unblock_profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
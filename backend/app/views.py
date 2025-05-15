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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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
    print("url", url)

    # Rejeitar URLs de página inicial
    if "/home" in url:
        return JsonResponse({'error': 'Invalid page'}, status=400)

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
            # get user role
            user_bb = User_BB.objects.filter(user=user).first()
            role = user_bb.role if user_bb else None
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": role,
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

# FORMAT TO CREATE USER
#{
#    "username": "rita",
#    "email": "1234@exemplo.com",
#    "role": "verifier",
#    "password": "12345678",
#    "settings": {
#        "tolerance": 50.0,
#        "badge": "empty",
#        "blocklist" : []
#    }
#}

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



@api_view(['GET'])
def get_users(request):
    try:
        users = User_BB.objects.all()
        serializer = UserBBSerializer(users, many=True)
        return Response({'users': serializer.data})
    except Exception as e:
        print(f"Error in get_users: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_users_detailed(request):
    try:
        users = User_BB.objects.all().order_by('-created_at')
        serializer = UserBBDisplaySerializer(users, many=True)
        return Response({'users': serializer.data})
    except Exception as e:
        print(f"Error in get_users_detailed: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_user(request, id):
    try:
        user = User_BB.objects.get(id=id)
        serializer = UserBBSerializer(user)
        return Response({'user': serializer.data})
    except User_BB.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['PUT'])
def update_user(request, id):
    try:
        user = User_BB.objects.get(id=id)
        serializer = UserBBSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'user': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User_BB.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in update_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['DELETE'])
def delete_user(request, id):
    try:
        user = User_BB.objects.get(id=id)
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User_BB.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_evaluations(request):
    try:
        evaluations = Evaluation.objects.all()
        serializer = EvaluationSerializer(evaluations, many=True)
        return Response({'evaluations': serializer.data})
    except Exception as e:
        print(f"Error in get_evaluations: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_profile(request, username):
    try:
        profile = Profile.objects.get(username=username)
        serializer = ProfileShortSerializer(profile)
        return Response({'profile': serializer.data})
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def give_badge(request):
    try:
        profile_id = request.data.get('user_id')
        badge = request.data.get('badge')

        try:
            profile = Profile.objects.get(id=profile_id)
        except User_BB.DoesNotExist:
            return Response({'error': 'Perfil não encontrado para este utilizador'}, status=status.HTTP_400_BAD_REQUEST)

        profile.badge = badge
        profile.save()

        return Response({'success': True, 'message': f'Badge {badge} atribuída com sucesso ao perfil {profile.username}'}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in give_badge: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def post_img(request):
    url = request.data.get('url')
    avatar = request.data.get('avatar')

    if not url or not avatar:
        return Response({'error': 'url and avatar are required'}, status=status.HTTP_400_BAD_REQUEST)

    print("url:", url)
    username, platform = extractPerfilNameAndPlataformOfURL(url)

    try:
        profile = Profile.objects.get(username=username, social__social=platform)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if profile.avatar_url == avatar:
        return Response({'message': 'Avatar already up to date'}, status=status.HTTP_200_OK)

    profile.avatar_url = avatar
    profile.save()

    return Response({'message': 'Avatar updated successfully'}, status=status.HTTP_200_OK)
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userWasVote(request):
    username = request.GET.get("username")
    platform = request.GET.get("platform")

    try:
        user_bb = User_BB.objects.get(user=request.user)
        print(f"Found User_BB: {user_bb.id}")
    except User_BB.DoesNotExist:
        print("User_BB not found for this user.")
        return Response({'error': 'User_BB não encontrado para este utilizador'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        was_vote = Evaluation.objects.filter(
            user=user_bb,
            profile__username=username,
            profile__social__social=platform
        ).exists()
        print(f"Vote exists: {was_vote}")
    except Exception as e:
        print(f"Error checking Evaluation: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'was_vote': was_vote}, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_suspicious_activities(request):
    user_bb = User_BB.objects.filter(user=request.user).first()
    
    if not user_bb or user_bb.role != "admin":
        return Response(
            {"error": "You are not authorized to view suspicious activities."},
            status=status.HTTP_403_FORBIDDEN
        )
    activities = SuspiciousActivity.objects.exclude(status="resolved").order_by('-created_at')
    serializer = SuspiciousActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_suspicious_activity_resolved(request, activity_id):
    try:
        activity = SuspiciousActivity.objects.get(id=activity_id)
    except SuspiciousActivity.DoesNotExist:
        return Response({"error": "Activity not found"}, status=status.HTTP_404_NOT_FOUND)

    activity.status = "resolved"
    activity.save()

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "admins",
        {
            "type": "activity_resolved",
            "activity_id": str(activity_id),
        }
    )

    return Response({"message": "Activity marked as resolved"}, status=status.HTTP_200_OK)




# if not User.objects.filter(username="admin").exists():
#     User.objects.create_superuser("admin", "admin@example.com", "12345")
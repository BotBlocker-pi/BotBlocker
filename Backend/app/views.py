import json
from django.http import JsonResponse
from django.shortcuts import render
from app.dtos import *
from app.models import *
from app.serializers import *
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response

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

@csrf_exempt
def criar_avaliacao(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)  
            print("Received Data:", data)  # Log the received data

            serializer = EvaluationSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=201)
            else:
                print("Validation Errors:", serializer.errors)  # Log validation errors
                return JsonResponse(serializer.errors, status=400)

        except Exception as e:
            print("Error:", str(e))  # Log any exceptions
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
def get_perfis(request):
    print("GET /perfis")
    perfis = Profile.objects.all()
    serializer = ProfileListSerializer(perfis, many=True)
    return Response({'perfis': serializer.data})  # Padronizando para sempre retornar um objeto com campo 'perfis'
    

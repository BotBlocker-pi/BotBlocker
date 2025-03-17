import json
from django.http import JsonResponse
from django.shortcuts import render
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

    body = json.loads(request.body.decode('utf-8'))
    url = body.get("url")
    print("url",url)
    username, platform = extractPerfilNameAndPlataformOfURL(url)
    print(username, platform)
    if not platform:
        return JsonResponse({'error': 'Invalid platform'}, status=400)

    if not Profile.objects.filter(username=username, social__social=platform).exists():
        create_profile(username, platform)

    serializer = ProfileDTO(username, platform)
    return JsonResponse(serializer.initial_data, safe=False)
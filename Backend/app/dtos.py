from rest_framework import serializers
from .models import Profile,Evaluation,Social
from urllib.parse import urlparse

def extractPerfilNameAndPlataformOfURL(url: str):
    parsed_url = urlparse(url)

    social_platforms = {
        'instagram': ['instagram.com'],
        'linkedin': ['linkedin.com'],
        'x': ['x.com', 'twitter.com']
    }

    plataforma = None
    for key, domains in social_platforms.items():
        if any(domain in parsed_url.netloc.lower() for domain in domains):
            plataforma = key
            break

    path_segments = parsed_url.path.strip("/").split("/")

    perfil_name = None

    if plataforma == 'x' and path_segments:
        perfil_name = path_segments[0]

    elif plataforma == 'linkedin':
        # Suporta linkedin.com/in/..., linkedin.com/company/... e linkedin.com/school/...
        if len(path_segments) >= 2 and path_segments[0] in ['in', 'company', 'school']:
            perfil_name = path_segments[1]

    elif plataforma == 'instagram' and path_segments:
        perfil_name = path_segments[0]

    return perfil_name, plataforma

class ProfileDTO(serializers.Serializer):
    perfil_name= serializers.CharField() 
    plataform = serializers.CharField() 
    badge = serializers.CharField()
    probability = serializers.FloatField()
    numberOfEvaluations = serializers.IntegerField()
    avatar_url = serializers.URLField()

    def __init__(self, username, social__social):
        try:
            profile = Profile.objects.get(username=username, social__social=social__social)
        except Profile.DoesNotExist:
            raise ValueError(f"Profile with {username, social__social} not found.")

        probability = profile.percentage
        total_evaluations = Evaluation.objects.filter(profile=profile).count()

        data = {
            "perfil_name": profile.username,
            "plataform": profile.social.social,
            "badge": profile.badge,
            "probability": probability, 
            "numberOfEvaluations":total_evaluations,
            "avatar_url":profile.avatar_url
        }

        super().__init__(data=data)


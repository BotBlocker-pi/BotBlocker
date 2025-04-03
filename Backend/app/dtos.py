from rest_framework import serializers
from .models import Profile,Evaluation,Social
from urllib.parse import urlparse

def extractPerfilNameAndPlataformOfURL(url: str):
    # Make sure url is a string, not bytes
    if isinstance(url, bytes):
        url = url.decode('utf-8')

    parsed_url = urlparse(url)

    # Convert netloc to string if it's bytes
    netloc = parsed_url.netloc
    if isinstance(netloc, bytes):
        netloc = netloc.decode('utf-8')

    social_platforms = {
        'instagram': ['instagram'],
        'linkedin': ['linkedin'],
        'x': ['x.com', 'twitter']
    }

    plataform = None
    for key, values in social_platforms.items():
        if any(value in netloc.lower() for value in values):
            plataform = key
            break

    # Convert path to string if it's bytes
    path = parsed_url.path
    if isinstance(path, bytes):
        path = path.decode('utf-8')

    path_segments = path.strip("/").split("/")
    perfil_name = path_segments[-1] if path_segments else None

    return perfil_name, plataform

class ProfileDTO(serializers.Serializer):
    perfil_name= serializers.CharField() 
    plataform = serializers.CharField() 
    badge = serializers.CharField()
    probability = serializers.FloatField()
    numberOfEvaluations = serializers.IntegerField()

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
            "numberOfEvaluations":total_evaluations
        }

        super().__init__(data=data)


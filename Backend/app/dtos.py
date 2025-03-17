from rest_framework import serializers
from .models import Profile,Evaluation,Social
from urllib.parse import urlparse

def extractPerfilNameAndPlataformOfURL(url: str):
    parsed_url = urlparse(url)
    social_platforms = {
        'instagram': ['instagram'],
        'linkedin': ['linkedin'],
        'x': ['x.com', 'twitter']
    }

    plataform = None
    for key, values in social_platforms.items():
        if any(value in parsed_url.netloc.lower() for value in values):
            plataform = key
            break

    path_segments = parsed_url.path.strip("/").split("/")
    perfil_name = path_segments[-1] if path_segments else None  
    
    return perfil_name,plataform

class ProfileDTO(serializers.Serializer):
    perfil_name= serializers.CharField() 
    plataform = serializers.CharField() 
    badge = serializers.CharField()
    probability = serializers.FloatField()

    def __init__(self, username, social__social):
        try:
            profile = Profile.objects.get(username=username, social__social=social__social)
        except Profile.DoesNotExist:
            raise ValueError(f"Profile with {username, social__social} not found.")

        total_evaluations = Evaluation.objects.filter(profile=profile).count()
        bot_evaluations = Evaluation.objects.filter(profile=profile, is_bot=True).count()
        
        probability = (bot_evaluations / total_evaluations) * 100 if total_evaluations > 0 else 0

        data = {
            "perfil_name": profile.username,
            "plataform": profile.social.social,
            "badge": profile.badge,
            "probability": probability, 
        }

        super().__init__(data=data)

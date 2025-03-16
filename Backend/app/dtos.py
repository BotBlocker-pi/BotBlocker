from rest_framework import serializers
from .models import Profile,Evaluation
from urllib.parse import urlparse

def extractPerfilNameAndPlataformOfURL(url: str):
    parsed_url = urlparse(url)
    plataform = parsed_url.netloc
    path_segments = parsed_url.path.strip("/").split("/")
    perfil_name = path_segments[-1] if path_segments else None  
    
    return perfil_name,plataform

class ProfileDTO(serializers.Serializer):
    perfil_name= serializers.CharField() 
    plataform = serializers.CharField() 
    badge = serializers.CharField()
    percentage = serializers.FloatField()

    def __init__(self, url):
        try:
            profile = Profile.objects.get(url=url)
        except Profile.DoesNotExist:
            raise ValueError(f"Profile with URL {url} not found.")

        perfil_name, plataform = extractPerfilNameAndPlataformOfURL(url)
        total_evaluations = Evaluation.objects.filter(profile=profile).count()
        bot_evaluations = Evaluation.objects.filter(profile=profile, is_bot=True).count()
        
        percentage = (bot_evaluations / total_evaluations) * 100 if total_evaluations > 0 else 0

        data = {
            "perfil_name": perfil_name,
            "plataform": plataform,
            "badge": profile.badge,
            "percentage": percentage, 
        }

        super().__init__(data=data)

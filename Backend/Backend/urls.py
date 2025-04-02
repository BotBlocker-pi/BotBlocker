"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app.views import *

urlpatterns = [
]
urlpatterns = [
    path('admin/', admin.site.urls),
    path('get_probability/', get_probability, name='get_probability'),
    path('avaliacao/', criar_avaliacao, name='criar_avaliacao'),
    path('perfis/', get_perfis, name='get_perfis'),
    path('get_settings/', get_settings, name='get_settings'),
    path('update_settings/', update_settings, name='update_settings'),
    path("api/token/", CustomTokenObtainView.as_view(), name="token_obtain"),
    path('api/protected/',ProtectedView.as_view(),name="ProtectedView"),
    path('block_profile/', block_profile, name='block_profile'),
    path('unblock_profile/', unblock_profile, name='unblock_profile'),
]

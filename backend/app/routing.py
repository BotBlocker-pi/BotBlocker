from django.urls import path
from app.consumers import NotificationConsumer
print("\n"*10)
print("Route")
print("\n"*10)
websocket_urlpatterns = [
    path("notificacoes/admins/",NotificationConsumer.as_asgi()),
]

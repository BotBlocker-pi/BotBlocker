

Criar .venv:
pip install virtualenv
virtualenv .venv
Abrir:
.venv\Scripts\activate

Ou
source .venv/bin/activate

Instalar:
pip install django-cors-headers


Executar o backand:

python manage.py makemigrations
python manage.py migrate    
python .\manage.py runserver  


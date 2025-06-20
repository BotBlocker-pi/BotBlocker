# 🛡️ BotBlocker

**BotBlocker** é uma aplicação que combina backend (Django), frontend e uma extensão do Chrome para bloquear ou desfocar conteúdo indesejado no Instagram, como bots e spam.

---

## ⚙️ Requisitos

Antes de começar, garante que tens o seguinte instalado no teu sistema:

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* [Git](https://git-scm.com/)

---

## 🚀 Como executar o projeto com Docker (modo produção)

### 1️⃣ Clona o repositório

```bash
git clone git@github.com:BotBlocker-pi/BotBlocker.git
cd BotBlocker
```

### 2️⃣ Cria o ficheiro `.env`

Na pasta `Docker/`, cria um ficheiro chamado `.env` com o seguinte conteúdo:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_LOGLEVEL=INFO
DJANGO_ALLOWED_HOSTS=localhost,yourdomain.com,api.yourdomain.com,127.0.0.1

DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=your_database_name
DATABASE_USERNAME=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_HOST=db
DATABASE_PORT=5432

VITE_API_URL=http://api.yourdomain.com

CORS_ALLOWED_ORIGINS=http://dashboard.yourdomain.com,http://localhost
```

> 📁 Podes usar o ficheiro `.env.example` como modelo.

---

### 3️⃣ Inicia os serviços com Docker Compose

A partir da raiz do projeto, executa o seguinte comando:

```bash
docker compose -f Docker/docker-compose.production.yml up --build
```

Este comando:

* Constrói e inicia os containers (backend, base de dados, etc.)
* Aplica as variáveis de ambiente definidas no `.env`
* Prepara o projeto para acesso local ou remoto

---

## 🌐 Como instalar a extensão do Chrome

1. Abre o Chrome e vai para:

   ```
   chrome://extensions/
   ```

2. Ativa o **Modo de programador**

3. Clica em **"Carregar sem compactar"**

4. Seleciona a pasta `extension/`

> A extensão será carregada e ativa sempre que visitares o Instagram.

---

## 🛠 Tecnologias utilizadas

* Django (backend)
* PostgreSQL (base de dados)
* Docker & Docker Compose
* Chrome Extension (Manifest V3)
* (Opcional) Vite/React para dashboard

---

Desenvolvido por Equipa BotBlocker

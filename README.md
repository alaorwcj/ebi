# EBI Vila Paula

Sistema web para controle de usuarios, criancas, presencas e documentos do EBI.

## Primeira vez

Depois de clonar ou dar pull no repositório:

1. **Criar o arquivo `.env`**  
   Na raiz do projeto: `cp .env.example .env`  
   (O `.env` não é versionado; use o `.env.example` como modelo.)

**Quem usa Docker:**

2. **Subir tudo**  
   `docker compose up --build`  
   - Frontend: http://localhost:5173  
   - Backend: http://localhost:8000/docs  

3. **Rodar as migrations**  
   `docker compose run --rm backend alembic upgrade head`

4. **(Opcional)** Dados de exemplo:  
   `docker compose run --rm backend python -m app.seed`

5. **(Opcional)** Primeira coordenadora: ver seção "Bootstrap do usuario coordenadora" abaixo.

**Quem não usa Docker:** ver seção [Rodando sem Docker](#rodando-sem-docker) abaixo.


## Requisitos Sistema EBI Vila Paula

1. Cadastro de Usuarios (Administracao)

Esse cadastro tem a finalidade de registrar todas as pessoas que colaboram no EBI, sendo: Administrador, Coordenadoras e Colaboradoras.

Campos do Cadastro:

Obs.: O Administrador tem acesso ao menu "Usuarios" e cria/edita Coordenadoras e Colaboradoras. As Coordenadoras acessam relatorios.

Login: E-mail e senha alfanumerica com 8 caracteres;

2. Cadastro de Criancas e Responsaveis (multiplos)

Esse cadastro tem a finalidade de registrar todas as criancas e seus respectivos responsaveis que frequentam o EBI e a partir desse cadastro fornecer dados para os relatorios quantitativos.

Campos do Cadastro:

3. Registro de Presenca

Esta funcionalidade tem a a finalidade de registrar a presenca das criancas e responsaveis nos dias do EBI, essa funcao deve ter os seguintes campos:


Dados do EBI

Abaixo dos campos principais ter um botao para adicionar ou registrar presenca das criancas, contendo os seguintes dados na listagem:


Este EBI fica em aberto ate sua conclusao, ao registrar a presenca de uma crianca, o sistema deve considerar o horario de entrada;
Para concluir o trabalho do dia, deve ter na listagem um campo para registrar saida, quando o responsavel for retirar a crianca, o sistema deve abrir uma modal para confirmar a saida da crianca;
Após a saida de todas as criancas devera habilitar um botao "Encerrar EBI";
Após encerrar o EBI o sistema salva os dados e se houver necessidade devera ter um botao para gerar um relatorio do EBI na listagem exibindo todos os dados acima;

4. Relatorio Geral

O sistema deve ter uma funcao para gerar um relatorio geral do EBI contendo os seguintes dados no relatorio:

Para essa conta considerar:

5. Perfil e Documentos (Legislacao)

Cada colaboradora/coordenadora pode acessar "Meu Perfil" para atualizar dados pessoais e anexar documentos obrigatorios.

Campos do perfil:

Documentos obrigatorios (upload):

## Rodando sem Docker

Requisitos na máquina: **Python 3.11+**, **Node.js 20+**, **PostgreSQL** (rodando localmente).

1. **PostgreSQL**  
   Crie usuário e banco (veja [Configurar Postgres local](#configurar-postgres-local)).

2. **Arquivo `.env` na raiz**  
   `cp .env.example .env`  
   Para rodar sem Docker, use no `.env`:  
   `DB_HOST=localhost` (em vez de `db` ou `host.docker.internal`).

3. **Backend (na raiz do projeto)**  
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   PYTHONPATH=backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```  
   O backend usa o `.env` da raiz (por isso o `cd ..` antes do uvicorn).

4. **Migrations (em outro terminal)**  
   Na raiz do projeto, com o venv do backend ativado e o `.env` na raiz:  
   ```bash
   cd backend
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   PYTHONPATH=backend alembic -c backend/alembic.ini upgrade head
   ```  
   Assim o Alembic usa o `.env` da raiz. Se preferir, copie o `.env` para `backend/.env` e rode `cd backend && alembic upgrade head`.

5. **Frontend (em outro terminal)**  
   ```bash
   cd frontend
   npm install
   npm run dev
   ```  
   Acesse: http://localhost:5173

6. **(Opcional)** Seed: `cd backend && source .venv/bin/activate && python -m app.seed`  
7. **(Opcional)** Primeira coordenadora: ver "Bootstrap do usuario coordenadora".


## Requisitos

## Guia passo a passo (Windows e Linux, com ou sem WSL)

### 1) Instalar Postgres local

Windows (sem WSL)

Linux (sem WSL)
```bash
sudo apt update && sudo apt install -y postgresql
sudo service postgresql start
```

WSL (Ubuntu)
```bash
sudo apt update && sudo apt install -y postgresql
sudo service postgresql start
```

### 2) Configurar Postgres para conexoes externas

Linux/WSL:
```bash
sudo sed -i "s|^#listen_addresses.*|listen_addresses = '*'|" /etc/postgresql/16/main/postgresql.conf
sudo sed -i "s|^listen_addresses.*|listen_addresses = '*'|" /etc/postgresql/16/main/postgresql.conf
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf
sudo pg_ctlcluster 16 main restart
```

Windows:

### 3) Criar usuario e banco

```sql
CREATE USER ebi_user WITH PASSWORD 'ebi_pass';
CREATE DATABASE ebi_vila_paula OWNER ebi_user;
GRANT ALL PRIVILEGES ON DATABASE ebi_vila_paula TO ebi_user;
```

### 4) Definir DB_HOST correto

Windows (Postgres instalado no Windows):
```
DB_HOST=host.docker.internal
```

Linux sem WSL:
```
DB_HOST=host.docker.internal
```

WSL:
```bash
hostname -I | awk '{print $1}'
```
Use o IP retornado no `.env` como `DB_HOST`.

### 5) Variaveis de ambiente (.env)

```
APP_SECRET_KEY=change_me
DB_HOST=<SEU_DB_HOST>
DB_PORT=5432
DB_NAME=ebi_vila_paula
DB_USER=ebi_user
DB_PASS=ebi_pass
VITE_API_URL=http://localhost:8000/api/v1
ALLOW_BOOTSTRAP=true
```

### 6) Subir containers

```bash
docker compose up -d --build
```

### 7) Rodar migrations

```bash
docker compose run --rm -e PYTHONPATH=/app backend alembic upgrade head
```

### 8) Popular banco (opcional)

```bash
docker compose run --rm -e PYTHONPATH=/app backend python -m app.seed
```

### 9) Acessar a aplicacao

Credenciais do seed:
- Administrador: admin@ebi.local / admin123
- Coordenadora: coord@ebi.local / coord123
- Colaboradora: colab@ebi.local / colab123

### Observacoes por ambiente

Linux (Postgres local)

WSL

```bash
docker compose down
docker compose up -d
```

## Bootstrap do usuario coordenadora
Se o banco estiver vazio e `ALLOW_BOOTSTRAP=true`:

```bash
curl -X POST http://localhost:8000/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin","email":"admin@ebi.local","phone":"11999999999","group_number":1,"password":"admin123"}'
```

Depois disso, use o login na tela inicial. (Obs.: o Administrador e criado via seed.)

## Checklist rapido de validacao
- Login como Administrador
- Cadastrar coordenadoras e colaboradoras
- Cadastrar criancas
- Criar EBI (data/grupo/coordenadora/colaboradoras)
- Registrar presencas e saidas
- Encerrar EBI apenas quando todas as saidas estiverem registradas
- Reabrir EBI (opcional) e registrar auditoria
- Gerar relatorio do EBI
- Gerar relatorio geral (somente coordenadora)
- Atualizar perfil e anexar documentos obrigatorios

## Modificacoes e adicoes recentes

- Perfil do usuario com dados pessoais e anexos obrigatorios
- Administrador com menu "Usuarios" para criar/editar coordenadoras e colaboradoras
- Multiplos responsaveis por crianca
- PIN de 4 digitos gerado na entrada e exigido na saida
- Preparacao para envio do PIN via WhatsApp (Meta Cloud API)

## WhatsApp (Meta Cloud API)

O envio do PIN via WhatsApp esta preparado, mas desativado por padrao.
Para ativar, configure as variaveis no `.env` e aprove um template na Meta.

Requisitos:
- Numero WhatsApp Business verificado
- Template aprovado (mensagem fora da janela de 24h exige template)
- Consentimento do responsavel para receber mensagens

Variaveis:
- WHATSAPP_ENABLED=true
- WHATSAPP_API_VERSION=v19.0
- WHATSAPP_PHONE_NUMBER_ID=<id_do_numero>
- WHATSAPP_ACCESS_TOKEN=<token>
- WHATSAPP_TEMPLATE_NAME=<nome_do_template>
- WHATSAPP_TEMPLATE_LANGUAGE=pt_BR
- WHATSAPP_DEFAULT_COUNTRY_CODE=55

Formato do telefone:
- Ideal: E.164 (ex: +5511999999999)
- Se vier sem +, o sistema adiciona o codigo do pais configurado

Template sugerido (body, 2 parametros):
1) Nome da crianca
2) PIN de 4 digitos

Fluxo:
- Registro de entrada gera PIN e envia via WhatsApp (best-effort)
- Se o envio falhar, o fluxo da entrada continua normalmente
## Estrutura do projeto

```
/backend
  /app
    /api
    /core
    /models
    /schemas
    /services
    /repositories
  /alembic
  /tests
/frontend
  /src
/docker-compose.yml
README.md
```

## Observacoes de timezone
Horarios sao armazenados em UTC no banco. A UI converte para America/Sao_Paulo para exibicao.

# EBI Vila Paula

Sistema web para controle de colaboradoras, criancas e presencas do EBI.

## Requisitos Sistema EBI Vila Paula

1. Cadastro de Colaboradoras

Esse cadastro tem a finalidade de registrar todas as irmas que colaboram o no EBI, sendo: Coordenadoras ou Colaboradoras.

Campos do Cadastro:
- a. Nome Completo - Campo Texto
- b. Funcao - Campo select sendo 1. Coordenadora e 2. Colaboradora;
- c. Grupo: Campo select de 1 a 4;
- d. Contato - Campo com mascara de celular
- e. E-mail - Campo com mascara de e-mail

Obs.: As irmas Coordenadoras devem ter acesso ao sistema com a finalidade de gerar relatorios e fornecer dados quantitativos para conhecimento do ministerio e a secretaria do EBI na regiao;

Login: E-mail e senha alfanumerica com 8 caracteres;

2. Cadastro de Criancas e Responsaveis

Esse cadastro tem a finalidade de registrar todas as criancas e seus respectivos responsaveis que frequentam o EBI e a partir desse cadastro fornecer dados para os relatorios quantitativos.

Campos do Cadastro:
- a. Nome da Crianca - Campo Texto
- b. Nome do responsavel - Campo Texto
- c. Contato - Campo com mascara de celular

3. Registro de Presenca

Esta funcionalidade tem a a finalidade de registrar a presenca das criancas e responsaveis nos dias do EBI, essa funcao deve ter os seguintes campos:

- Ao clicar nesse menu o sistema deve abrir uma listagem com os EBIS realizados e deve ter um botao acima da listagem "Criar EBI";
- Ao clicar no botao Criar EBI o sistema direciona para uma tela com os seguintes dados:

Dados do EBI
- Data: XX/XX/XXXX
- Grupo: Campo select de 1 a 4;
- Coordenadora: Campo select puxando do cadastro;
- Colaboradoras presentes: Campo select puxando do cadastro;

Abaixo dos campos principais ter um botao para adicionar ou registrar presenca das criancas, contendo os seguintes dados na listagem:

- a. Nome da Crianca
- b. Nome do Responsavel - Vinculado ao cadastro da crianca, caso seja um responsavel diferente do cadastro, permitir ao usuario a possibilidade de editar o nome para o dia;
- c. Contato: Vinculado ao cadastro do responsavel, caso seja outro responsavel permitir editar;
- d. Horario de entrada
- e. Horario de saida

Este EBI fica em aberto ate sua conclusao, ao registrar a presenca de uma crianca, o sistema deve considerar o horario de entrada;
Para concluir o trabalho do dia, deve ter na listagem um campo para registrar saida, quando o responsavel for retirar a crianca, o sistema deve abrir uma modal para confirmar a saida da crianca;
Após a saida de todas as criancas devera habilitar um botao "Encerrar EBI";
Após encerrar o EBI o sistema salva os dados e se houver necessidade devera ter um botao para gerar um relatorio do EBI na listagem exibindo todos os dados acima;

4. Relatorio Geral

O sistema deve ter uma funcao para gerar um relatorio geral do EBI contendo os seguintes dados no relatorio:

- a. Coordenadoras Cadastradas
- b. Colaboradoras Cadastradas
- c. Grupos
- d. Media mensal e anual de presenca
Para essa conta considerar:
- Mensal: Total de presenca do mes / Total de EBIs no mes
- Anual: Total de presenca do ano / Total de EBIs no ano
- e. Grafico de barras com a quantidade de presenca dos ultimos 3 meses
- f. Grafico de media de presenca dos ultimos 12 meses;

## Requisitos
- Docker + Docker Compose
- PostgreSQL local (fora do Docker)
- Node.js opcional para rodar frontend sem Docker

## Configurar Postgres local
1) Crie usuario e banco:

```sql
CREATE USER ebi_user WITH PASSWORD 'ebi_pass';
CREATE DATABASE ebi_vila_paula OWNER ebi_user;
GRANT ALL PRIVILEGES ON DATABASE ebi_vila_paula TO ebi_user;
```

2) Garanta que o Postgres esteja escutando em 5432 e acessivel pelo host.

## Variaveis de ambiente
Crie um arquivo `.env` na raiz (opcional) e ajuste se necessario:

```
APP_SECRET_KEY=change_me
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=ebi_vila_paula
DB_USER=ebi_user
DB_PASS=ebi_pass
VITE_API_URL=http://localhost:8000/api/v1
ALLOW_BOOTSTRAP=true
```

## Subir containers

```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8000/docs

## Linux (Postgres local)
- Opcao 1 (padrao no compose): `extra_hosts` com `host-gateway`.
- Opcao 2: usar `network_mode: "host"` no servico backend (remover `ports`).

## Rodar migrations (Alembic)

```bash
docker compose run --rm backend alembic upgrade head
```

## Seed opcional (dados de exemplo)

```bash
docker compose run --rm backend python -m app.seed
```

## Bootstrap do usuario coordenadora
Se o banco estiver vazio e `ALLOW_BOOTSTRAP=true`:

```bash
curl -X POST http://localhost:8000/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin","email":"admin@ebi.local","phone":"11999999999","group_number":1,"password":"admin123"}'
```

Depois disso, use o login na tela inicial.

## Checklist rapido de validacao
- Criar coordenadora (bootstrap) e fazer login
- Cadastrar colaboradoras
- Cadastrar criancas
- Criar EBI (data/grupo/coordenadora/colaboradoras)
- Registrar presencas e saidas
- Encerrar EBI apenas quando todas as saidas estiverem registradas
- Reabrir EBI (opcional) e registrar auditoria
- Gerar relatorio do EBI
- Gerar relatorio geral (somente coordenadora)

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

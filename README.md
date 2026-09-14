# Gêmeas Cerimonial — Supabase e Render

Projeto reorganizado a partir do ZIP enviado. As telas mantêm a marca “Tá Marcado” do original. O servidor Node.js atende as páginas e a API no mesmo Web Service; os dados são persistidos no PostgreSQL do Supabase.

**Endereço configurado:** https://gemeas-cerimonial-dgbq.onrender.com

Esta entrega contém os arquivos e o SQL preparados e testados localmente. Nenhuma alteração foi aplicada à sua conta do Supabase, ao repositório ou ao serviço do Render.

## 1. Criar as tabelas no Supabase

1. Abra o projeto que você já criou no Supabase.
2. Entre em **SQL Editor → New query**.
3. Abra `supabase/migrations/001_initial.sql` desta pasta, copie o conteúdo inteiro, cole no editor e clique em **Run**.
4. Em **Table Editor**, confira as seis tabelas: `users`, `sessions`, `events`, `access`, `guests` e `gifts`.

O script cria tabelas, índices, relacionamentos, restrições e habilita RLS. Não insere contas de teste nem apaga tabelas. Destina-se a um projeto sem tabelas conflitantes com esses nomes. Se você já tiver tabelas próprias com esses nomes, compare a estrutura antes de executar: `IF NOT EXISTS` não corrige tabelas antigas.

O login foi preservado no servidor Node, com senhas derivadas por scrypt e sessões em cookie. **As contas são criadas pelo site e ficam em `public.users`; não aparecem em Authentication → Users.** Não é necessário configurar Supabase Auth, chave anon ou service_role nesta versão. As permissões de organizador/cerimonialista são verificadas pela API. RLS e revogação de privilégios bloqueiam acesso direto às tabelas pela API pública do Supabase; a conexão de servidor usa o usuário `postgres` da URI, que tem privilégios administrativos.

## 2. Obter a conexão

1. No Supabase, clique em **Connect**.
2. Selecione a conexão **Session pooler**, porta **5432**, e copie a URI completa.
3. Substitua o marcador de senha pela senha do banco definida na criação do projeto. Ela é diferente da senha da sua conta Supabase.
4. Se houver caracteres especiais na senha, use a representação codificada para URL. Por exemplo, `@` vira `%40` e `#` vira `%23`.

Guarde essa URI somente na variável `DATABASE_URL` do Render ou no `.env` local. Ela não deve entrar no GitHub nem em arquivos HTML/JavaScript do navegador.

O código usa TLS com verificação de certificado. Se houver erro de cadeia de certificados, utilize o certificado CA disponibilizado pelo Supabase em `DATABASE_CA_CERT`, em formato PEM; a variável aceita quebras de linha reais ou `\n`. Não desative a validação TLS.

Referência: [conexões PostgreSQL do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## 3. Atualizar o Web Service existente no Render

1. Coloque **o conteúdo desta pasta** na raiz do repositório conectado ao seu Web Service. `package.json`, `package-lock.json`, `server.mjs` e `public/` precisam ficar no mesmo nível. Substitua os arquivos antigos correspondentes; preserve configurações próprias do repositório que não fazem parte desta entrega.
2. Faça commit e envie para a branch que o Render acompanha.
3. No serviço `gemeas-cerimonial-dgbq`, em **Settings**, ajuste:

| Campo | Valor |
|---|---|
| Runtime | Node |
| Root Directory | Em branco se os arquivos estiverem na raiz; caso contrário, a subpasta que contém `package.json` |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

4. Em **Environment**, cadastre:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `APP_ORIGIN` | `https://gemeas-cerimonial-dgbq.onrender.com` |
| `DATABASE_URL` | URI Session pooler preenchida com a senha do banco |

5. Salve as variáveis e execute **Manual Deploy → Deploy latest commit**, se um deploy não tiver sido disparado automaticamente.
6. Após o deploy, abra `https://gemeas-cerimonial-dgbq.onrender.com/health`. O resultado deve ser `ok`.

O servidor usa `0.0.0.0` e a variável `PORT` fornecida pelo Render. Não precisa de disco persistente para o banco. Não envie apenas `public/`: o servidor Node também é necessário. O `render.yaml` incluído serve como referência/Blueprint; editar esse arquivo não configura automaticamente um serviço existente criado manualmente.

Referência: [Web Services no Render](https://render.com/docs/web-services).

## 4. Criar a primeira conta

Abra a página inicial e preencha **Criar conta e evento**. Em seguida:

1. Cadastre um convidado no painel.
2. Abra o convite individual em uma janela anônima e confirme presença.
3. Cadastre e reserve um presente.
4. Atualize o painel para conferir os dados.
5. Em **Acesso do cerimonialista**, crie/autorize a conta que poderá consultar esse evento. O cerimonialista entra pelo perfil correspondente na página de login.

As antigas credenciais de demonstração não foram incluídas. O ZIP original não continha banco SQLite com dados; portanto não há contas ou convidados reais migrados nesta entrega.

## Estrutura e lógica

```text
public/                    Páginas públicas
  css/                     Estilos
  js/                      Interação das telas e chamadas da API
server.mjs                 HTTP, arquivos estáticos, cabeçalhos e health check
src/
  config.mjs               Porta, origem e configuração de cookies
  database.mjs             Pool PostgreSQL e transações
  repository.mjs           Criação de usuários, eventos e convidados
  passwords.mjs            Geração de IDs e proteção de senhas
  auth.mjs                 Sessões e permissões por evento
  validation.mjs           Validação de telefone, datas, textos e limites
  api.mjs                  Rotas e regras dos fluxos
supabase/migrations/       SQL versionado
scripts/migrate.mjs        Aplicação opcional do SQL pela linha de comando
tests/                     Testes automatizados de integração
docs/                      Explicação do banco e relatório de validação
```

Fluxo: navegador → `/api` no Render → validação/permissões → PostgreSQL no Supabase. O cliente nunca recebe a senha do banco. Escritas do mesmo evento são serializadas em transação, evitando inconsistências entre confirmação, recusa e reserva simultâneas.

## Executar e testar localmente

Requer Node.js 22.13 ou superior.

```sh
npm ci
```

Para os testes, basta `npm test`. Eles usam PostgreSQL embutido via PGlite, em memória, sem credenciais e sem acessar seu banco real.

Para abrir o site localmente, copie `.env.example` para `.env`, configure `DATABASE_URL` para um projeto de desenvolvimento e execute:

```sh
npm run db:migrate
npm start
```

Abra `http://localhost:4173`. Não abra o HTML diretamente. O comando de migração é alternativa ao SQL Editor, não é necessário executá-lo novamente se você já criou as tabelas pelo editor. O `.env` local deve manter `APP_ORIGIN=http://localhost:4173`; no Render, use o endereço HTTPS informado acima.

## Problemas comuns

| Sintoma | O que verificar |
|---|---|
| `relation users does not exist` | Execute o SQL no mesmo projeto indicado por `DATABASE_URL` |
| Erro de senha ou conexão | Confira usuário, host, senha codificada e Session pooler 5432 |
| Erro de certificado | Configure o certificado CA correto em `DATABASE_CA_CERT` |
| Origem/Host inválido | `APP_ORIGIN` deve ser exatamente o domínio usado no navegador, sem barra final |
| Página abre sem estilos | Envie a estrutura inteira, preservando `public/css/` e `public/js/` |
| Conta de teste não entra | Crie sua conta na página inicial; não há contas pré-criadas |
| A interface ainda é a antiga | Confirme branch, commit e Root Directory no Render |

## Limites atuais

Não inclui recuperação de senha, verificação de e-mail, pagamento ou envio automático de WhatsApp. O WhatsApp abre uma mensagem para envio manual. O limitador de tentativas é em memória e usa o endereço do par da conexão; atrás do proxy do Render, vários usuários podem compartilhar o mesmo limite. Escala com múltiplas instâncias e limitação distribuída precisam de configuração adicional. Os testes locais não validam suas credenciais, certificados, plano ou deploy real; a checagem `/health` e o fluxo após publicar completam essa validação.

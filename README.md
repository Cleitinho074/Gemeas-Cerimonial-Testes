# Tá Marcado — site institucional

Landing page + protótipos de painel para o produto **Tá Marcado**, baseados no documento de requisitos (MVP de confirmação de presença + lista de presentes).

## Estrutura de arquivos

O CSS e o JS ficam organizados em `css/` e `js/`. Pra publicar sem quebrar o caminho, siga o passo a passo de upload logo abaixo — o pulo do gato é selecionar tudo (pastas e arquivos) de uma vez só e arrastar junto para o GitHub.

```
ta-marcado/
├── index.html            → página principal (landing page)
├── login.html            → tela de entrada com abas Organizador(a) / Cerimonialista
├── painel.html           → painel da noiva (um evento, edição liberada)
├── cerimonialista.html   → painel da cerimonialista (vários eventos, somente leitura)
├── convite.html          → página pública que o convidado vê ao abrir o link
├── css/
│   ├── style.css          → "mestre": só importa tokens.css, base.css e components.css, nessa ordem
│   ├── tokens.css         → variáveis de cores, fontes e espaçamentos (mude aqui pra trocar a identidade visual toda)
│   ├── base.css           → reset, tipografia, header e hero
│   ├── components.css     → blocos visuais da página principal (convite, cards, etc.)
│   ├── login.css          → estilos do login.html
│   ├── painel.css         → estilos do painel.html (cards, tabela, modal de convite) — reaproveitado pelo cerimonialista.html
│   ├── cerimonialista.css → estilos exclusivos do cerimonialista.html (grid de eventos, detalhe)
│   └── convite.css        → estilos do convite.html (cartão mobile, etapas)
├── js/
│   ├── main.js             → animações de scroll, convite-envelope e formulário "Criar meu evento"
│   ├── login.js            → alterna a aba de papel e redireciona pro painel certo
│   ├── painel.js           → dados de exemplo, filtros da tabela e gerador de mensagem de WhatsApp
│   ├── cerimonialista.js   → lista de eventos de exemplo e tabela de convidados em modo leitura
│   └── convite.js          → lógica das 3 etapas de confirmação de presença
└── README.md
```

Nenhuma build tool é necessária — é HTML/CSS/JS puro. Basta abrir `index.html` no navegador ou publicar todos os arquivos juntos.

## Como publicar

- **Netlify / Vercel**: arraste a pasta `ta-marcado` inteira (com `css/` e `js/` dentro) na área de deploy.
- **GitHub**: veja o passo a passo abaixo — o método que funciona sem quebrar caminho é selecionar tudo junto no Explorador de Arquivos e arrastar de uma vez para a área de upload do navegador.
- **Hospedagem tradicional (cPanel, FTP)**: envie a pasta inteira pra pasta pública (geralmente `public_html`), mantendo `css/` e `js/` como estão.

Não é necessário renomear nada — o `index.html` já é reconhecido como página inicial pela maioria dos serviços.

### Passo a passo pra subir no GitHub sem quebrar os caminhos

1. Descompacte o zip no computador.
2. Se já existir algo no repositório, apague tudo primeiro (abra cada arquivo/pasta antiga e delete).
3. No repositório, clique em **Add file → Upload files**.
4. Abra a pasta `ta-marcado` descompactada no Explorador de Arquivos, aperte **Ctrl+A** pra selecionar tudo (as pastas `css`, `js`, `assets` e os arquivos `.html`/`README.md`) e **arraste tudo junto** pra área de upload do navegador.
5. Confira se a lista que aparece mostra os caminhos certos, tipo `css/style.css`, `js/main.js` — se aparecer assim, a estrutura foi preservada.
6. Desça até o campo de mensagem de commit, escreva algo como "organiza projeto em pastas" e clique em **Commit changes**.

Use Chrome ou Edge — são os navegadores que preservam a estrutura de pastas ao arrastar.

## Como mexer no código

- **Trocar cores ou fontes** → edite só `tokens.css`. Todo o resto do CSS usa essas variáveis (`var(--green)`, `var(--gold)` etc.), então uma mudança ali reflete no site inteiro.
- **Trocar textos, títulos, seções da página principal** → edite `index.html`. Cada bloco tem um comentário `<!-- ===== NOME DA SEÇÃO ===== -->` indicando onde ele começa.
- **Mudar o comportamento do convite-envelope / formulário "Criar meu evento"** → `main.js`.
- **Ajustar a tabela, filtros ou o gerador de mensagem de WhatsApp do painel** → `painel.css` e `painel.js`.
- **Ajustar as 3 telas de confirmação de presença** → `convite.css` e `convite.js`.

## Sobre o login.html

Tela de entrada com duas abas — **Organizador(a) do evento** e **Cerimonialista**. É uma demonstração visual: qualquer e-mail e senha preenchidos passam, não existe verificação real ainda. Ao entrar, redireciona pra `painel.html` (noiva) ou `cerimonialista.html`, dependendo da aba escolhida.

## Sobre o cerimonialista.html

Lista todos os eventos que a cerimonialista atende — de contas de clientes diferentes — ordenados do mais próximo pro mais distante, com contadores rápidos (confirmados, recusados, pendentes, aprovação) em cada card. Ao clicar num evento, abre a lista de convidados **em modo somente leitura**: ela consegue ver e filtrar, mas não editar, aprovar convidados nem mandar convite — isso continua sendo trabalho exclusivo da noiva no painel dela.

Os eventos em `cerimonialista.js` (variável `EVENTS`) são dados fixos de exemplo. Na versão real, isso viria de uma tabela de relação entre cerimonialista e conta (uma cerimonialista pode atender várias contas; uma conta pode ter mais de uma cerimonialista vinculada) — é o requisito RN06 do documento, hoje só coberto pela regra de negócio, sem tela própria até agora.

## Sobre o painel.html

É um protótipo visual: os convidados em `painel.js` (variável `GUESTS`) são dados fixos de exemplo, não vêm de um banco de dados de verdade ainda. O botão **Convite** em cada linha abre uma mensagem de WhatsApp pronta (nome, data e link do evento) que a noiva pode editar antes de mandar — isso já funciona de verdade, sem precisar de servidor.

## Sobre o convite.html

É a página que o convidado abre ao clicar no link. Tem 3 telas: identificação por nome, confirmação (vou/não vou + detalhes) e uma tela final com resumo — respeitando o limite de "no máximo 3 telas" do documento de requisitos. Os nomes reconhecidos estão fixos em `convite.js` (variável `KNOWN_GUESTS`).

## Sobre os lembretes automáticos por WhatsApp

O card "Lembretes automáticos" no painel.html é só uma demonstração visual (90/60/30/15/7 dias antes + contagem regressiva diária). O envio automático de verdade depende de uma conta aprovada no WhatsApp Business API da Meta e de um servidor rodando todos os dias — é a etapa que vem depois que o painel tiver contas e dados reais.

## Próximos passos sugeridos

- Trocar os textos e números de exemplo pelo conteúdo real de cada evento.
- Conectar o formulário "Criar meu evento" e os painéis a um banco de dados de verdade, com login.
- Adicionar imagens reais dos presentes em `gift-thumb` (hoje são placeholders só com texto).

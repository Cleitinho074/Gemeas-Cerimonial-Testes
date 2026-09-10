# Tá Marcado — site institucional

Landing page + protótipos de painel para o produto **Tá Marcado**, baseados no documento de requisitos (MVP de confirmação de presença + lista de presentes).

## Estrutura de arquivos

Todos os arquivos ficam **soltos na raiz**, sem pastas — assim não tem risco de o upload pelo GitHub quebrar o caminho de novo.

```
ta-marcado/
├── index.html          → página principal (landing page)
├── painel.html          → painel do organizador (dados de exemplo)
├── convite.html         → página pública que o convidado vê ao abrir o link
├── style.css             → "mestre": só importa tokens.css, base.css e components.css, nessa ordem
├── tokens.css            → variáveis de cores, fontes e espaçamentos (mude aqui pra trocar a identidade visual toda)
├── base.css              → reset, tipografia, header e hero
├── components.css        → blocos visuais da página principal (convite, cards, etc.)
├── painel.css            → estilos do painel.html (cards, tabela, modal de convite)
├── convite.css           → estilos do convite.html (cartão mobile, etapas)
├── main.js               → animações de scroll, convite-envelope e formulário "Criar meu evento"
├── painel.js             → dados de exemplo, filtros da tabela e gerador de mensagem de WhatsApp
├── convite.js            → lógica das 3 etapas de confirmação de presença
└── README.md
```

Nenhuma build tool é necessária — é HTML/CSS/JS puro. Basta abrir `index.html` no navegador ou publicar todos os arquivos juntos.

## Como publicar

- **Netlify / Vercel**: arraste todos os arquivos (selecionados juntos) na área de deploy.
- **GitHub**: no repositório, `Add file → Upload files`, selecione todos os arquivos desse zip de uma vez e arraste — como não tem subpastas, não tem como o caminho quebrar.
- **Hospedagem tradicional (cPanel, FTP)**: envie todos os arquivos pra pasta pública (geralmente `public_html`).

Não é necessário renomear nada — o `index.html` já é reconhecido como página inicial pela maioria dos serviços.

## Como mexer no código

- **Trocar cores ou fontes** → edite só `tokens.css`. Todo o resto do CSS usa essas variáveis (`var(--green)`, `var(--gold)` etc.), então uma mudança ali reflete no site inteiro.
- **Trocar textos, títulos, seções da página principal** → edite `index.html`. Cada bloco tem um comentário `<!-- ===== NOME DA SEÇÃO ===== -->` indicando onde ele começa.
- **Mudar o comportamento do convite-envelope / formulário "Criar meu evento"** → `main.js`.
- **Ajustar a tabela, filtros ou o gerador de mensagem de WhatsApp do painel** → `painel.css` e `painel.js`.
- **Ajustar as 3 telas de confirmação de presença** → `convite.css` e `convite.js`.

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

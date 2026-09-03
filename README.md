# Tá Marcado — site institucional

Landing page de apresentação do produto **Tá Marcado**, baseada no documento de requisitos (MVP de confirmação de presença + lista de presentes).

## Estrutura de pastas

```
ta-marcado/
├── index.html          → página principal (landing page)
├── painel.html          → painel do organizador (dados de exemplo)
├── convite.html         → página pública que o convidado vê ao abrir o link
├── css/
│   ├── style.css         → arquivo "mestre": só importa tokens, base e components, nessa ordem
│   ├── tokens.css        → variáveis de cores, fontes e espaçamentos
│   ├── base.css          → reset, tipografia, header e hero
│   ├── components.css    → blocos visuais da página principal
│   ├── painel.css        → estilos do painel.html (cards, tabela, modal de convite)
│   └── convite.css       → estilos do convite.html (cartão mobile, etapas)
├── js/
│   ├── main.js            → animações de scroll, convite-envelope e formulário "Criar meu evento"
│   ├── painel.js          → dados de exemplo, filtros da tabela e gerador de mensagem de WhatsApp
│   └── convite.js         → lógica das 3 etapas de confirmação de presença
└── README.md
```

Nenhuma build tool é necessária — é HTML/CSS/JS puro. Basta abrir `index.html` no navegador ou publicar a pasta inteira.

## Como publicar

Qualquer serviço de hospedagem de site estático funciona, por exemplo:

- **Netlify / Vercel**: arraste a pasta `ta-marcado` inteira na área de deploy.
- **GitHub Pages**: suba a pasta para um repositório e ative o Pages nas configurações.
- **Hospedagem tradicional (cPanel, FTP)**: envie os arquivos para a pasta pública (geralmente `public_html`), mantendo a mesma estrutura de subpastas `css/` e `js/`.

Não é necessário renomear nada — o `index.html` já é reconhecido como página inicial pela maioria dos serviços.

## Como mexer no código

- **Trocar cores ou fontes** → edite só `css/tokens.css`. Todo o resto do CSS usa essas variáveis (`var(--green)`, `var(--gold)` etc.), então uma mudança ali reflete no site inteiro.
- **Trocar textos, títulos, seções** → edite `index.html`. Cada bloco tem um comentário `<!-- ===== NOME DA SEÇÃO ===== -->` indicando onde ele começa.
- **Mudar o comportamento do convite / animações** → `js/main.js`, com uma função para cada responsabilidade (`setupScrollReveal`, `setupEnvelopeHint`, `toggleEnvelope`).
- **Ajustar espaçamento, grid ou visual de um componente específico** (cards de presente, mockup de celular, painel etc.) → `css/components.css`, também dividido por comentários na mesma ordem em que os blocos aparecem na página.

## Sobre o painel.html

É um protótipo visual: os convidados em `js/painel.js` (variável `GUESTS`) são dados fixos de exemplo, não vêm de um banco de dados de verdade ainda. Serve pra validar o design (cards, filtros, tabela) antes de conectar com contas e dados reais. Está acessível pelo rodapé do site e pela tela de agradecimento do formulário "Criar meu evento".

No painel, o botão **Convite** em cada convidado abre uma mensagem de WhatsApp pronta (com nome, data e link do evento) que a noiva pode editar livremente antes de mandar — isso já funciona de verdade, sem precisar de servidor.

## Sobre o convite.html

É a página que o convidado abre ao clicar no link. Tem 3 telas: identificação por nome, confirmação (vou/não vou + detalhes) e uma tela final com resumo — respeitando o limite de "no máximo 3 telas" do documento de requisitos. Os nomes reconhecidos estão fixos em `js/convite.js` (variável `KNOWN_GUESTS`); na versão real, essa checagem viria do banco de dados pelo slug do link.

## Sobre os lembretes automáticos por WhatsApp

O card "Lembretes automáticos" no painel.html é só uma demonstração visual da ideia (90/60/30/15/7 dias antes + contagem regressiva diária nos últimos 7 dias). O envio automático de verdade não está implementado porque depende de duas coisas que um site estático não tem:

1. Uma conta aprovada no **WhatsApp Business API** da Meta (exige verificação de empresa e modelos de mensagem pré-aprovados, e tem custo por mensagem enviada).
2. Um **servidor rodando todos os dias**, checando a data de cada evento e disparando as mensagens na hora certa (isso é o RF04.02 do documento de requisitos — feature da Versão 4).

Enquanto isso não existe, o caminho funcional é o botão "Convite" no painel, que gera a mensagem e abre o WhatsApp pra envio manual.

## Próximos passos sugeridos

- Trocar os textos e números de exemplo (ex: "Ana & Marcos", "184 confirmados") pelo conteúdo real.
- Conectar o botão "Criar meu evento" a um formulário ou fluxo de cadastro de verdade.
- Adicionar imagens reais dos presentes em `gift-thumb` (hoje são placeholders só com texto).

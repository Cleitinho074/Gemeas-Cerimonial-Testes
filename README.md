# Tá Marcado — site institucional

Landing page de apresentação do produto **Tá Marcado**, baseada no documento de requisitos (MVP de confirmação de presença + lista de presentes).

## Estrutura de pastas

```
ta-marcado/
├── index.html          → toda a estrutura e o texto da página
├── css/
│   ├── style.css        → arquivo "mestre": só importa os 3 abaixo, nessa ordem
│   ├── tokens.css        → variáveis de cores, fontes e espaçamentos
│   ├── base.css          → reset, tipografia, header e hero
│   └── components.css    → cada bloco visual (convite, cards, painel, etc.)
├── js/
│   └── main.js           → animações de scroll e a interação do convite
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

## Próximos passos sugeridos

- Trocar os textos e números de exemplo (ex: "Ana & Marcos", "184 confirmados") pelo conteúdo real.
- Conectar o botão "Criar meu evento" a um formulário ou fluxo de cadastro de verdade.
- Adicionar imagens reais dos presentes em `gift-thumb` (hoje são placeholders só com texto).

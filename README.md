# Tá Marcado — site institucional

Landing page de apresentação do produto **Tá Marcado**, baseada no documento de requisitos (MVP de confirmação de presença + lista de presentes).

## Estrutura de pastas

```
ta-marcado/
├── index.html          → página principal (landing page)
├── painel.html          → painel do organizador / noiva (dados de exemplo)
├── cerimonial.html      → painel da cerimonialista (vários eventos, somente leitura)
├── convite.html         → página pública que o convidado vê ao abrir o link
├── css/
│   ├── style.css         → arquivo "mestre": só importa tokens, base e components, nessa ordem
│   ├── tokens.css        → variáveis de cores, fontes e espaçamentos
│   ├── base.css          → reset, tipografia, header e hero
│   ├── components.css    → blocos visuais da página principal
│   ├── painel.css        → estilos do painel.html (cards, tabela, modal de convite)
│   ├── cerimonial.css    → estilos do cerimonial.html (só o que é novo; o resto vem de painel.css)
│   └── convite.css       → estilos do convite.html (cartão mobile, etapas)
├── js/
│   ├── main.js            → animações de scroll, convite-envelope e formulário "Criar meu evento"
│   ├── painel.js          → dados de exemplo, filtros da tabela e gerador de mensagem de WhatsApp
│   ├── cerimonial.js      → eventos de exemplo, ordenação por data e filtros do painel da cerimonialista
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

## Sobre o cerimonial.html

É o painel da **cerimonialista** — um tipo de usuário diferente da noiva. Ela não organiza um evento só: atende vários casamentos, debutantes e aniversários ao mesmo tempo, cada um de uma conta de cliente diferente.

O protótipo tem duas telas no mesmo arquivo:

1. **Meus eventos** — todos os eventos das contas vinculadas a ela, em cards, ordenados pela data mais próxima primeiro. Cada card mostra o nome dos noivos/aniversariante, o tipo de evento, a data com a contagem de dias que faltam, os contadores (confirmados, recusados, pendentes, aguardando aprovação) e a conta responsável pela lista. Tem busca por evento/cliente/local, filtro por tipo de evento e uma ordenação alternativa por "mais pendências", pra quando ela atende muita gente ao mesmo tempo. Evento nos próximos 45 dias ganha uma marca dourada na lateral.
2. **Confirmações do evento** — clicando num card abre a mesma tabela que a noiva usa no `painel.html`, com os mesmos filtros (status pelos cards do topo, grupo e busca por nome), mas **em modo somente leitura**: sem botão de convite, sem aprovar, sem editar. Quem mexe na lista é a noiva.

A navegação usa o endereço (`cerimonial.html#evento=isadora-15`), então o botão de voltar do navegador funciona normalmente.

### Modelo de dados: o vínculo que ainda falta

O sistema já tem `conta → evento → convidado` (uma conta com vários eventos, a RN06). O que não existe ainda é a ligação entre cerimonialista e conta, que precisa ser **N:N**: uma cerimonialista atende várias contas, e uma conta pode ter mais de uma cerimonialista vinculada (a titular e uma assistente, por exemplo).

```
cerimonialista ──┐
                 │   cerimonialista_conta  (N:N)
                 ├──── id
                 ├──── cerimonialista_id  FK → cerimonialista
                 ├──── conta_id           FK → conta
                 ├──── papel              'cerimonialista' | 'assistente'
                 ├──── vinculado_em       data
                 └──── status             'ativo' | 'encerrado'
conta ───────────┘
  └── evento (1:N)  ← RN06, já existe
        └── convidado (1:N)
```

A consulta do painel percorre esse caminho: cerimonialista → contas vinculadas → eventos dessas contas → convidados de cada evento. Esse vínculo dá permissão de **leitura**, não de escrita — é o que sustenta a tela somente leitura do item 2.

Neste protótipo o resultado dessa consulta já está pronto na variável `EVENTOS` em `js/cerimonial.js`, com 3 eventos fictícios de 3 contas diferentes. Fora de escopo por enquanto: login real, edição de convidados e envio de mensagens.

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

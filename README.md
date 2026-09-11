# Tá Marcado — versão funcional para teste local

O projeto combina um site de apresentação com organização de eventos, confirmação de presença e reserva de presentes. Os HTML, CSS e JavaScript enviados foram preservados como base visual e conectados a um servidor Node.js com SQLite.

## Abrir

1. Extraia a pasta completa, se estiver usando o ZIP.
2. Abra `INICIAR.cmd` no Windows. Mantenha a janela aberta enquanto testa.
3. Acesse http://127.0.0.1:4173/ no navegador.

Requer Node.js 22.13 ou superior (testado com 24.19). Não precisa instalar pacotes. Alternativa: execute `node server.mjs` nesta pasta. Abrir o HTML diretamente não executa o banco nem o login.

## Contas de exemplo

| Perfil | E-mail | Senha |
|---|---|---|
| Organizador | ana@teste.local | Teste123! |
| Cerimonialista | cerimonial@teste.local | Teste123! |

Na tela de entrada, selecione o perfil e clique em **Preencher acesso de teste**, depois **Entrar**. São credenciais exclusivas da demonstração local. Você também pode criar sua própria conta e evento na página inicial.

## Teste de cinco minutos

1. Entre como organizador e selecione **Ana & Marcos**.
2. Clique em **Convite** na linha de Camila e Bruno e em **Testar convite**.
3. Continue, escolha **Vou**, confirme duas pessoas e uma criança. Deixe um recado.
4. Reserve um presente. Volte ao painel e clique em **Atualizar**: a resposta, o total de pessoas e a reserva devem aparecer.
5. Reabra o convite. A quantidade e o recado estarão salvos; é possível editar até o prazo.
6. No painel, use **Link de cadastro** para solicitar um convite com outro telefone. Aprove a solicitação na tabela; ela passa para Pendente, e você envia o link individual para a pessoa confirmar.
7. Teste a busca, os filtros, **CSV para Excel** e **Imprimir / PDF**. Para gerar PDF, escolha **Salvar como PDF** na janela de impressão. As exportações respeitam os filtros.
8. Saia, selecione Cerimonialista e entre com a conta de teste. Os três eventos aparecem, sem ações de edição.
9. Feche e inicie novamente o servidor: as informações permanecem.

## O que está funcionando

- Criação de conta e evento, login com senha verificada e logout.
- Senhas protegidas por scrypt e sessões em cookie HttpOnly com validade de 24 horas.
- Edição de nome, local, data e prazo do evento.
- Cadastro e edição de convidados, grupos e limites de pessoas.
- Aprovação de solicitações recebidas pelo link geral do evento.
- Links individuais aleatórios. A página pública não permite pesquisar a lista de convidados por nome.
- Confirmação e recusa, crianças incluídas no total, restrição e recado; edição até o prazo.
- Contagem separada de convites e pessoas; atualização do painel a cada 15 segundos.
- Cadastro e reserva de presentes, bloqueio de reserva duplicada e cancelamento da própria reserva. Recusar presença libera suas reservas.
- Cerimonialista com acesso de leitura autorizado por evento e verificado pelo servidor.
- Exportação CSV compatível com Excel e impressão com layout específico para PDF.
- Mensagem individual revisável para abrir no WhatsApp, sem envio automático.
- Layout responsivo, botões acessíveis por teclado, foco em modais, Escape e movimento reduzido.

## Limites desta entrega

Esta é uma aplicação local, não uma publicação na internet. Os links só abrem no computador onde o servidor está rodando. O servidor aceita conexões apenas por `127.0.0.1`.

Não estão integrados: disparos automáticos de WhatsApp, e-mail transacional/recuperação de senha, pagamentos, importação de planilhas, backup automático externo e exclusão automática por prazo. A vitrine faz reservas, não compras. PDF é gerado pela impressão do navegador; a planilha exportada é CSV, não XLSX.

Para usar com convidados reais, é necessário preparar hospedagem HTTPS, política de privacidade/retenção, recuperação de acesso, proteção operacional e as integrações externas desejadas. Não basta enviar apenas `public/` a uma hospedagem estática. O servidor Node/SQLite também precisa rodar; uma adaptação seria necessária para outra plataforma.

## Dados e arquivos

- `public/`: as cinco páginas, estilos e scripts do navegador.
- `server.mjs`: servidor, regras e API.
- `data/ta-marcado.sqlite`: banco local, criado automaticamente na primeira execução.
- `tests/integration.test.mjs`: testes automatizados com banco temporário separado.

Não apague `data/` se quiser manter as alterações. Para fazer uma cópia do banco, encerre o servidor e copie a pasta `data/` inteira. O ZIP entregue não inclui o banco utilizado durante a revisão: ele começa com os exemplos limpos.

Para testar: `npm test` (ou `node --test --test-isolation=none tests/integration.test.mjs`). Os testes usam a porta 4174 e não alteram o banco da prévia na porta 4173.

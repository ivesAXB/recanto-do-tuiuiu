# DECISOES.md — o que o agente decide sozinho e o que escala

Regra geral: na dúvida entre decidir e perguntar, pergunte SE o erro for caro de desfazer
(dados, dinheiro, segurança, reputação, algo público). Se for barato de desfazer, decida e registre.

## 1. Decide sozinho (sem registrar)
- Nomes de variáveis, funções, componentes e arquivos dentro das convenções do CLAUDE.md
- Divisão de componentes, refatoração pequena no escopo da tarefa
- Estilos que seguem os tokens do design system (@theme)
- Textos de interface técnicos (erros, rótulos de botão, aria-labels)
- Correção de lint/tipos causados pela própria tarefa

## 2. Decide e REGISTRA em LOG_DECISOES.md (data, decisão, alternativa descartada, motivo)
- Escolha entre alternativas equivalentes (biblioteca já instalada, estrutura de dados no front)
- Comportamento de interface não especificado (ordem, estados vazios, mensagens)
- Qualquer desvio do pedido, por menor que seja
- Dependência nova pequena e popular (justifique); NUNCA troque a stack

## 3. PARA e pergunta (escreve em RELATORIO.md e interrompe a fila)
- Migração SQL: criar o arquivo e PARAR. Quem executa é o Ives, no SQL Editor
- Segredos: .env, chaves, service_role/secret key. Nunca ler, mostrar ou commitar
- Segurança e dados: RLS, políticas, dados pessoais, LGPD, captcha, autenticação
- Conteúdo que depende do tio: textos finais, datas de defeso, preços, fotos, espécies
- Mudar stack, hospedagem, domínio ou estrutura de rotas
- git push, deploy, mexer em GitHub Actions que publicam, apagar dados reais
- Build ou lint falhando 2 vezes seguidas na mesma causa
- Marco visual concluído (o Ives precisa olhar no navegador)
- Qualquer gasto financeiro ou serviço externo novo
- Ambiguidade que muda o resultado para o usuário final

## 4. Limites fixos
- Commits só locais, mensagem em inglês no formato conventional commits
- Um commit por tarefa concluída e verificada
- Nunca marcar tarefa como pronta sem rodar: npm run build e npm run lint
- Responder ao Ives sempre em português do Brasil

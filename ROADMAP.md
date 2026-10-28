# Roadmap: Recanto do Tuiuiú

Documento vivo. Atualizar a cada decisão. Regras e identidade ficam no `CLAUDE.md`.

## 1. Mapa do site

### Página inicial (ordem de rolagem)

| # | Seção | O que mostra | Depende de | Fase |
|---|---|---|---|---|
| 1 | Abertura | Vídeo, título, menu | Feito | 0 |
| 2 | Um dia no Recanto | Cenas fixas na rolagem | Feito | 0 |
| 3 | A pousada | Estrutura, quartos, **comidas** | Fotos de quartos e refeições | 1 |
| 4 | Pesca | Épocas do ano (linha do tempo) e, depois, o anel de peixes | Dados do banco | 1 e 5 |
| 5 | Pacotes e preços | Hospedagem, pesca, passeio, pacote fechado, o que está incluso | Banco (`experiences`, `site_settings`) | 1 |
| 6 | Pantanal para os pequenos | O que a pousada oferece para crianças | Informações do dono | 6 |
| 7 | Reservar | Formulário em passos, sem login | Função do banco (pronta) | 2 |
| 8 | Como chegar | Mapa, translado de Cuiabá | Endereço e instruções | 1 |
| 9 | Rodapé | Contato, redes, WhatsApp | Contatos | 1 |

### Páginas separadas

- `/peixes/:espécie`: ficha completa de cada peixe (fase 5)
- `/recordes`: troféus de peso (fase 7)
- `/pequenos`: mural de desenhos (fase 7)
- `/admin`: painel do dono e do desenvolvedor (fase 3)

## 2. Fases

**Fase 1: Conteúdo da página inicial.** Primeira ligação com o banco (Supabase): pacotes e épocas vêm do banco, editáveis depois. Seções "A pousada" e "Como chegar".

**Fase 2: Reserva.** Formulário em passos que chama `create_reservation_request`, abre o WhatsApp do dono com a mensagem pronta e avisa se a data cai no defeso. Captcha invisível e função de servidor contra spam.

**Fase 3: Painel de administração.** Login (só admin), lista de pedidos por status, calendário de datas de interesse e confirmadas, registro do sinal, passeios por dia de cada estadia, cadastro de defeso e bloqueios.

**Fase 4: Publicação.** Deploy automático (GitHub Actions) em endereço de teste, teste no celular, tarefa agendada para o Supabase não pausar, SEO e, por fim, troca do domínio. **Lançamento.**

**Fase 5: Peixes.** Anel de cards girando (sentido horário, também controlado pela rolagem). Ao clicar no card da frente, abre a ficha. Começa como janela sobre a página e depois vira página própria (`/peixes/:espécie`).

**Fase 6: Pantanal para os pequenos.** Seção informativa, só com o que a pousada realmente oferece.

**Fase 7: Conteúdo dos hóspedes (com moderação).** Troféus de peso e mural de desenhos. Tudo passa por aprovação do dono antes de aparecer.

## 3. Conteúdos que dependem do dono

- [ ] **Fotos dos quartos**, área comum e varanda
- [ ] **Fotos das refeições** (café, almoço, janta)
- [ ] **Peixes:** lista das espécies que podem ser pescadas, e para cada uma: foto, iscas, melhor época, dificuldade, faixa de peso típica
- [ ] **Regras de pesca atuais** (pesque e solte, medidas, licença) e **datas oficiais do defeso**
- [ ] **Crianças:** o que existe (desconto, coletes infantis, atividades, restrição de idade nos passeios)
- [ ] **Endereço, como chegar** e instruções do translado de Cuiabá
- [ ] **Vídeos e fotos originais em HD**, principalmente drone e tuiuiús
- [ ] **Autorização de uso de imagem** das pessoas que aparecem nas fotos
- [ ] **Lista do que está incluso** em cada pacote (para a seção de pacotes)

## 4. Cuidados antes das fases 5 a 7

- **Troféus:** o hóspede envia nome, peixe, peso e foto. O dono confere e aprova. O peso é declarado, então é bom registrar como "medido pela pousada". Definir se o recorde considera pesque e solte.
- **Desenhos infantis:** envolve dados de crianças, que a LGPD trata com mais rigor (consentimento de um responsável). Caminho mais seguro: o responsável envia, sem nome nem rosto da criança, com aviso de uso, e o dono aprova antes de publicar. Confirmar com alguém da área jurídica.
- **Fotos de hóspedes:** pedir consentimento para publicar.
- **Fichas dos peixes:** não publicar dados que o dono não confirmou (pesos, épocas, iscas).

## 5. Decisões já tomadas

- Reserva sem login; login só opcional para visitantes e obrigatório no painel
- Fotos em molduras (a maioria tem 1280 px); vídeos em tela cheia, com os originais em HD a substituir
- Preços, defeso e textos vêm do banco, nunca fixos no código

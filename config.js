/* ============================================================================
   CONFIG.JS — O CORAÇÃO DO PROJETO
   ----------------------------------------------------------------------------
   Todo o texto que ela vai ler está aqui dentro. Você NUNCA precisa mexer
   no HTML, no CSS ou nos outros arquivos JS para personalizar a história.

   Onde estiver escrito «PREENCHER: ...», troque pelo texto real.
   Use \n para quebrar linha dentro de um texto.
   Deixe a imagem como "" (vazio) se não quiser usar foto naquele ponto.
   ========================================================================== */

const CONFIG = {

  /* ------------------------------------------------------------------
     1. O CASAL
     Aparece no título da aba, na carta e na assinatura final.
     ------------------------------------------------------------------ */
  casal: {
    ela: "Davilla Goulart Pereira",
    eu: "Brenno Braz",
    apelido: "Mabel", // usado na carta
    dataInicio: "03/08/2026",
    local: "ILG"
  },

  /* ------------------------------------------------------------------
     2. ÁUDIO
     Coloque seu arquivo em assets/music/ e escreva o nome aqui.
     Se o arquivo não existir, o botão de música simplesmente não aparece.
     volumeInicial vai de 0 (mudo) a 1 (máximo).
     ------------------------------------------------------------------ */
  audio: {
    arquivo: "assets/music/tema.mp3",
    volumeInicial: 0.35
  },

  /* ------------------------------------------------------------------
     3. ABERTURA — a primeira tela
     ------------------------------------------------------------------ */
  abertura: {
    sobretitulo: "Uma história para nós dois",
    titulo: "Até a Última\nPágina",
    subtitulo: "Antes de te fazer uma pergunta,\npreciso te contar uma história.",
    botao: "Começar a história"
  },

  /* ------------------------------------------------------------------
     4. CAPÍTULO I — Quando tudo começou
     ------------------------------------------------------------------ */
  capituloUm: {
    rotulo: "Capítulo I",
    titulo: "Quando tudo começou",
    texto:
      "Existem encontros que parecem pequenos quando acontecem.\n\n" +
      "Até que, algum tempo depois,\n" +
      "a gente percebe que eles mudaram tudo.\n\n" +
      "Essa é a nossa primeira página.",

    // O relato do primeiro encontro. Pode ter vários parágrafos.
    relato:
      "Tudo começou no lugar mais simples possível: no trabalho. A gente começou conversando, rindo e dividindo aqueles momentos que, no começo, pareciam só amizade. Todo mundo ao nosso redor dizia que estava rolando alguma coisa entre nós, mas eu realmente não enxergava assim. Até que, com o tempo, percebi que você estava deixando de ser só uma amiga e começando a ocupar um lugar diferente em mim.\n\n" +

      "No dia 01/08/2026, te chamei para sair. Fomos jogar bilhar, fizemos uma aposta e, como eu ganhei, você ficou me devendo usar a camisa do meu time — a famosa 'patinha', que até hoje não foi paga. KKKK. Mas, naquele dia, eu ganhei muito mais do que uma partida. Na volta para casa, eu percebi que conseguia simplesmente ser eu mesmo ao seu lado, sem precisar me segurar ou parecer outra pessoa. Foi natural. Parecia que nossos neurônios finalmente estavam batendo na mesma frequência.\n\n" +

      "Eu queria ter dito tudo o que estava sentindo naquele dia. Queria te contar que você tinha trazido de volta uma paz que eu não sentia havia muito tempo, uma alegria que eu achava ter perdido e, principalmente, uma razão nova para enxergar a vida com mais carinho. Mas eu tive medo e guardei tudo comigo. Dois dias depois, em 03/08/2026, meus amigos deixaram claro que, se eu não tomasse uma atitude, eles tomariam por mim. Então eu criei coragem, me declarei e contei o que você já tinha começado a significar para mim. E foi aí que a nossa história realmente começou.",

    foto: "assets/images/primeiro-encontro.jpg",
    fotoAlt: "Registro de um dos primeiros momentos da nossa história.",
    fotoLegenda: "01/08/2026 — o dia da bilhar, da patinha e de eu perceber que era você.",
    botao: "Virar a página"
  },

  /* ------------------------------------------------------------------
     5. CAPÍTULO II — Você foi ficando
     As três memórias que ela precisa abrir para continuar.
     ------------------------------------------------------------------ */
  capituloDois: {
    rotulo: "Capítulo II",
    titulo: "Você foi ficando",
    texto:
      "Ficando nas conversas.\n" +
      "Ficando nos pensamentos.\n" +
      "Ficando nos meus dias.",
    instrucao: "Toque em cada lembrança.",
    botao: "Continuar"
  },

  memorias: [
    {
      icone: "♡",
      titulo: "A nossa aposta",
      texto:
        "01/08/2026. Nosso dia do bilhar, a aposta da patinha e a volta para casa em que eu percebi que podia ser exatamente quem eu sou ao seu lado.",
      imagem: "assets/images/memoria1.jpg",
      alt: "Nós dois em um dos primeiros momentos da nossa história."
    },

    {
      icone: "🦋",
      titulo: "Uma tela, dois corações",
      texto:
        "Naquela sexta-feira, assistimos juntos a um filme do Homem-Aranha. Você já tinha visto Motoqueiro Fantasma, então não era exatamente sua estreia na Marvel, mas foi o nosso primeiro filme da Marvel juntos. Ter você ao meu lado no cinema já fazia qualquer filme valer a pena.",
      imagem: "assets/images/memoria2.jpg",
      alt: "Nós dois em um dos primeiros momentos da nossa história."
    },

    {
      icone: "✦",
      titulo: "Um dia inteiro com você",
      texto:
        "Depois veio o show Histórias. Eu pude passar o dia inteiro com você, te ouvir, conversar e te conhecer ainda mais. Foi mais uma vez em que percebi o quanto nossas histórias, famílias, manias e gostos têm coisas em comum.",
      imagem: "assets/images/memoria3.jpg",
      alt: "Nós dois em um dos primeiros momentos da nossa história."
    }
  ],

  /* ------------------------------------------------------------------
     6. CAPÍTULO III — Algumas coisas que amo em você
     ------------------------------------------------------------------ */
  capituloTres: {
    rotulo: "Capítulo III",
    titulo: "Algumas coisas que amo em você",

    itens: [
      "O seu jeito de me fazer sorrir sem nem perceber.",
      "A sua delicadeza e a atenção que você coloca nas pequenas coisas.",
      "As nossas manias, gostos e jeitos tão parecidos.",
      "Os momentos simples na praça, depois do trabalho, que viraram a melhor parte do meu dia.",
      "Simplesmente, você."
    ],

    mensagem:
      "Eu ainda não sei explicar direito como alguém pode chegar tão devagar e, de repente, ocupar tanto espaço dentro da gente. Você chegou através de conversas, risadas e momentos simples, e quando eu percebi, já estava esperando pelo fim do expediente só para ficar mais alguns minutos ao seu lado na praça. Esses minutos, inclusive, se tornaram a melhor parte do meu dia.\n\n" +

      "Eu amo a forma como você é. Amo o seu jeito atencioso, delicado e cuidadoso em tudo o que faz. Amo descobrir que temos manias parecidas, gostos parecidos e até histórias de família que parecem se encontrar em vários lugares. Amo te ouvir, aprender mais sobre você e perceber que, mesmo conhecendo tanta coisa sua, ainda existe muito mais para descobrir.\n\n" +

      "E tem uma cena que ainda me faz sorrir: nosso primeiro casamento juntos. Foi o primeiro casamento que eu fui na vida e, como se o destino quisesse brincar comigo, você foi justamente a primeira a tentar pegar o buquê... e conseguiu. KKKK. Eu ainda nem tinha pedido você em namoro e já estava pensando em como pedir você em casamento. Talvez eu já soubesse, desde então, o tamanho do lugar que você tinha conquistado em mim.\n\n" +

      "Sou muito grato a Deus por ter colocado você no meu caminho. Espero continuar colecionando momentos ao seu lado, até que você consiga enxergar, nem que seja um pouco, aquilo que eu vejo quando olho para você: uma mulher linda, especial e capaz de deixar a minha vida muito mais bonita simplesmente por existir. Eu te amo.",

    fotos: [
      {
        src: "assets/images/retrato1.jpg",
        alt: "Um retrato seu, do jeito que eu te enxergo."
      },
      {
        src: "assets/images/retrato2.jpg",
        alt: "Um registro de um momento que quero guardar para sempre."
      }
    ],

    botao: "Continuar"
  },

  /* ------------------------------------------------------------------
     7. CAPÍTULO IV — A última memória (o envelope e a carta)
     ------------------------------------------------------------------ */
  capituloQuatro: {
    rotulo: "Capítulo IV",
    titulo: "A última memória",
    texto:
      "Você chegou até aqui.\n\n" +
      "Mas ainda existe uma coisa\n" +
      "que eu não te contei.",
    instrucao: "Abra o envelope.",
    botao: "Continuar"
  },

  carta: {
    introducao:
      "Eu passei bastante tempo pensando\n" +
      "em como dizer isso.\n\n" +
      "Talvez nenhuma página,\n" +
      "nenhuma música ou nenhuma frase\n" +
      "consiga explicar direito\n" +
      "o que você significa para mim.",

    corpo:
      "Mabel, eu poderia tentar escrever a coisa mais bonita do mundo, mas acho que o que mais importa é te contar a verdade. Você fez meus dias terem uma cor diferente. Trouxe paz para lugares em mim que estavam barulhentos, trouxe alegria para uma fase em que eu tinha esquecido como era sentir isso e me fez perceber que amar também pode ser leve, natural e tranquilo.\n\n" +

      "Desde o dia em que tive coragem de te contar o que sentia, cada momento ao seu lado virou uma parte da história que eu não quero esquecer. O bilhar, a patinha que você ainda me deve, o cinema, o show Histórias, nossas conversas na praça, as risadas, os dengos, até aquele aperto no coração quando você precisa ir para a faculdade. Tudo isso parece pequeno para quem vê de fora, mas para mim são pedaços de uma vida que eu nunca imaginei que estaria vivendo.\n\n" +

      "Eu não sei tudo o que o futuro vai colocar diante da gente, mas sei de uma coisa: eu quero continuar descobrindo. Quero conhecer cada vez mais você, cuidar de nós, viver os dias bons, enfrentar os difíceis e transformar o máximo possível dos nossos dias em memórias. E, por mais engraçado que pareça, eu já sei até como quero te pedir em casamento. KKKK.\n\n" +

      "Obrigado por ser você. Obrigado por ter chegado na minha vida do jeito que chegou. Obrigado por me fazer sentir que eu posso ser eu mesmo. Eu espero que, um dia, quando você olhar para trás, consiga entender o quanto foi importante para mim desde o começo. Eu amo você.",

    assinatura: "Do seu Brenno, que escolhe você todos os dias."
  },

  /* ------------------------------------------------------------------
     8. A TRANSIÇÃO — as duas frases antes do pedido
     ------------------------------------------------------------------ */
  transicao: [
    "Existe uma última página.",
    "Mas essa página\nnão foi feita para ser escrita aqui."
  ],

  /* ------------------------------------------------------------------
     9. O PEDIDO
     ------------------------------------------------------------------ */
  pedido: {
    sobretitulo: "A próxima página",
    pergunta: "Quer escrever\nessa história comigo?",
    explicacao:
      "O resto dessa história\nnão pode ser escrito aqui.\n\n" +
      "Eu preciso te perguntar pessoalmente.",
    botao: "Eu quero continuar ♡"
  },

  /* ------------------------------------------------------------------
     10. O DESFECHO — a última tela, sem botão nenhum
     ------------------------------------------------------------------ */
  desfecho: {
    linhas: [
      "Então feche esta página.",
      "Olhe para mim.",
      "A próxima parte da nossa história\ncomeça fora desta tela."
    ],
    simbolo: "♥"
  },

  /* ------------------------------------------------------------------
     11. SEGREDOS
     Frases curtas que aparecem quando ela toca numa borboleta.
     Pode colocar quantas quiser. Coisas internas de vocês funcionam melhor.
     ------------------------------------------------------------------ */
  segredos: [
    "A patinha continua em aberto. Eu ganhei no bilhar e você ainda me deve. KKKK",
    "Nossos neurônios bateram na mesma frequência e deu nisso. ♥",
    "Meu lugar favorito depois do trabalho continua sendo do seu lado na praça.",
    "Você é a melhor parte do meu dia.",
    "Ainda bem que meus amigos não me deixaram fugir daquilo que eu estava sentindo."
  ],

  /* ------------------------------------------------------------------
     11.1 A ARANHA
     De vez em quando uma aranha desce num fio de seda pela lateral da
     tela. Se ela tocar, a aranha se assusta, solta uns fiapos de seda e
     sobe correndo — e conta como uma descoberta, igual às borboletas.
     Estas são as frases que aparecem nesse momento. Se você deixar a
     lista vazia, o projeto usa as frases padrão dele.
     ------------------------------------------------------------------ */
  aranha: {
    frases: [
      "Eu vi você pegando o buquê. Não vou nem comentar. 🕷️",
      "A aranha só está passando para lembrar: eu já sei como esse capítulo termina. KKKK"
    ]
  },

  // Carta escondida no Capítulo III (só quem explorar encontra).
  cartaSecreta: {
    pista: "Alguma coisa brilha aqui.",
    texto:
      "Você talvez ainda não perceba, mas virou uma das partes mais bonitas do meu 2026. E eu quero muito descobrir quantas páginas ainda podemos escrever juntos."
  },

  /* ------------------------------------------------------------------
     12.1 JOGO DA MEMÓRIA — segredo escondido
     Para abrir: tocar três vezes seguidas na lua.

     São quatro fotos, cada uma aparece duas vezes na mesa (oito
     cartas, quatro pares). Se você ainda não tiver as fotos, pode
     deixar assim mesmo — sem imagem, cada par usa um símbolo do
     próprio site no lugar, e o jogo funciona normalmente.
     ------------------------------------------------------------------ */
  jogoDaMemoria: {
    titulo: "Você se lembra?",
    instrucao: "Toque para virar. Encontre os pares.",
    mensagemFinal: "Encontrou todos os pares. ♡",

    fotos: [
      {
        src: "assets/images/jogo1.jpg",
        alt: "Nosso começo no trabalho."
      },
      {
        src: "assets/images/jogo2.jpg",
        alt: "Nosso dia do bilhar."
      },
      {
        src: "assets/images/jogo3.jpg",
        alt: "Nosso primeiro cinema juntos."
      },
      {
        src: "assets/images/jogo4.jpg",
        alt: "Um dos nossos momentos na praça."
      }
    ]
  },

  /* ------------------------------------------------------------------
     12.2 QUIZ — segredo escondido
     Para abrir: tocar na pequena flor no canto da carta, depois que
     ela já tiver aberto o envelope.

     Sem certo ou errado de verdade — é só para ela sorrir. Duas ou
     três perguntas já bastam. "correta" é a posição da resposta
     certa na lista de opções, contando a partir de 0.
     ------------------------------------------------------------------ */
  quiz: {
    titulo: "Só um teste.",
    mensagemFinal: "Eu sabia que você lembrava de tudo. ♡",

    perguntas: [
      {
        pergunta: "Em que dia eu finalmente tomei coragem e me declarei para você?",
        opcoes: [
          "01/08/2026",
          "03/08/2026",
          "10/08/2026"
        ],
        correta: 1
      },

      {
        pergunta: "O que eu ainda estou esperando você pagar até hoje?",
        opcoes: [
          "Um jantar",
          "A 'patinha' da aposta do bilhar",
          "Um ingresso de cinema"
        ],
        correta: 1
      },

      {
        pergunta: "Qual foi o primeiro show que vivemos juntos?",
        opcoes: [
          "Histórias",
          "VillaMix",
          "Caldas Country"
        ],
        correta: 0
      }
    ]
  },

  /* ------------------------------------------------------------------
     13. METADADOS
     titulo = o que aparece na aba do navegador e no preview do link.
     Mantenha discreto para não estragar a surpresa no WhatsApp.
     ------------------------------------------------------------------ */
  meta: {
    titulo: "Até a Última Página",
    descricao: "Uma história em algumas páginas."
  }
};
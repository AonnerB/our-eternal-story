/* ============================================================================
   PARTICLES.JS — poeira, borboletas, pétalas, fogos-fátuos,
                  a silhueta da noiva, a aranha e as estrelas cadentes
   ----------------------------------------------------------------------------
   Tudo acontece em um único <canvas>, para manter o desempenho no celular.
   As borboletas batem asas em 12 quadros por segundo, de propósito:
   é o que dá a sensação de animação feita quadro a quadro.

   A silhueta é desenhada num canvas auxiliar, fora da tela, para que a
   parte de baixo dela possa ser apagada com um degradê — é assim que ela
   parece estar mergulhada na névoa em vez de colada por cima dela.
   ========================================================================== */

var Particulas = (function () {
  'use strict';

  var canvas, ctx;
  var largura = 0, altura = 0, dpr = 1;
  var rodando = false;
  var ultimoQuadro = 0;
  var qualidade = 1;          // reduzida automaticamente em aparelhos lentos
  var reduzido = false;

  var poeira = [];
  var borboletas = [];
  var petalas = [];
  var faiscas = [];
  var fios = [];          // fiapos de seda soltos, deixados pela aranha
  var fogosFatuos = [];   // luzes azuis que sobem devagar — a cor-espírito do filme
  var figura = null;      // a silhueta que às vezes atravessa o fundo
  var aranha = null;      // a aranha que desce num fio de seda
  var cadente = null;     // estrela cadente, rara
  var proximaCadente = 0;

  var convergindo = false;
  var alvoConvergencia = { x: 0, y: 0 };

  /* Canvas auxiliar da silhueta */
  var telaFig = null, ctxFig = null;
  var FIG_L = 340, FIG_A = 300;    // tamanho do canvas auxiliar, em px de CSS
  var FIG_PES_X = 170, FIG_PES_Y = 246;   // onde ficam os pés dela lá dentro

  /* A silhueta é original — não é nenhum personagem específico, só uma
     figura de vestido longo e véu, no espírito vitoriano do cenário.
     Aparece raramente, e nunca mais de uma vez por cena. */
  var CHANCE_FIGURA = {
    abertura:  0.28,
    capitulo1: 0.55,
    capitulo2: 0.42,
    capitulo3: 0.3,
    capitulo4: 0.5,
    transicao: 0.35
  };

  /* A aranha desce nos capítulos de tom mais melancólico. O pedido e o
     desfecho ficam limpos — nada preso a eles. */
  var CHANCE_ARANHA = {
    capitulo1: 0.55,
    capitulo2: 0.5,
    capitulo3: 0.45,
    capitulo4: 0.5,
    transicao: 0.3
  };

  /* Quantidade de cada elemento por cena.
     Os fogos-fátuos só aparecem a partir do Capítulo IV: são a marca
     visual do segundo tempo da história, quando o clima muda. */
  var CENAS = {
    carregando: { poeira: 10, borboletas: 0,  petalas: 0,  fogos: 0 },
    abertura:   { poeira: 26, borboletas: 6,  petalas: 0,  fogos: 0 },
    capitulo1:  { poeira: 20, borboletas: 5,  petalas: 0,  fogos: 0 },
    capitulo2:  { poeira: 24, borboletas: 11, petalas: 0,  fogos: 0 },
    capitulo3:  { poeira: 22, borboletas: 9,  petalas: 3,  fogos: 0 },
    capitulo4:  { poeira: 28, borboletas: 8,  petalas: 4,  fogos: 5 },
    transicao:  { poeira: 6,  borboletas: 3,  petalas: 0,  fogos: 7 },
    pedido:     { poeira: 48, borboletas: 26, petalas: 12, fogos: 9 },
    desfecho:   { poeira: 10, borboletas: 4,  petalas: 0,  fogos: 4 }
  };

  var COR_BORBOLETA = '#5FA8D3';
  var COR_DOURADA = '#C89B5A';

  /* --------------------------------------------------------------
     Criação de elementos
     -------------------------------------------------------------- */
  function novaPoeira() {
    return {
      x: Math.random() * largura,
      y: Math.random() * altura,
      r: U.aleatorio(0.6, 2.1),
      vx: U.aleatorio(-0.12, 0.12),
      vy: U.aleatorio(-0.28, -0.05),
      alfa: U.aleatorio(0.15, 0.6),
      fase: Math.random() * Math.PI * 2,
      // uma em cada cinco partículas de poeira pisca de leve, como um
      // grão de pó pegando a luz da lua ao girar
      brilha: Math.random() < 0.22,
      ritmo: U.aleatorio(0.0012, 0.0031)
    };
  }

  function novaBorboleta(dourada, jaNaTela) {
    var deEsquerda = Math.random() > 0.5;

    // Profundidade: as de trás são menores, mais lentas e mais
    // apagadas. É o que dá volume à nuvem de borboletas.
    var profundidade = U.aleatorio(0, 1);
    var escala = 0.42 + profundidade * 0.85;

    return {
      // jaNaTela evita a fila de borboletas entrando todas pela borda
      x: jaNaTela ? Math.random() * largura
                  : (deEsquerda ? -40 : largura + 40),
      y: U.aleatorio(altura * 0.08, altura * 0.86),
      escala: dourada ? 1.25 : escala,
      alfa: dourada ? 1 : (0.42 + profundidade * 0.5),
      vx: (deEsquerda ? 1 : -1) * (0.18 + profundidade * 0.62),
      vy: U.aleatorio(-0.2, 0.2),
      fase: Math.random() * Math.PI * 2,
      balanco: U.aleatorio(0.005, 0.018),
      ritmo: U.aleatorio(0.42, 0.72),   // cada uma bate asa no seu tempo
      dourada: !!dourada,
      pousada: 0,
      tocada: false,
      alvoX: null,
      alvoY: null,
      rastro: 0
    };
  }

  /* Pétala: uma forma de verdade, com dobra e giro, em vez de um
     disco achatado. O giro faz a pétala mostrar a frente e o verso. */
  function novaPetala() {
    return {
      x: Math.random() * largura,
      y: -20 - Math.random() * altura * 0.4,
      r: U.aleatorio(5, 11),
      vy: U.aleatorio(0.25, 0.7),
      vx: U.aleatorio(-0.25, 0.25),
      giro: Math.random() * Math.PI * 2,
      vGiro: U.aleatorio(-0.018, 0.018),
      rodopio: Math.random() * Math.PI * 2,
      vRodopio: U.aleatorio(0.02, 0.05),
      tom: Math.random(),
      alfa: U.aleatorio(0.4, 0.85)
    };
  }

  /* Fogo-fátuo: uma luz azul pequena que sobe devagar, pulsando,
     como se respirasse. Sobem perto do chão, entre a névoa, e
     desaparecem no alto — nunca cruzam a lua. */
  function novoFogoFatuo() {
    return {
      x: Math.random() * largura,
      y: altura + U.aleatorio(10, 90),
      r: U.aleatorio(1.6, 3.4),
      vy: U.aleatorio(-0.28, -0.12),
      vx: U.aleatorio(-0.1, 0.1),
      deriva: Math.random() * Math.PI * 2,
      velDeriva: U.aleatorio(0.004, 0.012),
      fase: Math.random() * Math.PI * 2,
      pulso: U.aleatorio(0.0016, 0.0034),
      cauda: []
    };
  }

  function tentarInvocarFigura(nomeCena) {
    figura = null;
    var chance = CHANCE_FIGURA[nomeCena];
    if (!chance || reduzido || !ctx || Math.random() > chance) return;

    var deEsquerda = Math.random() > 0.5;
    figura = {
      x: deEsquerda ? -150 : largura + 150,
      y: altura * U.aleatorio(0.80, 0.865),
      vx: (deEsquerda ? 1 : -1) * U.aleatorio(0.10, 0.16),
      fase: Math.random() * Math.PI * 2,
      escala: U.aleatorio(0.82, 1.1),
      alfa: 0,
      atraso: U.aleatorio(1200, 5200)   // ela não entra junto com a cena
    };
  }

  function tentarInvocarAranha(nomeCena) {
    aranha = null;
    var chance = CHANCE_ARANHA[nomeCena];
    if (!chance || reduzido || !ctx || Math.random() > chance) return;

    aranha = {
      ancora: Math.random() < 0.5
        ? U.aleatorio(largura * 0.06, largura * 0.19)
        : U.aleatorio(largura * 0.81, largura * 0.94),
      x: 0,
      y: -40,
      alvoY: altura * U.aleatorio(0.16, 0.36),
      estado: 'espera',
      atraso: U.aleatorio(2600, 8000),
      espera: U.aleatorio(5200, 11000),
      fase: Math.random() * Math.PI * 2,
      balanco: 0,
      escala: U.aleatorio(0.68, 1),
      alfa: 0,
      tocada: false
    };
    aranha.x = aranha.ancora;
  }

  /* --------------------------------------------------------------
     Desenho — elementos simples
     -------------------------------------------------------------- */
  function desenharPoeira(p, tempo) {
    var a = p.alfa;
    if (p.brilha) a *= 0.45 + Math.abs(Math.sin(tempo * p.ritmo + p.fase)) * 0.85;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217, 210, 189, ' + a.toFixed(3) + ')';
    ctx.fill();
  }

  function desenharBorboleta(b, tempo) {
    // O bater de asas é quantizado: 12 quadros por segundo.
    var quadro = Math.floor(tempo / (1000 / 12));
    var abertura = Math.abs(Math.sin((quadro * (b.ritmo || 0.55)) + b.fase));
    if (b.pousada > 0) abertura = 0.16 + abertura * 0.14;

    var s = b.escala * (qualidade < 1 ? 0.92 : 1);
    var cor = b.dourada ? COR_DOURADA : COR_BORBOLETA;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.sin(b.fase * 0.7) * 0.12);
    ctx.globalAlpha = b.alfa === undefined ? 0.85 : b.alfa;

    // As douradas e as pousadas ganham um brilho ao redor
    if (b.dourada || b.pousada > 0) {
      ctx.shadowColor = b.dourada ? 'rgba(200,155,90,.9)' : 'rgba(95,168,211,.8)';
      ctx.shadowBlur = 18 * s;
    }

    // Asa esquerda
    ctx.save();
    ctx.scale(-(0.25 + abertura * 0.75) * s, s);
    asa(cor);
    ctx.restore();

    // Asa direita
    ctx.save();
    ctx.scale((0.25 + abertura * 0.75) * s, s);
    asa(cor);
    ctx.restore();

    // Corpo e antenas
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(0, -7 * s);
    ctx.lineTo(0, 7 * s);
    ctx.strokeStyle = 'rgba(217, 210, 189, .8)';
    ctx.lineWidth = Math.max(1, 1.3 * s);
    ctx.stroke();

    if (s > 0.7) {
      ctx.beginPath();
      ctx.moveTo(0, -7 * s);
      ctx.quadraticCurveTo(-3 * s, -12 * s, -5 * s, -13 * s);
      ctx.moveTo(0, -7 * s);
      ctx.quadraticCurveTo(3 * s, -12 * s, 5 * s, -13 * s);
      ctx.strokeStyle = 'rgba(217, 210, 189, .5)';
      ctx.lineWidth = Math.max(0.7, 0.8 * s);
      ctx.stroke();
    }

    ctx.restore();
  }

  function asa(cor) {
    // Asa superior, mais larga
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(3, -13, 16, -16, 14, -4);
    ctx.bezierCurveTo(13, 3, 5, 2, 0, 0);
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();

    // Asa inferior, menor
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(6, 3, 13, 7, 9, 12);
    ctx.bezierCurveTo(5, 16, 1, 8, 0, 0);
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();

    // Marca clara na ponta da asa superior
    ctx.beginPath();
    ctx.ellipse(10, -7, 2.6, 1.9, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 237, 244, .55)';
    ctx.fill();
  }

  /* Pétala com forma de pétala: uma ponta, uma base larga e uma
     nervura clara no meio. O rodopio achata a forma quando ela vira
     de lado — é o que dá a sensação de queda de verdade. */
  function desenharPetala(p) {
    var achatar = Math.abs(Math.cos(p.rodopio));
    var r = p.r;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.giro);
    ctx.scale(Math.max(0.18, achatar), 1);
    ctx.globalAlpha = p.alfa * (0.55 + achatar * 0.45);

    // Tom entre o vinho escuro e um rosa empoeirado
    var claro = p.tom > 0.55;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.bezierCurveTo(r * 0.78, -r * 0.55, r * 0.7, r * 0.5, 0, r);
    ctx.bezierCurveTo(-r * 0.7, r * 0.5, -r * 0.78, -r * 0.55, 0, -r);
    ctx.closePath();
    ctx.fillStyle = claro ? 'rgba(146, 68, 84, 1)' : 'rgba(110, 36, 54, 1)';
    ctx.fill();

    // Nervura
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(0, r * 0.75);
    ctx.strokeStyle = 'rgba(217, 182, 190, .28)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  function desenharFaisca(f) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = f.cor
      ? f.cor.replace('%A%', f.vida.toFixed(2))
      : 'rgba(200, 155, 90, ' + f.vida.toFixed(2) + ')';
    ctx.fill();
  }

  function desenharFogoFatuo(fo, tempo) {
    var brilho = 0.35 + Math.abs(Math.sin(tempo * fo.pulso + fo.fase)) * 0.5;

    ctx.save();

    // Rastro: os últimos pontos por onde passou, cada vez mais fracos
    if (fo.cauda.length > 1) {
      for (var i = 0; i < fo.cauda.length; i++) {
        var c = fo.cauda[i];
        var peso = (i + 1) / fo.cauda.length;
        ctx.globalAlpha = brilho * peso * 0.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, fo.r * peso * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(142, 181, 216, .85)';
        ctx.fill();
      }
    }

    ctx.globalAlpha = brilho;
    ctx.shadowColor = 'rgba(142, 181, 216, .95)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(fo.x, fo.y, fo.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 230, 248, .9)';
    ctx.fill();

    // Um segundo halo, mais largo e mais fraco, dá profundidade
    ctx.globalAlpha = brilho * 0.35;
    ctx.beginPath();
    ctx.arc(fo.x, fo.y, fo.r * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(142, 181, 216, .6)';
    ctx.fill();
    ctx.restore();
  }

  /* --------------------------------------------------------------
     A SILHUETA
     Uma figura original de vestido longo e véu. Sem rosto, sem
     nenhum detalhe que lembre um personagem específico: só a forma,
     recortada contra a névoa.
     -------------------------------------------------------------- */

  /* O contorno do vestido, traçado no contexto informado.
     Os pés ficam em y = 0 e a coroa da cabeça em y = -130.
     dir = +1 quando ela caminha para a direita. */
  function tracarVestido(c, dir, bal, passo) {
    var f = dir, b = -dir;   // frente e costas

    c.beginPath();
    c.moveTo(0, -114);
    // ombro, busto e cintura do lado da frente
    c.bezierCurveTo(f * 7.5, -111, f * 10.4, -101, f * 9.6, -89);
    c.bezierCurveTo(f * 9, -81, f * 8.2, -77, f * 8.6, -72);
    // a saia abre num S, não num cone
    c.bezierCurveTo(f * 12.5, -53, f * 18.5, -27, f * 22 + bal * 0.4, -2);
    // a barra, ondulando com o passo
    c.quadraticCurveTo(f * 11, 3 + passo * 0.7, 0, 2);
    c.quadraticCurveTo(b * 13, 4 - passo * 0.7, b * 25 + bal * 0.5, -4);
    // a cauda do vestido, arrastando atrás dela
    c.bezierCurveTo(b * 38 + bal, -2, b * 50 + bal * 1.4, -10, b * 57 + bal * 1.8, -19);
    c.quadraticCurveTo(b * 41 + bal, -22, b * 26, -29);
    // subindo pelas costas até a nuca
    c.bezierCurveTo(b * 17.5, -47, b * 11, -62, b * 8.6, -72);
    c.bezierCurveTo(b * 9.4, -82, b * 10.4, -101, b * 7.5, -111);
    c.quadraticCurveTo(b * 4, -114, 0, -114);
    c.closePath();
  }

  /* O véu: cai da coroa da cabeça, quase na vertical, e vai se
     afastando para trás conforme desce. Termina em ponta, na altura
     da barra do vestido. */
  function tracarVeu(c, dir, vento) {
    var b = -dir;
    var N = 18;
    var cima = [], baixo = [];

    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var onda = Math.sin(vento * 1.35 + t * 3.4) * (0.8 + t * 6.5);
      // t*t faz o véu sair colado à nuca e só depois abrir para trás
      var x = b * (3 + t * t * 46) + onda * 0.8;
      var y = -129 + t * 120;
      var esp = 8 + t * 17;
      if (t > 0.66) esp *= Math.pow((1 - t) / 0.34, 0.8);   // afina até virar ponta
      cima.push([x - esp * 0.5 * dir * -1 * 0 + (b * esp * 0.5), y - esp * 0.16]);
      baixo.push([x - b * esp * 0.5, y + esp * 0.16]);
    }

    c.beginPath();
    c.moveTo(cima[0][0], cima[0][1]);
    for (var j = 1; j < cima.length; j++) c.lineTo(cima[j][0], cima[j][1]);
    for (var k = baixo.length - 1; k >= 0; k--) c.lineTo(baixo[k][0], baixo[k][1]);
    c.closePath();
    return { cima: cima, baixo: baixo };
  }

  function desenharFiguraNoAuxiliar(f, tempo) {
    var c = ctxFig;
    var dir = f.vx > 0 ? 1 : -1;
    var passo = Math.sin(f.fase * 2.4);
    var bal = Math.sin(f.fase * 1.1) * 2.4;       // o vestido balança atrás
    var sobe = Math.abs(passo) * 1.2;             // o passo levanta o corpo
    var vento = f.fase * 0.9;

    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, FIG_L, FIG_A);
    c.save();
    c.translate(FIG_PES_X, FIG_PES_Y - sobe);
    c.scale(f.escala, f.escala);

    /* 0. Uma poça de luar na bruma atrás dela. É esse contraluz que
          garante que a silhueta seja lida em qualquer altura da tela —
          sem ele, vulto escuro sobre mata escura simplesmente some. */
    var gb = c.createRadialGradient(0, -66, 2, 0, -66, 86);
    gb.addColorStop(0, 'rgba(176, 208, 238, 0.42)');
    gb.addColorStop(0.32, 'rgba(150, 186, 222, 0.24)');
    gb.addColorStop(0.68, 'rgba(128, 166, 204, 0.09)');
    gb.addColorStop(1, 'rgba(116, 152, 190, 0)');
    c.fillStyle = gb;
    c.beginPath();
    c.arc(0, -66, 86, 0, Math.PI * 2);
    c.fill();

    /* 1. O véu, atrás de tudo. O tule é a parte dela que pega a luz
          da lua — é o que a faz ser lida como noiva, e não como um
          vulto qualquer de vestido comprido. */
    var margens = tracarVeu(c, dir, vento);
    var gv = c.createLinearGradient(0, -128, -dir * 46, -10);
    gv.addColorStop(0, 'rgba(206, 228, 248, 0.20)');
    gv.addColorStop(0.55, 'rgba(168, 200, 230, 0.12)');
    gv.addColorStop(1, 'rgba(136, 172, 208, 0.02)');
    c.fillStyle = gv;
    c.fill();

    // a borda do véu, um fio de luz que se apaga na ponta
    c.strokeStyle = 'rgba(222, 237, 252, 0.24)';
    c.lineWidth = 0.7;
    c.stroke();

    // duas dobras internas: é o que faz o tule parecer tecido
    c.strokeStyle = 'rgba(214, 233, 250, 0.11)';
    c.lineWidth = 0.55;
    for (var d = 1; d <= 2; d++) {
      c.beginPath();
      for (var m = 0; m < margens.cima.length; m++) {
        var mist = d / 3;
        var px = margens.cima[m][0] * (1 - mist) + margens.baixo[m][0] * mist;
        var py = margens.cima[m][1] * (1 - mist) + margens.baixo[m][1] * mist;
        if (m === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.stroke();
    }

    /* 2. O corpo, recortado contra a névoa. Uma sombra discreta em
          volta afunda o fundo e separa a figura do cenário. */
    c.save();
    c.shadowColor = 'rgba(2, 4, 9, 0.7)';
    c.shadowBlur = 12;
    tracarVestido(c, dir, bal, passo);
    var gc = c.createLinearGradient(0, -118, 0, 4);
    gc.addColorStop(0, '#05090F');
    gc.addColorStop(0.6, '#03060C');
    gc.addColorStop(1, '#010306');
    c.fillStyle = gc;
    c.fill();
    c.restore();

    /* 3. Cabeça, coque e pescoço — só volumes, sem nenhuma feição. */
    c.fillStyle = '#05090F';
    c.beginPath();
    c.ellipse(dir * 1.2, -122, 6.8, 7.8, dir * 0.07, 0, Math.PI * 2);
    c.fill();

    c.beginPath();   // coque, atrás
    c.ellipse(-dir * 6.2, -126, 4.8, 4.4, 0, 0, Math.PI * 2);
    c.fill();

    c.beginPath();   // pescoço
    c.moveTo(-2.3, -116);
    c.lineTo(2.3, -116);
    c.lineTo(1.8, -111);
    c.lineTo(-1.8, -111);
    c.closePath();
    c.fill();

    /* 4. A coroa de flores: três pontinhos claros sobre o coque. */
    c.fillStyle = 'rgba(214, 231, 246, 0.52)';
    [[-2.6, -129.4], [1.1, -130.2], [4.3, -128]].forEach(function (fl) {
      c.beginPath();
      c.arc(fl[0] * dir, fl[1], 1.1, 0, Math.PI * 2);
      c.fill();
    });

    /* 5. O braço da frente, dobrado, segurando o buquê. */
    c.beginPath();
    c.moveTo(dir * 9.2, -101);
    c.quadraticCurveTo(dir * 15.5, -90, dir * 13, -74);
    c.quadraticCurveTo(dir * 11.6, -69, dir * 7, -71);
    c.quadraticCurveTo(dir * 10, -86, dir * 5.6, -99);
    c.closePath();
    c.fillStyle = '#03070D';
    c.fill();

    /* 6. O buquê: um punhado de flores pálidas que ainda guardam luz. */
    var bq = [[0, 0], [4, -2.1], [-3.6, -1.5], [1.5, -5.1], [-2.1, -5.3], [4.6, -5.7]];
    c.save();
    c.translate(dir * 11.5, -67);
    c.shadowColor = 'rgba(160, 196, 228, .75)';
    c.shadowBlur = 8;
    for (var i = 0; i < bq.length; i++) {
      c.beginPath();
      c.arc(bq[i][0] * (i % 2 ? 1 : dir), bq[i][1], 2.1 - i * 0.12, 0, Math.PI * 2);
      c.fillStyle = 'rgba(216, 233, 248, ' + (0.5 + (i % 3) * 0.15).toFixed(2) + ')';
      c.fill();
    }
    c.restore();

    /* 7. A luz da lua na borda dela.
          Um fio claro só do lado voltado para a luz — é o detalhe que
          separa uma mancha preta de uma silhueta de verdade. */
    c.save();
    c.beginPath();
    c.rect(dir > 0 ? -1 : -120, -142, 121, 160);
    c.clip();

    tracarVestido(c, dir, bal, passo);
    var gl = c.createLinearGradient(0, -118, 0, 2);
    gl.addColorStop(0, 'rgba(230, 242, 255, 0.8)');
    gl.addColorStop(0.5, 'rgba(168, 202, 234, 0.42)');
    gl.addColorStop(1, 'rgba(120, 158, 196, 0.08)');
    c.strokeStyle = gl;
    c.lineWidth = 1.45;
    c.stroke();

    // a mesma luz na cabeça
    c.beginPath();
    c.ellipse(dir * 1.2, -122, 6.8, 7.8, dir * 0.07, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(230, 242, 255, 0.62)';
    c.lineWidth = 1;
    c.stroke();
    c.restore();

    c.restore();

    /* 8. A névoa come a barra do vestido: apagamos a base com um
          degradê, em vez de deixá-la recortada em cima do chão. */
    var gm = c.createLinearGradient(0, FIG_PES_Y - 44, 0, FIG_PES_Y + 8);
    gm.addColorStop(0, 'rgba(0,0,0,0)');
    gm.addColorStop(0.42, 'rgba(0,0,0,0.22)');
    gm.addColorStop(0.75, 'rgba(0,0,0,0.6)');
    gm.addColorStop(1, 'rgba(0,0,0,0.96)');
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = gm;
    c.fillRect(0, FIG_PES_Y - 44, FIG_L, 58);
    c.restore();
  }

  function desenharFigura(f, tempo) {
    if (!f || !ctxFig) return;

    /* A silhueta é redesenhada a 12 quadros por segundo, não a 60.
       Isso custa cinco vezes menos no celular e, de quebra, é o mesmo
       ritmo das asas das borboletas — o movimento dela combina com o
       resto da cena em vez de destoar por ser liso demais. */
    if (!f.ultimoDesenho || tempo - f.ultimoDesenho >= 1000 / 12) {
      f.ultimoDesenho = tempo;
      desenharFiguraNoAuxiliar(f, tempo);
    }

    ctx.save();
    ctx.globalAlpha = f.alfa * 0.88;
    ctx.drawImage(telaFig, 0, 0, FIG_L * dpr, FIG_A * dpr,
                  f.x - FIG_PES_X, f.y - FIG_PES_Y, FIG_L, FIG_A);
    ctx.restore();
  }

  /* --------------------------------------------------------------
     A ARANHA
     Desce num fio de seda, fica balançando um instante e sobe de
     volta. Se ela tocar, a aranha se assusta, solta uns fiapos de
     seda e sobe correndo.
     -------------------------------------------------------------- */
  /* As oito pernas, em dois segmentos: sobem do corpo, dobram no
     joelho e descem até a ponta. É a dobra que faz o desenho ser
     lido como aranha, e não como uma estrela. */
  var PERNAS = [
    { kx: 10,  ky: -15, px: 16,   py: -6 },
    { kx: 11.5, ky: -11, px: 19.5, py: 2 },
    { kx: 11,  ky: -6,  px: 18,   py: 10 },
    { kx: 8.5, ky: -2,  px: 13.5, py: 16 }
  ];

  function desenharAranha(a, tempo) {
    var s = a.escala;
    var pressa = a.estado === 'subindo' ? 2.6 : 1;
    var abre = a.estado === 'balancando' ? 1 : 0.8;

    ctx.save();
    ctx.globalAlpha = a.alfa;

    /* O fio: uma curva levíssima entre o teto e ela. */
    ctx.beginPath();
    ctx.moveTo(a.ancora, 0);
    ctx.quadraticCurveTo(
      (a.ancora + a.x) / 2 + a.balanco * 0.35, a.y * 0.5,
      a.x, a.y - 15 * s
    );
    ctx.strokeStyle = 'rgba(214, 228, 244, 0.28)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // uma gota de orvalho descendo devagar pelo fio
    var to = (tempo % 5200) / 5200;
    var oy = (a.y - 15 * s) * to;
    if (oy > 8) {
      ctx.beginPath();
      ctx.arc(a.ancora + (a.x - a.ancora) * to, oy, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226, 239, 252, 0.45)';
      ctx.fill();
    }

    ctx.translate(a.x, a.y);
    ctx.rotate(a.balanco * 0.007);

    /* Pernas */
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var passada = 0; passada < 2; passada++) {
      // primeira passada: o traço grosso e escuro
      // segunda: um fio de luz por cima, do lado da lua
      ctx.strokeStyle = passada === 0
        ? 'rgba(6, 10, 18, 0.96)'
        : 'rgba(168, 202, 234, 0.34)';
      ctx.lineWidth = passada === 0
        ? Math.max(1.1, 1.7 * s)
        : Math.max(0.4, 0.55 * s);

      ctx.beginPath();
      for (var i = 0; i < PERNAS.length; i++) {
        var P = PERNAS[i];
        for (var l = -1; l <= 1; l += 2) {
          var w = Math.sin(tempo * 0.0052 * pressa + i * 0.9 + (l > 0 ? 0 : 0.55) + a.fase);
          var kx = l * P.kx * s * abre;
          var ky = (P.ky - w * 1.1) * s;
          var px = l * (P.px + w * 1.3) * s * abre;
          var py = (P.py + w * 1.8) * s;

          ctx.moveTo(l * 2.6 * s, -3 * s);
          ctx.lineTo(kx, ky);
          ctx.quadraticCurveTo(kx + (px - kx) * 0.45, ky + (py - ky) * 0.75, px, py);
        }
      }
      ctx.stroke();
    }

    /* Abdômen redondo em cima, cefalotórax menor embaixo. */
    ctx.beginPath();
    ctx.ellipse(0, -10 * s, 6.6 * s, 7.4 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#070B14';
    ctx.fill();

    // relevo do abdômen, com a luz vindo de cima à esquerda
    var ga = ctx.createRadialGradient(-2.4 * s, -13.4 * s, 0.5 * s,
                                      0, -10 * s, 8 * s);
    ga.addColorStop(0, 'rgba(186, 214, 240, 0.6)');
    ga.addColorStop(0.42, 'rgba(92, 124, 160, 0.17)');
    ga.addColorStop(1, 'rgba(7, 11, 20, 0)');
    ctx.fillStyle = ga;
    ctx.fill();

    // uma marca pálida nas costas, no espírito do cenário
    ctx.beginPath();
    ctx.moveTo(0, -14 * s);
    ctx.lineTo(1.8 * s, -10.2 * s);
    ctx.lineTo(0, -6.4 * s);
    ctx.lineTo(-1.8 * s, -10.2 * s);
    ctx.closePath();
    ctx.fillStyle = 'rgba(214, 231, 246, 0.24)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -1.4 * s, 4.1 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#05080F';
    ctx.fill();

    /* Os olhos: dois brilhos azuis pequenos. É o que a deixa
       simpática em vez de assustadora. */
    var piscando = (tempo % 4300) < 140;
    if (!piscando) {
      ctx.shadowColor = 'rgba(95, 168, 211, .95)';
      ctx.shadowBlur = 7 * s;
      ctx.beginPath();
      ctx.arc(-1.8 * s, 0.4 * s, 0.95 * s, 0, Math.PI * 2);
      ctx.arc(1.8 * s, 0.4 * s, 0.95 * s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196, 228, 252, .95)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  function atualizarAranha(a, dt) {
    if (a.atraso > 0) { a.atraso -= dt; return; }

    a.fase += dt * 0.0016;
    a.alfa = Math.min(1, a.alfa + dt * 0.0012);

    // balanço lateral, como um pêndulo que vai perdendo força
    a.balanco = Math.sin(a.fase * 1.6) * (a.estado === 'balancando' ? 13 : 5);
    a.x = a.ancora + a.balanco;

    if (a.estado === 'espera' || a.estado === 'descendo') {
      a.estado = 'descendo';
      a.y += 0.085 * dt;
      if (a.y >= a.alvoY) { a.y = a.alvoY; a.estado = 'balancando'; }
    } else if (a.estado === 'balancando') {
      a.y = a.alvoY + Math.sin(a.fase * 1.2) * 4;
      a.espera -= dt;
      if (a.espera <= 0) a.estado = 'subindo';
    } else if (a.estado === 'subindo') {
      a.y -= (a.tocada ? 0.42 : 0.14) * dt;
      a.alfa = Math.max(0, a.alfa - dt * 0.0004);
      if (a.y < -40) aranha = null;
    }
  }

  /* --------------------------------------------------------------
     ESTRELA CADENTE
     Rara, curta, na parte alta do céu. Passa e some.
     -------------------------------------------------------------- */
  function novaCadente() {
    var deEsquerda = Math.random() > 0.35;
    var ang = U.aleatorio(0.24, 0.48) * (deEsquerda ? 1 : -1);
    return {
      x: deEsquerda ? U.aleatorio(-40, largura * 0.35) : U.aleatorio(largura * 0.65, largura + 40),
      y: U.aleatorio(-20, altura * 0.24),
      vel: U.aleatorio(7, 12),
      ang: ang,
      vida: 1,
      comp: U.aleatorio(70, 150)
    };
  }

  function desenharCadente(e) {
    var dx = Math.cos(e.ang) * e.comp * (e.x > largura / 2 ? -1 : 1);
    var dy = Math.sin(Math.abs(e.ang)) * e.comp;
    var g = ctx.createLinearGradient(e.x, e.y, e.x - dx, e.y - dy);
    g.addColorStop(0, 'rgba(240, 246, 255, ' + (0.9 * e.vida).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(142, 181, 216, 0)');

    ctx.save();
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(210, 230, 250, .8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x - dx, e.y - dy);
    ctx.stroke();
    ctx.restore();
  }

  /* --------------------------------------------------------------
     Laço principal
     -------------------------------------------------------------- */
  function quadro(tempo) {
    if (!rodando || !ctx) return;

    var dt = Math.min(48, tempo - ultimoQuadro);
    ultimoQuadro = tempo;

    ctx.clearRect(0, 0, largura, altura);

    // Estrela cadente
    if (!cadente && tempo > proximaCadente && !reduzido) {
      cadente = novaCadente();
    }
    if (cadente) {
      var sinal = cadente.x > largura / 2 ? -1 : 1;
      cadente.x += Math.cos(cadente.ang) * cadente.vel * sinal * (dt / 16);
      cadente.y += Math.sin(Math.abs(cadente.ang)) * cadente.vel * (dt / 16);
      cadente.vida -= 0.012 * (dt / 16);
      if (cadente.vida <= 0 || cadente.y > altura * 0.55) {
        cadente = null;
        proximaCadente = tempo + U.aleatorio(14000, 34000);
      } else {
        desenharCadente(cadente);
      }
    }

    // Poeira
    for (var i = 0; i < poeira.length; i++) {
      var p = poeira[i];
      p.fase += 0.01;
      p.x += p.vx + Math.sin(p.fase) * 0.16;
      p.y += p.vy;
      if (p.y < -10) { p.y = altura + 10; p.x = Math.random() * largura; }
      if (p.x < -10) p.x = largura + 10;
      if (p.x > largura + 10) p.x = -10;
      desenharPoeira(p, tempo);
    }

    // A silhueta de fundo, se houver uma nesta cena — desenhada antes
    // das borboletas, para que elas voem por cima, na frente dela.
    if (figura) {
      if (figura.atraso > 0) {
        figura.atraso -= dt;
      } else {
        figura.fase += dt * 0.0032;
        figura.x += figura.vx * (dt / 16);

        // Ela surge da névoa e volta para ela: a opacidade acompanha a
        // distância até a borda, em vez de aparecer e sumir de estalo.
        var borda = Math.min(figura.x + 120, largura + 120 - figura.x);
        figura.alfa = U.limitar(borda / 170, 0, 1);

        if (figura.x < -160 || figura.x > largura + 160) figura = null;
        else desenharFigura(figura, tempo);
      }
    }

    // A aranha
    if (aranha) {
      atualizarAranha(aranha, dt);
      if (aranha && aranha.atraso <= 0) desenharAranha(aranha, tempo);
    }

    // Borboletas
    for (var j = 0; j < borboletas.length; j++) {
      var b = borboletas[j];

      if (convergindo && b.alvoX !== null) {
        b.x += (b.alvoX - b.x) * 0.045;
        b.y += (b.alvoY - b.y) * 0.045;
        b.fase += b.balanco * dt;
      } else if (convergindo) {
        b.x += (alvoConvergencia.x - b.x) * 0.035;
        b.y += (alvoConvergencia.y - b.y) * 0.035;
      } else if (b.pousada > 0) {
        b.pousada -= dt;
      } else {
        b.fase += b.balanco * dt;
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16) + Math.sin(b.fase) * 0.5;

        if (b.y < altura * 0.06 || b.y > altura * 0.92) b.vy *= -1;
        if (b.x < -60) { b.x = largura + 50; b.y = U.aleatorio(altura * .15, altura * .8); }
        if (b.x > largura + 60) { b.x = -50; b.y = U.aleatorio(altura * .15, altura * .8); }
      }

      // A dourada deixa um rastro de pó de luz por onde passa
      if (b.dourada && !reduzido) {
        b.rastro -= dt;
        if (b.rastro <= 0) {
          b.rastro = 90;
          faiscas.push({
            x: b.x + U.aleatorio(-4, 4), y: b.y + U.aleatorio(-4, 4),
            vx: U.aleatorio(-0.15, 0.15), vy: U.aleatorio(0.05, 0.3),
            r: U.aleatorio(0.7, 1.6), vida: 0.55, leve: true,
            cor: 'rgba(224, 196, 146, %A%)'
          });
        }
      }

      desenharBorboleta(b, tempo);
    }

    // Pétalas
    for (var k = 0; k < petalas.length; k++) {
      var pe = petalas[k];
      pe.y += pe.vy * (dt / 16);
      pe.x += pe.vx * (dt / 16) + Math.sin(pe.y * 0.012) * 0.45;
      pe.giro += pe.vGiro * (dt / 16);
      pe.rodopio += pe.vRodopio * (dt / 16);
      if (pe.y > altura + 20) { pe.y = -20; pe.x = Math.random() * largura; }
      desenharPetala(pe);
    }

    // Fogos-fátuos
    for (var g = 0; g < fogosFatuos.length; g++) {
      var fo = fogosFatuos[g];
      fo.deriva += fo.velDeriva * dt;
      fo.y += fo.vy * (dt / 16);
      fo.x += fo.vx * (dt / 16) + Math.sin(fo.deriva) * 0.35;

      // guarda o rastro
      if (!fo.contaCauda || fo.contaCauda > 4) {
        fo.contaCauda = 0;
        fo.cauda.push({ x: fo.x, y: fo.y });
        if (fo.cauda.length > 6) fo.cauda.shift();
      }
      fo.contaCauda++;

      if (fo.y < altura * 0.1) {
        fo.y = altura + U.aleatorio(10, 60);
        fo.x = Math.random() * largura;
        fo.cauda.length = 0;
      }
      desenharFogoFatuo(fo, tempo);
    }

    // Fiapos de seda (a aranha assustada)
    for (var s = fios.length - 1; s >= 0; s--) {
      var fi = fios[s];
      fi.y += fi.vy * (dt / 16);
      fi.x += fi.vx * (dt / 16) + Math.sin(fi.y * 0.04) * 0.3;
      fi.vida -= 0.008 * (dt / 16);
      if (fi.vida <= 0) { fios.splice(s, 1); continue; }
      ctx.save();
      ctx.globalAlpha = fi.vida * 0.55;
      ctx.strokeStyle = 'rgba(224, 236, 250, .9)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(fi.x, fi.y);
      ctx.lineTo(fi.x + fi.comp * 0.3, fi.y - fi.comp);
      ctx.stroke();
      ctx.restore();
    }

    // Faíscas (efeito ao abrir uma memória)
    for (var f = faiscas.length - 1; f >= 0; f--) {
      var fa = faiscas[f];
      fa.x += fa.vx * (dt / 16);
      fa.y += fa.vy * (dt / 16);
      if (!fa.leve) fa.vy += 0.03;
      fa.vida -= (fa.leve ? 0.006 : 0.012) * (dt / 16);
      if (fa.vida <= 0) faiscas.splice(f, 1);
      else desenharFaisca(fa);
    }

    requestAnimationFrame(quadro);
  }

  /* --------------------------------------------------------------
     Ajuste de tamanho e desempenho
     -------------------------------------------------------------- */
  function redimensionar() {
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = Math.floor(largura * dpr);
    canvas.height = Math.floor(altura * dpr);
    canvas.style.width = largura + 'px';
    canvas.style.height = altura + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (telaFig) {
      telaFig.width = Math.floor(FIG_L * dpr);
      telaFig.height = Math.floor(FIG_A * dpr);
    }
  }

  function medirDesempenho() {
    // Aparelhos com poucos núcleos recebem menos partículas.
    var nucleos = navigator.hardwareConcurrency || 4;
    if (nucleos <= 4) qualidade = 0.78;
    if (nucleos <= 2) qualidade = 0.58;
    if (window.innerWidth < 420) qualidade *= 0.88;
  }

  /* --------------------------------------------------------------
     API pública
     -------------------------------------------------------------- */
  function iniciar() {
    canvas = document.getElementById('particles');
    if (!canvas || !canvas.getContext) return;

    // Se o navegador não entregar o contexto 2D, a história continua
    // normalmente — só sem partículas.
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      ctx = null;
    }
    if (!ctx) { canvas.style.display = 'none'; return; }

    // Canvas auxiliar da silhueta
    try {
      telaFig = document.createElement('canvas');
      ctxFig = telaFig.getContext('2d');
    } catch (e2) {
      telaFig = null; ctxFig = null;
    }

    reduzido = U.movimentoReduzido();
    medirDesempenho();
    redimensionar();
    proximaCadente = performance.now() + U.aleatorio(6000, 16000);

    var tempoRedim;
    window.addEventListener('resize', function () {
      clearTimeout(tempoRedim);
      tempoRedim = setTimeout(redimensionar, 180);
    });

    // Pausa quando a aba sai de foco: economiza bateria
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else retomar();
    });

    if (!reduzido) retomar();
    definirCena('carregando');
  }

  function retomar() {
    if (reduzido || rodando || !ctx) return;
    rodando = true;
    ultimoQuadro = performance.now();
    requestAnimationFrame(quadro);
  }

  function parar() { rodando = false; }

  function definirCena(nome) {
    if (!ctx) return;
    var cfg = CENAS[nome] || CENAS.abertura;
    var fator = reduzido ? 0 : qualidade;

    tentarInvocarFigura(nome);
    tentarInvocarAranha(nome);

    ajustarLista(poeira, Math.round(cfg.poeira * fator), novaPoeira);
    // A borboleta dourada, uma vez conquistada, acompanha o resto da
    // jornada: ela nunca é removida numa troca de cena.
    var douradas = borboletas.filter(function (b) { return b.dourada; });
    var comuns = borboletas.filter(function (b) { return !b.dourada; });
    ajustarLista(comuns, Math.round(cfg.borboletas * fator), function () {
      return novaBorboleta(false, true);
    });
    borboletas.length = 0;
    Array.prototype.push.apply(borboletas, comuns);
    Array.prototype.push.apply(borboletas, douradas);
    ajustarLista(petalas, Math.round(cfg.petalas * fator), novaPetala);
    ajustarLista(fogosFatuos, Math.round(cfg.fogos * fator), novoFogoFatuo);

    if (reduzido && ctx) ctx.clearRect(0, 0, largura, altura);
  }

  function ajustarLista(lista, alvo, criar) {
    while (lista.length > alvo) lista.pop();
    while (lista.length < alvo) lista.push(criar());
  }

  /* Explosão de faíscas a partir de um ponto (ao abrir uma memória) */
  function explodir(x, y, quantidade, cor) {
    if (reduzido || !ctx) return;
    var n = quantidade || 18;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var vel = U.aleatorio(0.8, 3.2);
      faiscas.push({
        x: x, y: y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel - 1,
        r: U.aleatorio(1, 2.6),
        vida: 1,
        cor: cor || null
      });
    }
  }

  /* Ela tocou numa borboleta? Devolve true se acertou. */
  function tentarTocar(x, y) {
    if (!ctx) return false;
    for (var i = 0; i < borboletas.length; i++) {
      var b = borboletas[i];
      var raio = Math.max(30, 38 * b.escala);
      if (Math.abs(b.x - x) < raio && Math.abs(b.y - y) < raio) {
        b.pousada = 2200;   // pousa por um instante
        b.tocada = true;
        explodir(b.x, b.y, 10);
        return true;
      }
    }
    return false;
  }

  /* Ela tocou na aranha? A aranha se assusta, solta seda e sobe. */
  function tentarTocarAranha(x, y) {
    if (!ctx || !aranha || aranha.tocada || aranha.atraso > 0) return false;
    var raio = Math.max(34, 40 * aranha.escala);
    if (Math.abs(aranha.x - x) > raio || Math.abs(aranha.y - y) > raio) return false;

    aranha.tocada = true;
    aranha.estado = 'subindo';

    for (var i = 0; i < 9; i++) {
      fios.push({
        x: aranha.x + U.aleatorio(-10, 10),
        y: aranha.y + U.aleatorio(-6, 8),
        vx: U.aleatorio(-0.5, 0.5),
        vy: U.aleatorio(0.4, 1.3),
        comp: U.aleatorio(5, 13),
        vida: 1
      });
    }
    explodir(aranha.x, aranha.y, 8, 'rgba(190, 218, 244, %A%)');
    return true;
  }

  /* Uma borboleta dourada passa a acompanhar a jornada */
  function adicionarDourada() {
    if (reduzido || !ctx) return;
    // só uma
    for (var i = 0; i < borboletas.length; i++) {
      if (borboletas[i].dourada) return;
    }
    borboletas.push(novaBorboleta(true, true));
  }

  /* No clique final, as borboletas não se amontoam no centro: elas
     se organizam sobre uma curva de coração e ficam lá, respirando,
     até serem soltas. */
  function convergir() {
    if (!ctx) return;
    alvoConvergencia = { x: largura / 2, y: altura / 2 };
    convergindo = true;

    for (var i = 0; i < 22; i++) borboletas.push(novaBorboleta(i % 4 === 0, true));

    var escala = Math.min(largura, altura) * 0.0125;
    var cx = largura / 2, cy = altura * 0.46;

    borboletas.forEach(function (b, k) {
      var t = (k / borboletas.length) * Math.PI * 2 + Math.random() * 0.12;
      var hx = 16 * Math.pow(Math.sin(t), 3);
      var hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
             - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      // uma dispersão pequena, para não virar um desenho duro
      b.alvoX = cx + hx * escala + U.aleatorio(-7, 7);
      b.alvoY = cy - hy * escala + U.aleatorio(-7, 7);
    });
  }

  function soltar() {
    convergindo = false;
    borboletas.forEach(function (b) { b.alvoX = null; b.alvoY = null; });
  }

  return {
    iniciar: iniciar,
    definirCena: definirCena,
    explodir: explodir,
    tentarTocar: tentarTocar,
    tentarTocarAranha: tentarTocarAranha,
    adicionarDourada: adicionarDourada,
    convergir: convergir,
    soltar: soltar,
    parar: parar,
    retomar: retomar
  };
})();

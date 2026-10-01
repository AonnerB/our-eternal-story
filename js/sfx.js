/* ============================================================================
   SFX.JS — pequenos sons, criados na hora, sem nenhum arquivo
   ----------------------------------------------------------------------------
   Papel virando, o lacre quebrando, um sino ao tocar numa borboleta.
   Tudo aqui é gerado pela Web Audio API — não existe MP3 nenhum por trás,
   então não há questão de direito autoral e o efeito funciona mesmo antes
   de você colocar a música de vocês.

   Os sons seguem o mesmo interruptor da música: se ela pausar a música,
   os efeitos também silenciam. Sem música carregada, eles tocam sozinhos,
   discretos, a partir do primeiro toque na tela.
   ========================================================================== */

var SFX = (function () {
  'use strict';

  var ctx = null;
  var ativo = true;

  function contexto() {
    if (!ctx) {
      var Construtor = window.AudioContext || window.webkitAudioContext;
      if (!Construtor) return null;
      try { ctx = new Construtor(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () { /* navegador recusou: seguimos em silêncio */ });
    }
    return ctx;
  }

  function definirAtivo(valor) { ativo = !!valor; }

  function tocar(construir) {
    if (!ativo) return;
    var c = contexto();
    if (!c) return;
    try { construir(c); } catch (e) { /* nunca deixamos um som quebrar a história */ }
  }

  /* Envelope simples: sobe rápido, desce em curva exponencial */
  function envelope(ganho, c, ataque, decaimento, pico) {
    var t = c.currentTime;
    ganho.gain.cancelScheduledValues(t);
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.linearRampToValueAtTime(pico, t + ataque);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + ataque + decaimento);
  }

  function ruido(c, duracao, curvaPotencia) {
    var buffer = c.createBuffer(1, Math.ceil(c.sampleRate * duracao), c.sampleRate);
    var dados = buffer.getChannelData(0);
    for (var i = 0; i < dados.length; i++) {
      var vida = 1 - i / dados.length;
      dados[i] = (Math.random() * 2 - 1) * Math.pow(vida, curvaPotencia || 2);
    }
    var fonte = c.createBufferSource();
    fonte.buffer = buffer;
    return fonte;
  }

  /* --------------------------------------------------------------
     Página virando: um sopro curto de ruído filtrado, descendo.
     -------------------------------------------------------------- */
  function virarPagina() {
    tocar(function (c) {
      var duracao = 0.32;
      var fonte = ruido(c, duracao, 2);

      var filtro = c.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.Q.value = 0.8;
      filtro.frequency.setValueAtTime(2200, c.currentTime);
      filtro.frequency.exponentialRampToValueAtTime(500, c.currentTime + duracao);

      var ganho = c.createGain();
      envelope(ganho, c, 0.015, duracao, 0.16);

      fonte.connect(filtro).connect(ganho).connect(c.destination);
      fonte.start();
      fonte.stop(c.currentTime + duracao + 0.05);
    });
  }

  /* --------------------------------------------------------------
     Lacre quebrando: um estalo grave seguido de uma crepitação fina.
     -------------------------------------------------------------- */
  function quebrarLacre() {
    tocar(function (c) {
      // O estalo
      var osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, c.currentTime + 0.1);

      var ganhoEstalo = c.createGain();
      envelope(ganhoEstalo, c, 0.004, 0.13, 0.22);
      osc.connect(ganhoEstalo).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.16);

      // A crepitação fina, logo em seguida
      var duracao = 0.2;
      var fonte = ruido(c, duracao, 3);
      var filtro = c.createBiquadFilter();
      filtro.type = 'highpass';
      filtro.frequency.value = 1400;
      var ganhoRuido = c.createGain();
      envelope(ganhoRuido, c, 0.006, duracao, 0.1);
      fonte.connect(filtro).connect(ganhoRuido).connect(c.destination);
      fonte.start(c.currentTime + 0.02);
    });
  }

  /* --------------------------------------------------------------
     Sino: uma nota curta e clara, como uma caixinha de música.
     As notas formam uma escala pentatônica — combinam entre si
     em qualquer ordem, então soam bem mesmo tocadas ao acaso.
     -------------------------------------------------------------- */
  var NOTAS = [493.88, 587.33, 659.25, 739.99, 880.00]; // Si3, Ré4, Mi4, Fá#4, Lá4
  var ultimaNota = -1;

  function sino() {
    tocar(function (c) {
      var i;
      do { i = Math.floor(Math.random() * NOTAS.length); }
      while (NOTAS.length > 1 && i === ultimaNota);
      ultimaNota = i;
      var freq = NOTAS[i];

      var fundamental = c.createOscillator();
      fundamental.type = 'sine';
      fundamental.frequency.value = freq;

      var harmonico = c.createOscillator();
      harmonico.type = 'sine';
      harmonico.frequency.value = freq * 2;

      var g1 = c.createGain();
      envelope(g1, c, 0.008, 1.1, 0.085);
      var g2 = c.createGain();
      envelope(g2, c, 0.008, 0.55, 0.03);

      fundamental.connect(g1).connect(c.destination);
      harmonico.connect(g2).connect(c.destination);

      fundamental.start(); harmonico.start();
      fundamental.stop(c.currentTime + 1.2);
      harmonico.stop(c.currentTime + 0.7);
    });
  }

  /* --------------------------------------------------------------
     Um acorde suave — usado no clique do pedido.
     -------------------------------------------------------------- */
  function acorde() {
    tocar(function (c) {
      [493.88, 659.25, 880.00].forEach(function (freq, i) {
        var osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        var g = c.createGain();
        envelope(g, c, 0.05 + i * 0.03, 1.8, 0.07);
        osc.connect(g).connect(c.destination);
        osc.start(c.currentTime + i * 0.09);
        osc.stop(c.currentTime + 2.2);
      });
    });
  }

  /* --------------------------------------------------------------
     Uma batida grave e única, para o coração do desfecho.
     -------------------------------------------------------------- */
  function bater() {
    tocar(function (c) {
      var osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(38, c.currentTime + 0.3);
      var g = c.createGain();
      envelope(g, c, 0.008, 0.36, 0.28);
      osc.connect(g).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.4);
    });
  }

  return {
    definirAtivo: definirAtivo,
    virarPagina: virarPagina,
    quebrarLacre: quebrarLacre,
    sino: sino,
    acorde: acorde,
    bater: bater
  };
})();

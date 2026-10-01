/* ============================================================================
   AUDIO.JS — música ambiente
   ----------------------------------------------------------------------------
   Regras:
   - a música nunca começa sozinha (política dos navegadores e bom senso);
   - se o arquivo não existir, o controle desaparece e nada quebra;
   - o volume muda de cena para cena, acompanhando a emoção.
   ========================================================================== */

var Musica = (function () {
  'use strict';

  var elemento = null;
  var controle = null;
  var botao = null;
  var slider = null;

  var disponivel = false;
  var tocando = false;
  var volumeAlvo = 0.35;
  var volumeBase = 0.35;
  var fadeTimer = null;

  function iniciar() {
    elemento = document.getElementById('music');
    controle = document.getElementById('audio-control');
    botao = document.getElementById('audio-toggle');
    slider = document.getElementById('volume');

    var arquivo = (CONFIG.audio && CONFIG.audio.arquivo) || '';
    if (!arquivo) return;

    volumeBase = U.limitar(
      typeof CONFIG.audio.volumeInicial === 'number' ? CONFIG.audio.volumeInicial : 0.35,
      0, 1
    );
    volumeAlvo = volumeBase;

    elemento.src = arquivo;
    elemento.volume = 0;

    // Só mostramos o botão depois de confirmar que o arquivo carrega.
    elemento.addEventListener('canplay', habilitar, { once: true });
    elemento.addEventListener('error', function () {
      // Sem arquivo de música: seguimos em silêncio, sem aviso na tela.
      disponivel = false;
      if (controle) controle.hidden = true;
    });

    try { elemento.load(); } catch (e) { /* ignorado */ }

    slider.value = Math.round(volumeBase * 100);
    slider.addEventListener('input', function () {
      volumeBase = slider.value / 100;
      volumeAlvo = volumeBase;
      elemento.volume = volumeAlvo;
      U.guardar.escrever('volume', volumeBase);
    });

    botao.addEventListener('click', alternar);

    var salvo = U.guardar.ler('volume', null);
    if (salvo !== null) {
      volumeBase = U.limitar(salvo, 0, 1);
      volumeAlvo = volumeBase;
      slider.value = Math.round(volumeBase * 100);
    }
  }

  function habilitar() {
    disponivel = true;
    if (controle) controle.hidden = false;
  }

  function alternar() {
    if (!disponivel) return;
    if (tocando) pausar(); else tocar();
  }

  function tocar() {
    if (!disponivel) return;
    var p = elemento.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { /* o navegador recusou: o botão continua ali */ });
    }
    tocando = true;
    botao.setAttribute('aria-pressed', 'true');
    botao.setAttribute('aria-label', 'Pausar a música');
    fade(volumeAlvo, 3000);
    if (window.SFX) SFX.definirAtivo(true);
  }

  function pausar() {
    if (!disponivel) return;
    tocando = false;
    botao.setAttribute('aria-pressed', 'false');
    botao.setAttribute('aria-label', 'Ligar a música');
    fade(0, 900, function () { elemento.pause(); });
    if (window.SFX) SFX.definirAtivo(false);
  }

  /* Primeira interação da pessoa: é aqui que a música entra */
  function despertar() {
    if (disponivel && !tocando) tocar();
  }

  /* Transição suave de volume */
  function fade(destino, duracao, aoFim) {
    if (!disponivel) return;
    clearInterval(fadeTimer);

    var inicio = elemento.volume;
    var t0 = performance.now();

    fadeTimer = setInterval(function () {
      var t = U.limitar((performance.now() - t0) / duracao, 0, 1);
      elemento.volume = U.limitar(inicio + (destino - inicio) * t, 0, 1);
      if (t >= 1) {
        clearInterval(fadeTimer);
        if (aoFim) aoFim();
      }
    }, 40);
  }

  /* Cada cena tem uma intensidade própria.
     A carta e o pedido são os picos; o desfecho baixa quase até o silêncio. */
  var intensidades = {
    abertura:   0.55,
    capitulo1:  0.7,
    capitulo2:  0.8,
    capitulo3:  0.85,
    capitulo4:  1.0,
    transicao:  0.6,
    pedido:     1.0,
    desfecho:   0.25
  };

  function ajustarParaCena(nome) {
    var fator = intensidades[nome];
    if (fator === undefined) fator = 0.8;
    volumeAlvo = volumeBase * fator;
    if (tocando) fade(volumeAlvo, 2600);
  }

  return {
    iniciar: iniciar,
    despertar: despertar,
    ajustarParaCena: ajustarParaCena,
    estaDisponivel: function () { return disponivel; }
  };
})();

/* ============================================================================
   SCENES.JS — a montagem de cada capítulo
   ----------------------------------------------------------------------------
   Cada função devolve um objeto:
   { nome, ato, construir() }  →  construir() devolve o elemento da cena.
   Nenhum texto é escrito aqui: tudo vem do CONFIG.
   ========================================================================== */

var Cenas = (function () {
  'use strict';

  var el = U.el;

  /* --------------------------------------------------------------
     Peças reutilizadas
     -------------------------------------------------------------- */
  function botao(texto, aoClicar, respira) {
    return el('button', {
      class: 'botao' + (respira ? ' respira' : ''),
      type: 'button',
      text: texto,
      onclick: aoClicar
    });
  }

  /* Laço da fita que amarra o envelope, desenhado em SVG.
     Original — não é uma referência a nenhum filme específico,
     é só um laço de fita como qualquer carta antiga teria. */
  function laco() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'laco');
    svg.setAttribute('viewBox', '0 0 60 34');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><linearGradient id="fita-grad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#9A3A4E"/>' +
      '<stop offset="55%" stop-color="#6E2436"/>' +
      '<stop offset="100%" stop-color="#4E1825"/>' +
      '</linearGradient></defs>' +
      '<path d="M30 17 C21 3 3 4 4 17 C3 30 21 31 30 17 Z" fill="url(#fita-grad)"/>' +
      '<path d="M30 17 C39 3 57 4 56 17 C57 30 39 31 30 17 Z" fill="url(#fita-grad)"/>' +
      '<rect x="24.5" y="10.5" width="11" height="13" rx="2.4" fill="#4E1825"/>';
    return svg;
  }

  /* Flor prensada no canto da carta — dessaturada e frágil, como
     algo guardado por muito tempo entre as páginas. É também o
     gatilho discreto do quiz: por isso é um botão, não só um
     enfeite. Ninguém precisa saber disso olhando pra ela. */
  function florPrensada() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 90 90');
    svg.setAttribute('aria-hidden', 'true');

    var petala =
      'M45 45 C45 45 30 38 26 24 C24 16 30 8 38 10 C45 12 45 24 45 45 Z';
    var cores = ['#8B6E85', '#7C6280', '#93748C', '#6F5A79', '#9A7C8E'];
    var rotacoes = [0, 72, 144, 216, 288];

    var petalas = rotacoes.map(function (ang, i) {
      return '<path transform="rotate(' + ang + ' 45 45)" d="' + petala +
        '" fill="' + cores[i] + '" opacity=".72"/>';
    }).join('');

    svg.innerHTML =
      '<g>' + petalas +
      '<circle cx="45" cy="45" r="6" fill="#B89A6E" opacity=".8"/>' +
      '<path d="M45 45 C45 45 30 38 26 24" fill="none" stroke="#4A3A46" ' +
      'stroke-width=".6" opacity=".35"/>' +
      '</g>';

    var botaoFlor = el('button', {
      class: 'flor-prensada',
      type: 'button',
      'aria-label': 'Uma flor guardada.'
    });
    botaoFlor.appendChild(svg);
    botaoFlor.addEventListener('click', function () { abrirQuiz(); });
    return botaoFlor;
  }

  /* Botão que aparece no meio de uma cena já montada (depois das
     memórias, depois da carta). Ele se anuncia e se traz para a
     vista, para nunca ficar escondido abaixo da dobra. */
  function revelarBotao(area, texto, aoClicar) {
    if (area.firstChild) return;
    var b = botao(texto, aoClicar, true);
    b.classList.add('chegando');
    area.appendChild(b);
    setTimeout(function () {
      try {
        b.scrollIntoView({
          behavior: U.movimentoReduzido() ? 'auto' : 'smooth',
          block: 'center'
        });
      } catch (e) { /* navegador antigo */ }
    }, 700);
    return b;
  }

  function cabecalho(rotulo, titulo) {
    var frag = document.createDocumentFragment();
    frag.appendChild(el('p', { class: 'rotulo', text: rotulo }));
    frag.appendChild(el('div', { class: 'filete', 'aria-hidden': 'true' }));
    frag.appendChild(el('h2', { class: 'titulo-capitulo', html: U.linhas(titulo) }));
    return frag;
  }

  function cena(nome, filhos) {
    var s = el('section', { class: 'scene', 'aria-label': nome });
    filhos.forEach(function (f) { if (f) s.appendChild(f); });
    return s;
  }

  /* Lista de elementos que podem receber foco dentro de um overlay,
     na ordem em que aparecem. Usada para o Tab circular direitinho
     entre eles, em vez de sempre voltar pro botão de fechar. */
  function focosDisponiveis(container) {
    var seletor = 'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.prototype.filter.call(container.querySelectorAll(seletor), function (elemento) {
      var estilo = window.getComputedStyle(elemento);
      return estilo.display !== 'none' && estilo.visibility !== 'hidden';
    });
  }

  /* Base genérica de overlay: cuida de fechar, tecla Escape, clique
     fora e foco. Quem chama só precisa entregar o elemento de dentro,
     já com um .fechar-janela no lugar certo. */
  function montarOverlay(conteudoInterno, ariaLabel) {
    var anterior = document.activeElement;

    conteudoInterno.setAttribute('role', 'dialog');
    conteudoInterno.setAttribute('aria-modal', 'true');
    conteudoInterno.setAttribute('aria-label', ariaLabel);

    var janela = el('div', { class: 'janela' }, conteudoInterno);
    var fechar = conteudoInterno.querySelector('.fechar-janela');

    function encerrar() {
      janela.classList.add('saindo');
      setTimeout(function () {
        janela.remove();
        if (anterior && anterior.focus) anterior.focus();
      }, 320);
      document.removeEventListener('keydown', aoTeclar);
    }

    function aoTeclar(e) {
      if (e.key === 'Escape') { encerrar(); return; }
      if (e.key !== 'Tab') return;

      var itens = focosDisponiveis(conteudoInterno);
      if (!itens.length) { e.preventDefault(); return; }

      var atual = itens.indexOf(document.activeElement);
      var proximo;
      if (e.shiftKey) {
        proximo = atual <= 0 ? itens.length - 1 : atual - 1;
      } else {
        proximo = (atual === -1 || atual === itens.length - 1) ? 0 : atual + 1;
      }
      e.preventDefault();
      itens[proximo].focus();
    }

    if (fechar) fechar.addEventListener('click', encerrar);
    janela.addEventListener('click', function (e) { if (e.target === janela) encerrar(); });
    document.addEventListener('keydown', aoTeclar);

    document.body.appendChild(janela);
    if (fechar) fechar.focus();
    return encerrar;
  }

  /* Janela flutuante das memórias e da carta secreta */
  function abrirJanela(titulo, texto, imagem, alt) {
    var fechar = el('button', {
      class: 'fechar-janela', type: 'button', 'aria-label': 'Fechar', text: '×'
    });

    var conteudo = el('div', { class: 'janela-conteudo' });
    conteudo.appendChild(fechar);
    conteudo.appendChild(el('h3', { text: titulo }));
    if (imagem) {
      var f = U.foto(imagem, alt, '', 'polaroid');
      if (f) conteudo.appendChild(f);
    }
    conteudo.appendChild(U.paragrafos(texto));

    montarOverlay(conteudo, titulo);
  }

  /* --------------------------------------------------------------
     JOGO DA MEMÓRIA — segredo: três toques seguidos na lua
     -------------------------------------------------------------- */
  var SIMBOLOS_PAR = ['♡', '🦋', '✦', '☾'];

  function embaralhar(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = lista[i]; lista[i] = lista[j]; lista[j] = tmp;
    }
    return lista;
  }

  function abrirJogoDaMemoria() {
    var cfg = CONFIG.jogoDaMemoria || {};
    var fotos = cfg.fotos || [];

    // Quatro pares. Cada carta carrega o índice do par a que pertence.
    var cartas = [];
    for (var i = 0; i < 4; i++) {
      cartas.push({ par: i }, { par: i });
    }
    embaralhar(cartas);

    var fechar = el('button', {
      class: 'fechar-janela', type: 'button', 'aria-label': 'Fechar', text: '×'
    });

    var conteudo = el('div', { class: 'janela-conteudo janela-jogo' });
    conteudo.appendChild(fechar);
    conteudo.appendChild(el('h3', { text: cfg.titulo || 'Você se lembra?' }));
    conteudo.appendChild(el('p', { class: 'jogo-instrucao', text: cfg.instrucao || '' }));

    var grade = el('div', { class: 'jogo-grade' });
    var progresso = el('p', { class: 'jogo-progresso' });

    var viradas = [];       // cartas viradas no momento, aguardando comparação
    var paresEncontrados = 0;
    var travado = false;

    function atualizarProgresso() {
      progresso.textContent = paresEncontrados + ' de 4 pares encontrados.';
    }
    atualizarProgresso();

    cartas.forEach(function (dados, indice) {
      var foto = fotos[dados.par];

      var frente = el('span', { class: 'carta-jogo-frente' });
      if (foto && foto.src) {
        var img = el('img', {
          src: foto.src,
          alt: U.preenchido(foto.alt) ? foto.alt : 'Uma foto nossa',
          loading: 'lazy'
        });
        // Sem a foto ainda: cai para o símbolo, sem quebrar o jogo.
        img.addEventListener('error', function () {
          img.replaceWith(el('span', {
            class: 'simbolo-par', 'aria-hidden': 'true',
            text: SIMBOLOS_PAR[dados.par]
          }));
        });
        frente.appendChild(img);
      } else {
        frente.appendChild(el('span', {
          class: 'simbolo-par', 'aria-hidden': 'true',
          text: SIMBOLOS_PAR[dados.par]
        }));
      }

      var carta = el('button', {
        class: 'carta-jogo',
        type: 'button',
        'aria-label': 'Carta virada para baixo',
        'data-par': String(dados.par)
      }, [
        el('span', { class: 'carta-jogo-verso', 'aria-hidden': 'true', text: '✦' }),
        frente
      ]);
      carta._par = dados.par;

      carta.addEventListener('click', function () {
        if (travado || carta.classList.contains('virada') || carta.classList.contains('combinada')) return;

        carta.classList.add('virada');
        carta.setAttribute('aria-label', 'Carta virada, mostrando a foto');
        viradas.push(carta);

        if (viradas.length === 2) {
          travado = true;
          var a = viradas[0], b = viradas[1];

          if (a._par === b._par) {
            setTimeout(function () {
              a.classList.add('combinada');
              b.classList.add('combinada');
              a.disabled = true;
              b.disabled = true;
              paresEncontrados++;
              atualizarProgresso();
              if (window.SFX) SFX.sino();

              var r = b.getBoundingClientRect();
              Particulas.explodir(r.left + r.width / 2, r.top + r.height / 2, 14);

              viradas = [];
              travado = false;

              if (paresEncontrados >= 4) {
                setTimeout(function () {
                  progresso.textContent = cfg.mensagemFinal || 'Encontrou todos os pares. ♡';
                  progresso.classList.add('completo');
                  if (window.SFX) SFX.acorde();
                  App.registrarSegredo();
                }, 350);
              }
            }, 260);
          } else {
            setTimeout(function () {
              a.classList.add('errou');
              b.classList.add('errou');
              setTimeout(function () {
                a.classList.remove('virada', 'errou');
                b.classList.remove('virada', 'errou');
                a.setAttribute('aria-label', 'Carta virada para baixo');
                b.setAttribute('aria-label', 'Carta virada para baixo');
                viradas = [];
                travado = false;
              }, 550);
            }, 550);
          }
        }
      });

      grade.appendChild(carta);
    });

    conteudo.appendChild(grade);
    conteudo.appendChild(progresso);

    montarOverlay(conteudo, cfg.titulo || 'Você se lembra?');
  }

  /* --------------------------------------------------------------
     QUIZ — segredo: tocar na flor prensada da carta
     -------------------------------------------------------------- */
  function abrirQuiz() {
    var cfg = CONFIG.quiz || {};
    var perguntas = (cfg.perguntas || []).filter(function (p) {
      return U.preenchido(p.pergunta);
    });

    if (!perguntas.length) return; // ninguém preencheu o quiz ainda

    var fechar = el('button', {
      class: 'fechar-janela', type: 'button', 'aria-label': 'Fechar', text: '×'
    });

    var conteudo = el('div', { class: 'janela-conteudo janela-quiz' });
    conteudo.appendChild(fechar);
    conteudo.appendChild(el('h3', { text: cfg.titulo || 'Só um teste.' }));

    var corpo = el('div');
    conteudo.appendChild(corpo);

    var indice = 0;

    function mostrarPergunta() {
      corpo.innerHTML = '';
      var p = perguntas[indice];

      corpo.appendChild(el('p', { class: 'quiz-pergunta', text: p.pergunta }));

      var opcoesEl = el('div', { class: 'quiz-opcoes' });
      p.opcoes.forEach(function (texto, i) {
        if (!U.preenchido(texto)) return;
        var opcao = el('button', {
          class: 'quiz-opcao', type: 'button', text: texto
        });
        opcao.addEventListener('click', function () {
          var botoes = opcoesEl.querySelectorAll('.quiz-opcao');
          Array.prototype.forEach.call(botoes, function (b) { b.disabled = true; });

          opcoesEl.children[p.correta] && opcoesEl.children[p.correta].classList.add('certa');
          if (i !== p.correta) opcao.classList.add('errada');

          if (window.SFX) SFX.sino();

          setTimeout(function () {
            indice++;
            if (indice < perguntas.length) {
              mostrarPergunta();
            } else {
              corpo.innerHTML = '';
              corpo.appendChild(el('p', {
                class: 'quiz-final',
                text: cfg.mensagemFinal || 'Eu sabia que você lembrava de tudo. ♡'
              }));
              if (window.SFX) SFX.acorde();
              App.registrarSegredo();
            }
          }, 1100);
        });
        opcoesEl.appendChild(opcao);
      });
      corpo.appendChild(opcoesEl);

      corpo.appendChild(el('p', {
        class: 'quiz-progresso',
        text: (indice + 1) + ' de ' + perguntas.length
      }));
    }

    mostrarPergunta();
    montarOverlay(conteudo, cfg.titulo || 'Só um teste.');
  }

  /* Reabre a carta do Capítulo IV, com o mesmo visual de pergaminho.
     Diferente da primeira leitura, os parágrafos já aparecem prontos
     — ela já passou pelo ritmo de leitura na primeira vez. */
  function relerCarta() {
    var carta = CONFIG.carta;

    var fechar = el('button', {
      class: 'fechar-janela', type: 'button', 'aria-label': 'Fechar', text: '×'
    });

    var bloco = el('article', { class: 'carta carta-flutuante' });
    bloco.appendChild(fechar);
    bloco.appendChild(el('div', { class: 'intro' }, [U.paragrafos(carta.introducao)]));

    var corpo = el('div', { class: 'corpo' });
    corpo.appendChild(U.paragrafos(carta.corpo, 'paragrafo'));
    bloco.appendChild(corpo);

    if (U.preenchido(carta.assinatura)) {
      bloco.appendChild(el('span', { class: 'assinatura-carta', text: carta.assinatura }));
    }

    bloco.appendChild(florPrensada());

    montarOverlay(bloco, 'A carta');
  }

  /* ==============================================================
     CENA 0 — ABERTURA
     ============================================================== */
  var abertura = {
    nome: 'abertura',
    ato: 1,
    construir: function () {
      var c = CONFIG.abertura;
      return cena('Abertura', [
        el('p', { class: 'sobretitulo', text: c.sobretitulo }),
        el('h1', { class: 'titulo-principal', html: U.linhas(c.titulo) }),
        el('div', { class: 'filete', 'aria-hidden': 'true' }),
        el('p', { class: 'texto', html: U.linhas(c.subtitulo) }),
        botao(c.botao, function () { App.avancar(); }, true)
      ]);
    }
  };

  /* ==============================================================
   CENA 1 — CAPÍTULO I
   ============================================================== */
var capitulo1 = {
  nome: 'capitulo1',
  ato: 1,

  construir: function () {
    var c = CONFIG.capituloUm;
    var casal = CONFIG.casal;

    var partes = [];

    partes.push(cabecalho(c.rotulo, c.titulo));
    partes.push(
      el('div', { class: 'texto' }, [
        U.paragrafos(c.texto)
      ])
    );

    // Nomes, data e local
    var marca = [];

    if (U.preenchido(casal.eu) && U.preenchido(casal.ela)) {
      var nomeEu = casal.eu.split(' ')[0];
      var nomeEla = casal.ela.split(' ')[0];

      marca.push(nomeEu + ' & ' + nomeEla);
    } else if (U.preenchido(casal.eu)) {
      marca.push(casal.eu);
    } else if (U.preenchido(casal.ela)) {
      marca.push(casal.ela);
    }

    if (U.preenchido(casal.dataInicio)) {
      marca.push(casal.dataInicio);
    }

    if (U.preenchido(casal.local)) {
      marca.push(casal.local);
    }

    if (marca.length) {
      partes.push(
        el('p', {
          class: 'assinatura',
          text: marca.join(' · ')
        })
      );
    }

    var f = U.foto(c.foto, c.fotoAlt, c.fotoLegenda);

    if (f) {
      partes.push(f);
    }

    partes.push(
      el('div', { class: 'texto suave' }, [
        U.paragrafos(c.relato)
      ])
    );

    partes.push(
      botao(c.botao, function () {
        App.avancar();
      })
    );

    var s = cena('Capítulo um', []);

    partes.forEach(function (p) {
      // fragmentos precisam virar elementos para o escalonamento funcionar
      if (p.nodeType === 11) {
        var wrap = el('div');
        wrap.appendChild(p);
        s.appendChild(wrap);
      } else {
        s.appendChild(p);
      }
    });

    return s;
  }
};

  /* ==============================================================
     CENA 2 — CAPÍTULO II (as três memórias)
     ============================================================== */
  var capitulo2 = {
    nome: 'capitulo2',
    ato: 2,
    construir: function () {
      var c = CONFIG.capituloDois;
      var abertas = 0;
      var total = CONFIG.memorias.length;

      var progresso = el('p', { class: 'progresso', role: 'status' });
      var areaBotao = el('div');

      function atualizarProgresso() {
        if (abertas >= total) {
          progresso.textContent = 'Você encontrou todas. ♡';
          progresso.classList.add('completo');
          revelarBotao(areaBotao, c.botao, function () { App.avancar(); });
        } else {
          progresso.textContent = abertas + ' de ' + total + ' memórias descobertas.';
        }
      }

      var medalhoes = el('div', { class: 'medalhoes' });

      CONFIG.memorias.forEach(function (m, i) {
        var b = el('button', {
          class: 'medalhao',
          type: 'button',
          'aria-label': m.titulo + ', ainda fechada'
        }, [
          el('span', { class: 'selo' }, [
            el('span', { class: 'icone', 'aria-hidden': 'true', text: m.icone || '♡' })
          ]),
          el('span', { class: 'legenda', text: m.titulo })
        ]);

        b.addEventListener('click', function () {
          if (!b.classList.contains('aberta')) {
            b.classList.add('aberta');
            b.setAttribute('aria-label', m.titulo + ', já aberta');
            abertas++;
            atualizarProgresso();

            var r = b.getBoundingClientRect();
            Particulas.explodir(r.left + r.width / 2, r.top + r.height / 2, 22);
          }
          abrirJanela(m.titulo, m.texto, m.imagem, m.alt);
        });

        medalhoes.appendChild(b);
      });

      atualizarProgresso();

      var s = cena('Capítulo dois', []);
      s.appendChild(el('div', {}, [cabecalho(c.rotulo, c.titulo)]));
      s.appendChild(el('div', { class: 'texto' }, [U.paragrafos(c.texto)]));
      s.appendChild(el('p', { class: 'texto suave', text: c.instrucao }));
      s.appendChild(medalhoes);
      s.appendChild(progresso);
      s.appendChild(areaBotao);
      return s;
    }
  };

  /* ==============================================================
     CENA 3 — CAPÍTULO III
     ============================================================== */
  var capitulo3 = {
    nome: 'capitulo3',
    ato: 2,
    construir: function () {
      var c = CONFIG.capituloTres;

      var lista = el('ul', { class: 'lista-amor' });
      c.itens.forEach(function (item, i) {
        lista.appendChild(el('li', {}, [
          el('span', { class: 'numero', 'aria-hidden': 'true',
                       text: String(i + 1).padStart(2, '0') }),
          el('span', { text: item })
        ]));
      });

      var retratos = el('div', { class: 'retratos' });
      (c.fotos || []).forEach(function (f) {
        var r = U.foto(f.src, f.alt, '', 'retrato');
        if (r) retratos.appendChild(r);
      });

      // Carta secreta: só aparece para quem reparar
      var secreta = null;
      if (CONFIG.cartaSecreta && U.preenchido(CONFIG.cartaSecreta.texto)) {
        secreta = el('button', {
          class: 'pista-secreta',
          type: 'button',
          text: CONFIG.cartaSecreta.pista || '❦',
          onclick: function () {
            abrirJanela('Achou.', CONFIG.cartaSecreta.texto, '', '');
            App.registrarSegredo();
          }
        });
      }

      var s = cena('Capítulo três', []);
      s.appendChild(el('div', {}, [cabecalho(c.rotulo, c.titulo)]));
      s.appendChild(lista);
      if (retratos.children.length) s.appendChild(retratos);
      s.appendChild(el('div', { class: 'texto' }, [U.paragrafos(c.mensagem)]));
      if (secreta) s.appendChild(secreta);
      s.appendChild(botao(c.botao, function () { App.avancar(); }));
      return s;
    }
  };

  /* ==============================================================
     CENA 4 — CAPÍTULO IV (envelope e carta)
     ============================================================== */
  var capitulo4 = {
    nome: 'capitulo4',
    ato: 3,
    construir: function () {
      var c = CONFIG.capituloQuatro;
      var carta = CONFIG.carta;

      var areaCarta = el('div');
      var areaBotao = el('div');

      var envelope = el('button', {
        class: 'envelope',
        type: 'button',
        'aria-label': 'Abrir o envelope'
      }, [
        el('span', { class: 'envelope-corpo', 'aria-hidden': 'true' }),
        el('span', { class: 'envelope-lados', 'aria-hidden': 'true' }),
        el('span', { class: 'fita-horizontal', 'aria-hidden': 'true' }),
        el('span', { class: 'envelope-dobra', 'aria-hidden': 'true' }),
        laco(),
        el('span', { class: 'lacre', 'aria-hidden': 'true', text: '♥' })
      ]);

      var aberto = false;

      envelope.addEventListener('click', function () {
        if (aberto) return;
        aberto = true;
        envelope.setAttribute('aria-label', 'Envelope aberto');
        envelope.disabled = true;

        // Primeiro a fita se desamarra. Só depois o lacre quebra e a
        // aba abre — como alguém realmente desembrulhando uma carta.
        envelope.classList.add('desamarrando');

        var tempoFita = U.movimentoReduzido() ? 60 : 620;
        setTimeout(function () {
          envelope.classList.add('aberto');
          if (window.SFX) SFX.quebrarLacre();

          var r = envelope.getBoundingClientRect();
          Particulas.explodir(r.left + r.width / 2, r.top + r.height / 2, 26);

          setTimeout(revelarCarta, U.movimentoReduzido() ? 60 : 1000);
        }, tempoFita);
      });

      function revelarCarta() {
        var bloco = el('article', { class: 'carta revelando' });
        bloco.appendChild(el('div', { class: 'intro' }, [U.paragrafos(carta.introducao)]));

        var corpo = el('div', { class: 'corpo' });
        corpo.appendChild(U.paragrafos(carta.corpo, 'paragrafo'));
        bloco.appendChild(corpo);

        if (U.preenchido(carta.assinatura)) {
          bloco.appendChild(el('span', { class: 'assinatura-carta', text: carta.assinatura }));
        }

        bloco.appendChild(florPrensada());

        areaCarta.appendChild(bloco);

        // A partir de agora ela pode reler a carta a qualquer momento
        // pelo botão discreto no canto inferior esquerdo.
        var relerBtn = document.getElementById('reler-carta');
        if (relerBtn && relerBtn.hidden) {
          relerBtn.hidden = false;
          relerBtn.classList.add('disponivel');
          relerBtn.addEventListener('click', function () { Cenas.relerCarta(); });
        }

        // O botão de continuar só aparece depois de um tempo mínimo
        // de leitura, para ela não pular a carta sem querer.
        // Este agendamento vem antes de qualquer outra coisa: nada pode
        // impedir que o botão apareça, senão a história fica presa aqui.
        var espera = U.movimentoReduzido() ? 1500 : 8000;
        setTimeout(function () {
          revelarBotao(areaBotao, c.botao || 'Continuar', function () { App.avancar(); });
        }, espera);

        try {
          bloco.scrollIntoView({
            behavior: U.movimentoReduzido() ? 'auto' : 'smooth',
            block: 'start'
          });
        } catch (e) { /* navegador antigo: sem rolagem automática */ }
      }

      var s = cena('Capítulo quatro', []);
      s.appendChild(el('div', {}, [cabecalho(c.rotulo, c.titulo)]));
      s.appendChild(el('div', { class: 'texto' }, [U.paragrafos(c.texto)]));
      s.appendChild(el('p', { class: 'texto suave', text: c.instrucao }));
      s.appendChild(envelope);
      s.appendChild(areaCarta);
      s.appendChild(areaBotao);
      return s;
    }
  };

  /* ==============================================================
     CENA 5 — A TRANSIÇÃO (avança sozinha)
     ============================================================== */
  var transicao = {
    nome: 'transicao',
    ato: 3,
    automatica: true,
    construir: function () {
      var linhas = CONFIG.transicao || [];
      var caixa = el('div', { class: 'texto' });
      var s = cena('Transição', [caixa]);

      var reduzido = U.movimentoReduzido();
      var duracao = reduzido ? 2200 : 5200;

      linhas.forEach(function (linha, i) {
        setTimeout(function () {
          var p = el('p', { class: 'frase-transicao', html: U.linhas(linha) });
          caixa.innerHTML = '';
          caixa.appendChild(p);
        }, i * duracao);
      });

      // Silêncio proposital antes do pedido
      setTimeout(function () {
        caixa.innerHTML = '';
        setTimeout(function () { App.avancar(); }, reduzido ? 400 : 1800);
      }, linhas.length * duracao);

      return s;
    }
  };

  /* ==============================================================
     CENA 6 — O PEDIDO
     ============================================================== */
  var pedido = {
    nome: 'pedido',
    ato: 3,
    construir: function () {
      var c = CONFIG.pedido;

      // Aliança desenhada em SVG
      var alianca = el('div', { class: 'alianca-wrap', 'aria-hidden': 'true' });
      alianca.innerHTML =
        '<svg class="alianca" viewBox="0 0 120 140" width="86" height="100" role="img">' +
        '<defs>' +
        '<linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#F2DDB4"/>' +
        '<stop offset="45%" stop-color="#C89B5A"/>' +
        '<stop offset="100%" stop-color="#8A6733"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<ellipse cx="60" cy="88" rx="34" ry="40" fill="none" ' +
        'stroke="url(#ouro)" stroke-width="7"/>' +
        '<path d="M60 26 L72 44 L60 56 L48 44 Z" fill="#E9EDF4" opacity=".92"/>' +
        '<path d="M60 26 L72 44 L60 44 Z" fill="#8EB5D8" opacity=".85"/>' +
        '</svg>';

      var s = cena('O pedido', [
        el('p', { class: 'sobretitulo', text: c.sobretitulo }),
        alianca,
        el('h2', { class: 'titulo-principal', html: U.linhas(c.pergunta) }),
        el('div', { class: 'filete', 'aria-hidden': 'true' }),
        el('p', { class: 'texto', html: U.linhas(c.explicacao) }),
        botao(c.botao, function () { App.finalizar(); }, true)
      ]);
      return s;
    }
  };

  /* ==============================================================
     CENA 7 — O DESFECHO (sem nenhum botão)
     ============================================================== */
  var desfecho = {
    nome: 'desfecho',
    ato: 3,
    construir: function () {
      var c = CONFIG.desfecho;
      var caixa = el('div', { class: 'texto' });

      var s = cena('Desfecho', [
        caixa,
        el('p', {}, [el('span', { class: 'coracao-final', text: c.simbolo || '♥' })])
      ]);

      var reduzido = U.movimentoReduzido();
      (c.linhas || []).forEach(function (linha, i) {
        setTimeout(function () {
          var p = el('p', { html: U.linhas(linha), style: 'opacity:0' });
          caixa.appendChild(p);
          requestAnimationFrame(function () {
            p.style.transition = 'opacity 1.8s ease';
            p.style.opacity = '1';
          });
        }, reduzido ? i * 300 : 900 + i * 2600);
      });

      return s;
    }
  };

  return {
    lista: [abertura, capitulo1, capitulo2, capitulo3, capitulo4, transicao, pedido, desfecho],
    abrirJanela: abrirJanela,
    relerCarta: relerCarta,
    abrirJogoDaMemoria: abrirJogoDaMemoria
  };
})();

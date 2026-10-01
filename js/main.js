/* ============================================================================
   MAIN.JS — a linha do tempo da história
   ----------------------------------------------------------------------------
   Controla a ordem das cenas, as transições, a intensidade da lua,
   os segredos das borboletas e a animação final.
   ========================================================================== */

var App = (function () {
  'use strict';

  var palco, cortina, sussurro;
  var indice = 0;
  var trocando = false;
  var segredosEncontrados = 0;
  var douradaLiberada = false;
  var ultimoSussurro = -1;
  var borboletasTocadas = 0;
  var cliquesLua = [];

  /* Intensidade da lua por cena: a luz cresce conforme a história avança */
  var LUA = {
    abertura: 0.5, capitulo1: 0.45, capitulo2: 0.55,
    capitulo3: 0.6, capitulo4: 0.75, transicao: 0.3,
    pedido: 1, desfecho: 0.55
  };

  /* Quanto de dourado entra na tela (0 = frio, 1 = quente) */
  var CALOR = {
    abertura: 0, capitulo1: 0, capitulo2: 0.05,
    capitulo3: 0.12, capitulo4: 0.35, transicao: 0.15,
    pedido: 0.85, desfecho: 0.4
  };

  /* --------------------------------------------------------------
     Céu estrelado
     -------------------------------------------------------------- */
  function semearEstrelas() {
    var area = document.getElementById('stars');
    if (!area) return;
    var quantidade = window.innerWidth < 600 ? 44 : 78;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < quantidade; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.top = (Math.random() * 62).toFixed(2) + '%';
      s.style.setProperty('--dur', U.aleatorio(2.5, 6).toFixed(1) + 's');
      s.style.setProperty('--atraso', U.aleatorio(0, 5).toFixed(1) + 's');
      var tam = U.aleatorio(1, 2.6).toFixed(1);
      s.style.width = tam + 'px';
      s.style.height = tam + 'px';
      s.style.opacity = U.aleatorio(0.3, 0.9).toFixed(2);
      frag.appendChild(s);
    }
    area.appendChild(frag);
  }

  /* --------------------------------------------------------------
     Troca de cena
     -------------------------------------------------------------- */
  function montar(cenaDef) {
    palco.innerHTML = '';   // remove também a seta de rolagem da cena anterior
    palco.classList.remove('tem-mais');

    var elemento = cenaDef.construir();
    elemento.classList.add('entrando');
    palco.appendChild(elemento);
    U.escalonar(elemento);

    // Assim que a sequência de entrada termina, tiramos a classe.
    // Sem isso, qualquer elemento criado depois (o botão que surge ao
    // fim da carta, por exemplo) nasceria com opacidade zero.
    var filhos = elemento.children.length;
    var fim = U.movimentoReduzido() ? 60 : (filhos * 260 + 1400);
    setTimeout(function () {
      elemento.classList.remove('entrando');
      Array.prototype.forEach.call(elemento.children, function (f) {
        f.style.opacity = '';
      });
    }, fim);

    vigiarRolagem(elemento);
    document.body.setAttribute('data-scene', cenaDef.nome);
    document.body.setAttribute('data-act', String(cenaDef.ato));
    document.documentElement.style.setProperty('--intensidade-lua',
      String(LUA[cenaDef.nome] !== undefined ? LUA[cenaDef.nome] : 0.55));
    document.documentElement.style.setProperty('--calor',
      String(CALOR[cenaDef.nome] !== undefined ? CALOR[cenaDef.nome] : 0));

    Particulas.definirCena(cenaDef.nome);
    Musica.ajustarParaCena(cenaDef.nome);

    // Leva o foco para o primeiro elemento interativo da cena
    var alvo = elemento.querySelector('button:not([disabled])');
    if (alvo && indice > 0) {
      setTimeout(function () { alvo.focus({ preventScroll: true }); }, 900);
    }
  }

  /* --------------------------------------------------------------
     Aviso de rolagem
     Em telas pequenas o botão de continuar pode ficar abaixo da
     dobra. Uma seta discreta avisa, e leva até ele.
     -------------------------------------------------------------- */
  function vigiarRolagem(cena) {
    var seta = null;

    function criarSeta() {
      if (seta) return seta;
      seta = document.createElement('button');
      seta.type = 'button';
      seta.className = 'rolar';
      seta.textContent = '↓';
      seta.setAttribute('aria-label', 'Ver o resto desta página');
      seta.addEventListener('click', function () {
        cena.scrollBy({
          top: cena.clientHeight * 0.75,
          behavior: U.movimentoReduzido() ? 'auto' : 'smooth'
        });
      });
      palco.appendChild(seta);
      return seta;
    }

    function conferir() {
      var sobra = cena.scrollHeight - cena.clientHeight - cena.scrollTop;
      var tem = sobra > 40;

      // A seta só nasce se a cena realmente transbordar. Assim o
      // desfecho continua sem nenhum elemento clicável.
      if (tem) criarSeta();
      if (seta) seta.classList.toggle('visivel', tem);
      palco.classList.toggle('tem-mais', tem);
    }

    cena.addEventListener('scroll', conferir, { passive: true });
    window.addEventListener('resize', conferir);

    // Reconfere sempre que a cena mudar de altura (carta revelada,
    // botão liberado, memória aberta).
    if (window.MutationObserver) {
      var obs = new MutationObserver(function () { setTimeout(conferir, 60); });
      obs.observe(cena, { childList: true, subtree: true });
    }

    setTimeout(conferir, 300);
    setTimeout(conferir, 1600);
  }

  function irPara(novoIndice) {
    if (trocando) return;
    var cenaDef = Cenas.lista[novoIndice];
    if (!cenaDef) return;

    trocando = true;
    var reduzido = U.movimentoReduzido();
    var duracao = reduzido ? 200 : 900;

    cortina.classList.add('fechada');
    document.body.classList.add('virando');

    setTimeout(function () {
      indice = novoIndice;
      montar(cenaDef);
      cortina.classList.remove('fechada');
      document.body.classList.remove('virando');
      setTimeout(function () { trocando = false; }, duracao);
    }, duracao);
  }

  function avancar() {
    if (indice < Cenas.lista.length - 1) {
      if (window.SFX) SFX.virarPagina();
      irPara(indice + 1);
    }
  }

  /* --------------------------------------------------------------
     Constelação em coração
     Uma curva matemática de coração vira uma sequência de estrelas
     ligadas por um traço fino. Fica pronta desde o início, escondida
     por CSS, e só acende (opacidade) a partir do terceiro ato.
     -------------------------------------------------------------- */
  function desenharConstelacao() {
    var svg = document.getElementById('constelacao');
    var grupo = document.getElementById('constelacao-estrelas');
    var linha = document.getElementById('constelacao-linha');
    if (!svg || !grupo || !linha) return;

    var pontos = [];
    var N = 20;
    for (var i = 0; i < N; i++) {
      var t = (i / N) * Math.PI * 2;
      // Curva clássica de coração, normalizada depois para o viewBox.
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pontos.push([50 + x * 1.55, 32 - y * 1.35]);
    }

    linha.setAttribute('points', pontos.map(function (p) {
      return p[0].toFixed(2) + ',' + p[1].toFixed(2);
    }).join(' '));

    var ns = 'http://www.w3.org/2000/svg';
    pontos.forEach(function (p, i) {
      var estrela = document.createElementNS(ns, 'circle');
      estrela.setAttribute('cx', p[0].toFixed(2));
      estrela.setAttribute('cy', p[1].toFixed(2));
      estrela.setAttribute('r', (0.45 + Math.random() * 0.4).toFixed(2));
      estrela.setAttribute('class', 'estrela-coracao');
      estrela.style.transitionDelay = (i * 85) + 'ms';
      grupo.appendChild(estrela);
    });
  }

  /* --------------------------------------------------------------
     Segredos: tocar nas borboletas
     -------------------------------------------------------------- */
  function registrarSegredo() {
    segredosEncontrados++;
    U.guardar.escrever('segredos', segredosEncontrados);

    if (segredosEncontrados >= 3 && !douradaLiberada) {
      douradaLiberada = true;
      Particulas.adicionarDourada();
      mostrarSussurro('Ela vai ficar com você até o fim.');
    }
  }

  function mostrarSussurro(texto) {
    if (!texto) return;
    sussurro.textContent = texto;
    sussurro.classList.add('visivel');
    clearTimeout(sussurro._t);
    sussurro._t = setTimeout(function () {
      sussurro.classList.remove('visivel');
    }, 4200);
  }

  function frasesSecretas() {
    var lista = (CONFIG.segredos || []).filter(U.preenchido);
    if (!lista.length) return null;
    var i;
    do { i = Math.floor(Math.random() * lista.length); }
    while (lista.length > 1 && i === ultimoSussurro);
    ultimoSussurro = i;
    return lista[i];
  }

  /* A aranha tem frases próprias. Se você quiser trocá-las, elas
     ficam em CONFIG.aranha.frases; sem isso, usamos estas. */
  var ARANHA_PADRAO = [
    'Ela também estava esperando por você.',
    'Cuidado — ela costura o que a gente não diz.',
    'Até as aranhas daqui torcem por nós.'
  ];
  var ultimaAranha = -1;

  function frasesDaAranha() {
    var lista = (CONFIG.aranha && CONFIG.aranha.frases || [])
      .filter(U.preenchido);
    if (!lista.length) lista = ARANHA_PADRAO;
    var i;
    do { i = Math.floor(Math.random() * lista.length); }
    while (lista.length > 1 && i === ultimaAranha);
    ultimaAranha = i;
    return lista[i];
  }

  /* Um contador discreto no canto, que só aparece depois do primeiro
     toque. Cresce a cada borboleta encontrada, ao longo de toda a
     jornada — não zera entre capítulos. */
  function atualizarContadorBorboletas() {
    var caixa = document.getElementById('contador-borboletas');
    var numero = document.getElementById('contador-numero');
    if (!caixa || !numero) return;

    numero.textContent = String(borboletasTocadas);
    caixa.hidden = false;
    requestAnimationFrame(function () { caixa.classList.add('visivel'); });

    caixa.classList.remove('atualizado');
    void caixa.offsetWidth; // força o navegador a reiniciar a animação
    caixa.classList.add('atualizado');
  }

  function aoTocarNaTela(e) {
    // Ignora cliques em coisas com função própria
    if (e.target.closest('button, a, input, .janela, .carta, .foto')) return;

    var x = e.clientX, y = e.clientY;

    // A aranha vem primeiro: ela é menor e mais difícil de acertar,
    // então merece a prioridade quando as duas estão perto.
    if (Particulas.tentarTocarAranha && Particulas.tentarTocarAranha(x, y)) {
      if (window.SFX) SFX.sino();
      mostrarSussurro(frasesDaAranha());
      registrarSegredo();
      return;
    }

    if (Particulas.tentarTocar(x, y)) {
      if (window.SFX) SFX.sino();

      borboletasTocadas++;
      atualizarContadorBorboletas();

      var frase = frasesSecretas();
      if (frase) {
        mostrarSussurro(frase);
        registrarSegredo();
      }
    }
  }

  /* --------------------------------------------------------------
     A lua responde ao toque — e guarda um segredo maior para quem
     tocar nela três vezes seguidas.
     -------------------------------------------------------------- */
  function prepararLua() {
    var lua = document.getElementById('moon');
    if (!lua) return;

    lua.addEventListener('click', function () {
      var estrelas = document.getElementById('stars');
      if (estrelas) {
        estrelas.style.opacity = '1';
        document.documentElement.style.setProperty('--intensidade-lua', '1');
        setTimeout(function () {
          estrelas.style.opacity = '';
          var nome = document.body.getAttribute('data-scene');
          document.documentElement.style.setProperty('--intensidade-lua',
            String(LUA[nome] !== undefined ? LUA[nome] : 0.55));
        }, 2600);
      }

      // Três toques em menos de quatro segundos abrem o jogo da
      // memória, escondido dentro da lua.
      var agora = Date.now();
      cliquesLua = cliquesLua.filter(function (t) { return agora - t < 4000; });
      cliquesLua.push(agora);

      if (cliquesLua.length >= 3) {
        cliquesLua = [];
        if (Cenas.abrirJogoDaMemoria) Cenas.abrirJogoDaMemoria();
      }
    });
  }

  /* --------------------------------------------------------------
     O clique final
     -------------------------------------------------------------- */
  function finalizar() {
    if (trocando) return;
    trocando = true;

    var reduzido = U.movimentoReduzido();
    if (window.SFX) SFX.acorde();

    if (!reduzido) {
      Particulas.convergir();
      var clarao = document.createElement('div');
      clarao.className = 'clarao';
      document.body.appendChild(clarao);
      setTimeout(function () { clarao.remove(); }, 2600);
    }

    setTimeout(function () {
      Particulas.soltar();
      trocando = false;
      irPara(Cenas.lista.length - 1);
      setTimeout(function () { if (window.SFX) SFX.bater(); }, reduzido ? 300 : 1400);
    }, reduzido ? 200 : 2000);
  }

  /* --------------------------------------------------------------
     Início
     -------------------------------------------------------------- */
  function iniciar() {
    palco = document.getElementById('stage');
    cortina = document.getElementById('curtain');
    sussurro = document.getElementById('whisper');

    // Título e descrição vêm do config
    if (CONFIG.meta) {
      if (CONFIG.meta.titulo) document.title = CONFIG.meta.titulo;
      var desc = document.querySelector('meta[name="description"]');
      if (desc && CONFIG.meta.descricao) desc.setAttribute('content', CONFIG.meta.descricao);
    }

    // Cenário e som são enfeites: se algum falhar, a história continua.
    try { semearEstrelas(); } catch (e) {}
    try { desenharConstelacao(); } catch (e) {}
    try { prepararLua(); } catch (e) {}
    try { Particulas.iniciar(); } catch (e) {}
    try { Musica.iniciar(); } catch (e) {}

    segredosEncontrados = U.guardar.ler('segredos', 0) || 0;

    document.addEventListener('click', aoTocarNaTela);

    // A música só começa na primeira ação dela
    document.addEventListener('click', function primeiro() {
      Musica.despertar();
      document.removeEventListener('click', primeiro);
    });

    montar(Cenas.lista[0]);

    // Esconde a tela de carregamento quando tudo estiver pronto
    var loader = document.getElementById('loader');
    function esconder() {
      if (loader) loader.classList.add('pronto');
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(esconder, 350); });
      setTimeout(esconder, 3000); // rede lenta: não deixamos travada
    } else {
      setTimeout(esconder, 900);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  return {
    avancar: avancar,
    finalizar: finalizar,
    registrarSegredo: registrarSegredo,
    mostrarSussurro: mostrarSussurro
  };
})();

/* ============================================================================
   UTILS.JS — ferramentas usadas pelos outros arquivos
   Tudo fica dentro do objeto global U, para não poluir a página.
   ========================================================================== */

var U = (function () {
  'use strict';

  /* Cria um elemento. Exemplo:
     U.el('p', { class: 'texto' }, 'Olá')                                    */
  function el(tag, props, children) {
    var node = document.createElement(tag);
    props = props || {};

    Object.keys(props).forEach(function (chave) {
      var valor = props[chave];
      if (valor === null || valor === undefined || valor === false) return;

      if (chave === 'class') node.className = valor;
      else if (chave === 'html') node.innerHTML = valor;
      else if (chave === 'text') node.textContent = valor;
      else if (chave === 'style') node.setAttribute('style', valor);
      else if (chave.indexOf('on') === 0 && typeof valor === 'function') {
        node.addEventListener(chave.slice(2).toLowerCase(), valor);
      } else {
        node.setAttribute(chave, valor);
      }
    });

    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (filho) {
        if (filho === null || filho === undefined || filho === false) return;
        node.appendChild(typeof filho === 'string'
          ? document.createTextNode(filho)
          : filho);
      });
    }
    return node;
  }

  /* Converte quebras de linha do config em HTML.
     \n\n vira parágrafo novo, \n vira <br>. Escapa HTML por segurança. */
  function escapar(txt) {
    return String(txt)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function paragrafos(texto, classe) {
    var bloco = document.createDocumentFragment();
    String(texto || '').split(/\n\s*\n/).forEach(function (par, i) {
      var p = el('p', { class: classe || null });
      p.innerHTML = escapar(par.trim()).replace(/\n/g, '<br>');
      p.style.setProperty('--p', i);
      bloco.appendChild(p);
    });
    return bloco;
  }

  /* Texto de uma linha só, com <br> onde houver \n */
  function linhas(texto) {
    return escapar(texto || '').replace(/\n/g, '<br>');
  }

  /* Espera em milissegundos (usado com async/await) */
  function esperar(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* O usuário pediu menos movimento? */
  function movimentoReduzido() {
    return window.matchMedia &&
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* localStorage que nunca quebra a página se estiver bloqueado */
  var guardar = {
    ler: function (chave, padrao) {
      try {
        var v = window.localStorage.getItem('ultimapagina:' + chave);
        return v === null ? padrao : JSON.parse(v);
      } catch (e) { return padrao; }
    },
    escrever: function (chave, valor) {
      try {
        window.localStorage.setItem('ultimapagina:' + chave, JSON.stringify(valor));
      } catch (e) { /* modo privado, cookies bloqueados: seguimos sem salvar */ }
    }
  };

  function aleatorio(min, max) { return min + Math.random() * (max - min); }
  function limitar(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function sortear(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

  /* Um texto do config está preenchido de verdade? */
  function preenchido(txt) {
    return typeof txt === 'string' && txt.trim() !== '' && txt.indexOf('«PREENCHER') === -1;
  }

  /* --------------------------------------------------------------
     Monta uma fotografia. Se o arquivo não existir, troca por um
     desenho no lugar — nunca aparece ícone de imagem quebrada.
     estilo: 'polaroid' (padrão) ou 'retrato'
     -------------------------------------------------------------- */
  function foto(src, alt, legenda, estilo) {
    if (!src) return null;

    var ehRetrato = estilo === 'retrato';
    var figura = el('figure', { class: ehRetrato ? 'retrato' : 'foto' });
    var img = el('img', {
      src: src,
      alt: preenchido(alt) ? alt : 'Uma lembrança nossa',
      loading: 'lazy',
      decoding: 'async'
    });

    // Foto que não existe simplesmente não aparece: a cena continua
    // bonita e ela nunca vê um quadro quebrado. O aviso fica só no
    // console, para você saber que faltou um arquivo.
    img.addEventListener('error', function () {
      figura.remove();
      if (window.console && console.warn) {
        console.warn('[Até a Última Página] Foto não encontrada: ' + src);
      }
    });

    figura.appendChild(img);

    if (!ehRetrato && preenchido(legenda)) {
      figura.appendChild(el('figcaption', { text: legenda }));
    }
    return figura;
  }

  /* Numera os filhos de uma cena para a entrada escalonada */
  function escalonar(cena) {
    Array.prototype.forEach.call(cena.children, function (filho, i) {
      filho.style.setProperty('--i', i);
    });
  }

  return {
    el: el,
    paragrafos: paragrafos,
    linhas: linhas,
    escapar: escapar,
    esperar: esperar,
    movimentoReduzido: movimentoReduzido,
    guardar: guardar,
    aleatorio: aleatorio,
    limitar: limitar,
    sortear: sortear,
    preenchido: preenchido,
    foto: foto,
    escalonar: escalonar
  };
})();

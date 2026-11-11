/* Valença Moraes Advocacia — interações */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Cabeçalho ---------- */
  var header = $('.header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = $('#navToggle');
  function closeNav() {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------- Link ativo no menu ---------- */
  var links = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['atuacao', 'escritorio', 'equipe', 'depoimentos', 'contato'].forEach(function (id) {
      var el = document.getElementById(id); if (el) spy.observe(el);
    });
  }

  /* ---------- Slides do hero: fade + scale + blur ---------- */
  var slides = $$('.hero__slide');
  var tabs = $$('.hero__tab');
  var SLIDE_MS = 6500;
  var current = 0;
  var timer = null;
  document.documentElement.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

  function goTo(i) {
    slides[current].classList.remove('is-active');
    current = (i + slides.length) % slides.length;
    var s = slides[current];
    var img = $('img', s);
    if (img && img.loading === 'lazy') img.loading = 'eager';
    // reinicia o ken burns
    s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
    s.classList.add('is-active');
    tabs.forEach(function (t, k) {
      t.classList.toggle('is-active', k === current);
      t.classList.toggle('is-done', k < current);
      t.setAttribute('aria-selected', String(k === current));
      var bar = $('.hero__bar', t);
      bar.style.display = 'none'; void bar.offsetWidth; bar.style.display = '';
    });
  }
  function play() {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(function () { goTo(current + 1); }, SLIDE_MS);
  }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { goTo(k); play(); }); });
  // pré-carrega as próximas imagens depois do load
  window.addEventListener('load', function () {
    slides.forEach(function (s) { var im = $('img', s); if (im) im.loading = 'eager'; });
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? clearInterval(timer) : play(); });
  play();

  /* ---------- Partículas discretas ---------- */
  var canvas = $('#particles');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var dots = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var running = true;

    function size() {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, (w * h) / 22000));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          vx: (Math.random() - 0.5) * 0.08,
          vy: -(Math.random() * 0.12 + 0.03),
          a: Math.random() * 0.35 + 0.08,
          gold: Math.random() > 0.45,
          t: Math.random() * Math.PI * 2
        });
      }
    }
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy; d.t += 0.012;
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
        if (d.x < -5) d.x = w + 5; else if (d.x > w + 5) d.x = -5;
        var alpha = d.a * (0.6 + 0.4 * Math.sin(d.t));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.gold ? 'rgba(227,205,159,' + alpha + ')' : 'rgba(165,185,214,' + alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    size();
    tick();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        var vis = e[0].isIntersecting;
        if (vis && !running) { running = true; tick(); } else if (!vis) running = false;
      }).observe(canvas);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Contadores ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var dur = 1800, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * eased).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Parallax suave ---------- */
  var parallax = $$('[data-parallax]');
  if (parallax.length && !reduceMotion) {
    var ticking = false;
    function updateParallax() {
      var vh = window.innerHeight;
      parallax.forEach(function (el) {
        var host = el.parentElement.getBoundingClientRect();
        if (host.bottom < 0 || host.top > vh) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (host.top + host.height / 2 - vh / 2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Luz que segue o cursor nos cards de área ---------- */
  $$('.area').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Hover 3D leve ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Carrossel de depoimentos ---------- */
  var carousel = $('#carousel');
  if (carousel) {
    var track = $('.carousel__track', carousel);
    var items = $$('.quote', carousel);
    var dotsWrap = $('.carousel__dots', carousel);
    var index = 0, perView = 3, pages = 1, autoTimer = null;

    function computePerView() {
      var w = carousel.offsetWidth;
      return w < 640 ? 1 : w < 980 ? 2 : 3;
    }
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        var b = document.createElement('button');
        b.className = 'carousel__dot';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Grupo ' + (i + 1) + ' de ' + pages);
        b.addEventListener('click', (function (k) { return function () { show(k); restart(); }; })(i));
        dotsWrap.appendChild(b);
      }
    }
    function layout() {
      perView = computePerView();
      pages = Math.max(1, items.length - perView + 1);
      carousel.style.setProperty('--per', perView);
      buildDots();
      show(Math.min(index, pages - 1));
    }
    function show(i) {
      index = (i + pages) % pages;
      var stepPct = 100 / perView;
      track.style.transform = 'translate3d(' + (-index * stepPct) + '%,0,0)';
      $$('.carousel__dot', dotsWrap).forEach(function (d, k) {
        d.classList.toggle('is-active', k === index);
        d.setAttribute('aria-selected', String(k === index));
      });
      items.forEach(function (it, k) {
        it.setAttribute('aria-hidden', String(k < index || k >= index + perView));
      });
    }
    function restart() {
      clearInterval(autoTimer);
      if (!reduceMotion) autoTimer = setInterval(function () { show(index + 1); }, 6000);
    }
    $$('.carousel__arrow', carousel).forEach(function (b) {
      b.addEventListener('click', function () { show(index + parseInt(b.getAttribute('data-dir'), 10)); restart(); });
    });
    carousel.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    carousel.addEventListener('mouseleave', restart);
    carousel.addEventListener('focusin', function () { clearInterval(autoTimer); });

    // swipe no celular
    var sx = null;
    carousel.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; clearInterval(autoTimer); }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      sx = null; restart();
    });

    // a largura das colunas é por porcentagem; o deslocamento usa a largura do item
    track.style.width = '100%';
    layout();
    restart();
    var cr; window.addEventListener('resize', function () { clearTimeout(cr); cr = setTimeout(layout, 150); });
  }

  /* ---------- Atalho: "Consultar" já escolhe a área no formulário ---------- */
  $$('[data-area]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#f-area');
      if (sel) sel.value = a.getAttribute('data-area');
    });
  });

  /* ---------- Máscara de telefone ---------- */
  var tel = $('#f-tel');
  if (tel) {
    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 10) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      else if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      else if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length) out = '(' + d;
      tel.value = out;
    });
  }

  /* ---------- Formulário ---------- */
  var form = $('#contactForm');
  if (form) {
    var rules = {
      'f-nome': function (v) { return v.trim().length >= 3 || 'Informe seu nome completo.'; },
      'f-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido, como nome@email.com.'; },
      'f-tel': function (v) { return v.replace(/\D/g, '').length >= 10 || 'Informe o telefone com DDD.'; },
      'f-area': function (v) { return !!v || 'Selecione a área do seu caso.'; },
      'f-msg': function (v) { return v.trim().length >= 10 || 'Descreva sua situação em poucas linhas.'; }
    };
    function check(id) {
      var el = document.getElementById(id);
      var res = rules[id](el.value);
      var field = el.closest('.field');
      var msg = res === true ? '' : res;
      field.classList.toggle('has-error', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      $('.field__error', field).textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('blur', function () { if (el.value) check(id); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) check(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(rules).map(check).every(Boolean);
      var consent = $('#f-lgpd');
      if (!consent.checked) { ok = false; consent.focus(); }
      if (!ok) {
        var firstErr = $('.field.has-error input, .field.has-error select, .field.has-error textarea', form);
        if (firstErr) firstErr.focus();
        return;
      }
      /* Sem backend: monta a mensagem e direciona para o WhatsApp do escritório.
         Para enviar por e-mail, troque este trecho por um fetch() ao seu endpoint. */
      var data = new FormData(form);
      var text = 'Olá, gostaria de agendar uma consulta.\n\n' +
        'Nome: ' + data.get('nome') + '\n' +
        'E-mail: ' + data.get('email') + '\n' +
        'Telefone: ' + data.get('telefone') + '\n' +
        'Área: ' + data.get('area') + '\n\n' +
        data.get('mensagem');
      $('#formWhats').href = 'https://wa.me/5598991234400?text=' + encodeURIComponent(text);
      var ok$ = $('#formSuccess');
      ok$.hidden = false;
      ok$.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  /* ---------- Modais legais ---------- */
  $$('[data-dialog]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.getAttribute('data-dialog'));
      if (d && d.showModal) d.showModal();
    });
  });

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();

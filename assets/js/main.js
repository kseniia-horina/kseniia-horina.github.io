/* Kseniia Horina — portfolio interactions
   Content lives in the HTML (one file per language). This script only reads it,
   so the same file drives both /index.html and /pl/index.html. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     UI strings that JavaScript writes (everything else is in the HTML)
     ------------------------------------------------------------------ */
  var STRINGS = {
    en: {
      showingAll: 'Showing all {n} products',
      showingSome: 'Showing {shown} of {n} — {label}',
      ongoing: 'ongoing',
      client: 'Client & product', what: 'What it is', where: 'Where it ran', tooling: 'Tooling',
      sole: 'Sole QA', soleNote: 'Owned the testing process end to end.',
      team: 'Part of a wider QA team', teamNote: 'Covered alongside other QA engineers.',
      copied: 'Copied {v}', light: 'Switch to light mode', dark: 'Switch to dark mode',
      openMenu: 'Open menu', closeMenu: 'Close menu',
      dur: function (y, m) {
        var out = [];
        if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
        if (m) out.push(m + (m === 1 ? ' mo' : ' mos'));
        return out.join(' ');
      }
    },
    pl: {
      showingAll: 'Wszystkie produkty: {n}',
      showingSome: 'Pokazano {shown} z {n} — {label}',
      ongoing: 'w toku',
      client: 'Klient i produkt', what: 'Czym jest', where: 'Gdzie działało', tooling: 'Narzędzia',
      sole: 'Jedyna osoba w QA', soleNote: 'Odpowiadałam za cały proces testowania.',
      team: 'Część większego zespołu QA', teamNote: 'Testowane razem z innymi inżynierami QA.',
      copied: 'Skopiowano {v}', light: 'Włącz tryb jasny', dark: 'Włącz tryb ciemny',
      openMenu: 'Otwórz menu', closeMenu: 'Zamknij menu',
      dur: function (y, m) {
        function plural(n, one, few, many) {
          if (n === 1) return one;
          var d = n % 10, h = n % 100;
          return (d >= 2 && d <= 4 && (h < 12 || h > 14)) ? few : many;
        }
        var out = [];
        if (y) out.push(y + ' ' + plural(y, 'rok', 'lata', 'lat'));
        if (m) out.push(m + ' ' + plural(m, 'mies.', 'mies.', 'mies.'));
        return out.join(' ');
      }
    }
  };
  var lang = (root.lang || 'en').slice(0, 2);
  var T = STRINGS[lang] || STRINGS.en;
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  /* ------------------------------------------------------------------
     Theme toggle
     ------------------------------------------------------------------ */
  var themeBtn = $('#themeToggle');
  function labelTheme() {
    themeBtn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? T.light : T.dark);
  }
  themeBtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    labelTheme();
  });
  labelTheme();
  // Until the visitor picks a theme here, follow their system setting live
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  var onSysChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (err) {}
    if (stored) return;
    root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    labelTheme();
  };
  if (sysDark.addEventListener) sysDark.addEventListener('change', onSysChange);
  else if (sysDark.addListener) sysDark.addListener(onSysChange);

  /* ------------------------------------------------------------------
     Language switch keeps the current section
     ------------------------------------------------------------------ */
  $$('[data-lang-switch]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (location.hash) a.setAttribute('href', a.getAttribute('href').split('#')[0] + location.hash);
    });
  });

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var nav = $('#nav');
  var menuBtn = $('#menuBtn');
  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? T.closeMenu : T.openMenu);
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('menu-open') && !nav.contains(e.target)) setMenu(false);
  });

  /* ------------------------------------------------------------------
     Smooth anchor scrolling
     ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      setMenu(false);
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------
     Scroll: progress bar, nav border, back-to-top
     ------------------------------------------------------------------ */
  var progress = $('#progress');
  var toTop = $('#toTop');
  var ticking = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var y = h.scrollTop || document.body.scrollTop;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > 900);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    $('.brand').focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------
     Active nav link
     ------------------------------------------------------------------ */
  var links = $$('.navlinks a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) {
          var on = l.getAttribute('href') === '#' + e.target.id;
          l.classList.toggle('active', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    links.forEach(function (l) {
      var t = document.getElementById(l.getAttribute('href').slice(1));
      if (t) secObs.observe(t);
    });
  }

  /* ------------------------------------------------------------------
     Role durations ("3 yrs 9 mos"), computed from data-start="YYYY-MM"
     ------------------------------------------------------------------ */
  $$('[data-start]').forEach(function (el) {
    var p = el.dataset.start.split('-');
    var now = new Date();
    var months = (now.getFullYear() - +p[0]) * 12 + (now.getMonth() + 1 - +p[1]) + 1; // inclusive of start month
    if (months < 1) return;
    el.textContent = '· ' + T.dur(Math.floor(months / 12), months % 12);
  });

  /* ------------------------------------------------------------------
     Typed role
     ------------------------------------------------------------------ */
  var typed = $('#typed');
  if (typed && !reduced) {
    var roles;
    try { roles = JSON.parse(typed.dataset.roles); } catch (e) { roles = [typed.textContent]; }
    var ri = 0, ci = roles[0].length, deleting = true;
    var tick = function () {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        typed.textContent = word.slice(0, ci);
        if (ci >= word.length) { deleting = true; return setTimeout(tick, 2200); }
        setTimeout(tick, 55);
      } else {
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(tick, 300); }
        setTimeout(tick, 28);
      }
    };
    if (roles.length > 1) setTimeout(tick, 2600);
  }

  /* ------------------------------------------------------------------
     Terminal "test run"
     ------------------------------------------------------------------ */
  var termLines = $$('#term .ln');
  var termTimers = [];
  function runTerminal() {
    termTimers.forEach(clearTimeout);
    termTimers = [];
    termLines.forEach(function (l) { l.classList.remove('on'); });
    if (reduced) { termLines.forEach(function (l) { l.classList.add('on'); }); return; }
    var t = 300;
    termLines.forEach(function (l, i) {
      t += i === 0 ? 0 : (i < 3 ? 260 : 420);
      termTimers.push(setTimeout(function () { l.classList.add('on'); }, t));
    });
  }
  runTerminal();
  $('#replay').addEventListener('click', runTerminal);

  /* ------------------------------------------------------------------
     Coverage matrix — read products from the table rows
     ------------------------------------------------------------------ */
  var rows = $$('#rows tr');
  var PLATS = $$('#matrix thead th.plat').map(function (th) { return th.textContent.trim(); });
  var products = rows.map(function (r, i) {
    r.dataset.i = i;
    var cells = $$('td.cell', r);
    return {
      row: r,
      name: $('.nm', r).textContent.trim(),
      client: $('.client', r).textContent.trim(),
      ongoing: !!$('.pill', r) && $('.pill', r).textContent.trim() === T.ongoing,
      label: r.dataset.label,
      color: r.style.getPropertyValue('--c'),
      group: r.dataset.domain,
      sole: r.dataset.sole === '1',
      devices: r.dataset.devices === '1',
      about: r.dataset.about,
      tools: r.dataset.tools ? r.dataset.tools.split(/\s*,\s*/) : [],
      plats: cells.map(function (c) { return !!$('.mark', c); })
    };
  });

  // stagger the pop-in of the dots
  var delay = 0;
  $$('#rows .mark').forEach(function (m) { m.style.animationDelay = (delay += 0.025).toFixed(3) + 's'; });

  var chips = $$('#filters .chip');
  var count = $('#count');
  function matches(p, f) {
    if (f === 'all') return true;
    if (f === 'devices') return p.devices;
    if (f === 'sole') return p.sole;
    return p.group === f;
  }
  chips.forEach(function (c) {
    var n = products.filter(function (p) { return matches(p, c.dataset.filter); }).length;
    c.insertAdjacentHTML('beforeend', ' <span class="n" aria-hidden="true">' + n + '</span>');
  });

  var visible = products.map(function (_, i) { return i; });
  function applyFilter(f) {
    var label = '';
    visible = [];
    products.forEach(function (p, i) {
      var ok = matches(p, f);
      p.row.classList.toggle('is-hidden', !ok);
      p.row.classList.remove('fade-in');
      if (ok) {
        visible.push(i);
        if (!reduced) {
          void p.row.offsetWidth; // restart animation
          p.row.style.animationDelay = (visible.length * 0.035) + 's';
          p.row.classList.add('fade-in');
        }
      }
    });
    chips.forEach(function (c) {
      var on = c.dataset.filter === f;
      c.setAttribute('aria-pressed', String(on));
      if (on) label = c.dataset.label;
    });
    count.textContent = f === 'all'
      ? fmt(T.showingAll, { n: products.length })
      : fmt(T.showingSome, { shown: visible.length, n: products.length, label: label });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { applyFilter(c.dataset.filter); }); });

  /* ------------------------------------------------------------------
     Product drawer
     ------------------------------------------------------------------ */
  var drawer = $('#drawer');
  var backdrop = $('#drawerBackdrop');
  var current = -1;
  var lastFocus = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function block(label, child) {
    var d = el('div');
    d.appendChild(el('p', 'lbl', label));
    d.appendChild(child);
    return d;
  }

  function renderDrawer(i) {
    var p = products[i];
    drawer.style.setProperty('--c', p.color);
    $('#drawerDomain').textContent = p.label + (p.ongoing ? ' · ' + T.ongoing : '');
    $('#drawerTitle').textContent = p.name;

    var body = $('#drawerBody');
    body.textContent = '';
    body.appendChild(block(T.client, el('p', null, p.client.charAt(0).toUpperCase() + p.client.slice(1))));
    body.appendChild(block(T.what, el('p', null, p.about)));

    var plats = el('ul', 'plats');
    PLATS.forEach(function (name, k) {
      var li = el('li', 'plat-tag ' + (p.plats[k] ? 'on' : 'off'), (p.plats[k] ? '✓ ' : '') + name);
      plats.appendChild(li);
    });
    body.appendChild(block(T.where, plats));

    var role = el('div', 'role-box');
    var dot = el('span', 'mark' + (p.sole ? '' : ' team'));
    dot.style.transform = 'scale(1)';
    var txt = el('div');
    txt.appendChild(el('b', null, p.sole ? T.sole : T.team));
    txt.appendChild(el('span', 'role-note', p.sole ? T.soleNote : T.teamNote));
    role.appendChild(dot);
    role.appendChild(txt);
    body.appendChild(role);

    if (p.tools.length) {
      var tools = el('ul', 'tools');
      p.tools.forEach(function (t) { tools.appendChild(el('li', null, t)); });
      body.appendChild(block(T.tooling, tools));
    }

    var pos = visible.indexOf(i);
    $('#drawerPrev').disabled = pos <= 0;
    $('#drawerNext').disabled = pos === -1 || pos >= visible.length - 1;
  }
  function openDrawer(i) {
    current = i;
    lastFocus = document.activeElement;
    renderDrawer(i);
    root.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#drawerClose').focus(); }, 50);
  }
  function closeDrawer() {
    if (!root.classList.contains('drawer-open')) return;
    root.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function step(dir) {
    var pos = visible.indexOf(current) + dir;
    if (pos < 0 || pos >= visible.length) return;
    current = visible[pos];
    renderDrawer(current);
  }
  products.forEach(function (p, i) {
    p.row.addEventListener('click', function (e) {
      // button click bubbles here too; open once, focusing from the button
      openDrawer(i);
      e.stopPropagation();
    });
  });
  $('#drawerClose').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  $('#drawerPrev').addEventListener('click', function () { step(-1); });
  $('#drawerNext').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (!root.classList.contains('drawer-open')) {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
      return;
    }
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') { // keep focus inside the dialog
      var f = $$('button:not([disabled])', drawer);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ------------------------------------------------------------------
     Domain tabs (WAI-ARIA tabs pattern)
     ------------------------------------------------------------------ */
  var tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) { panel.classList.remove('show'); void panel.offsetWidth; panel.classList.add('show'); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ------------------------------------------------------------------
     Reveal on scroll + count-up
     ------------------------------------------------------------------ */
  function countUp(node) {
    var target = +node.dataset.count;
    var pre = node.dataset.prefix || '';
    var suf = node.dataset.suffix || '';
    var final = pre + target + suf;
    if (reduced) { node.textContent = final; return; }
    node.setAttribute('aria-label', final); // screen readers get the final value, not the ticking one
    var start = null, dur = 1200;
    function frame(ts) {
      if (!start) start = ts;
      var k = Math.min((ts - start) / dur, 1);
      node.textContent = pre + Math.round(target * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var watched = $$('.reveal, #matrix, #tally, #process');
  function show(target) {
    target.classList.add('in-view');
    $$('[data-count]', target).forEach(function (n) { if (!n.dataset.done) { n.dataset.done = 1; countUp(n); } });
  }
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        show(e.target);
        revObs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    watched.forEach(function (w) { revObs.observe(w); });
  } else {
    watched.forEach(show);
  }
  // printing: show everything
  window.addEventListener('beforeprint', function () { watched.forEach(show); });

  /* ------------------------------------------------------------------
     Cursor spotlight on cards
     ------------------------------------------------------------------ */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('.spot').forEach(function (s) {
      s.addEventListener('pointermove', function (e) {
        var r = s.getBoundingClientRect();
        s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        s.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ------------------------------------------------------------------
     Copy to clipboard
     ------------------------------------------------------------------ */
  var toast = $('#toast');
  var toastTimer;
  function showToast(msg) {
    $('#toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      var done = function () { showToast(fmt(T.copied, { v: text })); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
  });

  /* ------------------------------------------------------------------
     Optional privacy-friendly analytics (GoatCounter, no cookies).
     Off unless <meta name="goatcounter" content="your-code"> is filled in.
     ------------------------------------------------------------------ */
  var gc = $('meta[name="goatcounter"]');
  var code = gc && gc.content.trim();
  if (code && /^[a-z0-9-]+$/i.test(code) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
    document.body.appendChild(s);
  }
})();

/* language toggle + publication theme filter + highlight-card deep links (vanilla, no deps) */
(function () {
  var saved = localStorage.getItem('lang');
  if (saved) document.documentElement.lang = saved;

  window.toggleLang = function () {
    var next = document.documentElement.lang === 'en' ? 'zh' : 'en';
    document.documentElement.lang = next;
    localStorage.setItem('lang', next);
    var b = document.getElementById('langBtn');
    if (b) b.textContent = next === 'en' ? '中文' : 'EN';
  };

  function applyTheme(theme, scroll) {
    document.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('on', c.dataset.theme === theme);
      c.setAttribute('aria-pressed', c.dataset.theme === theme ? 'true' : 'false');
    });
    document.querySelectorAll('ol.pubs li').forEach(function (li) {
      li.style.display = (theme === 'all' || li.dataset.theme === theme) ? '' : 'none';
    });
    // selected highlight card -> black background / white text
    document.querySelectorAll('[data-goto]').forEach(function (card) {
      var on = card.dataset.goto === theme;
      card.classList.toggle('active', on);
      if (on) { card.setAttribute('aria-current', 'true'); }
      else { card.removeAttribute('aria-current'); }
    });
    if (scroll) {
      var el = document.getElementById('pubs');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#pubs');
    }
  }
  window.applyTheme = applyTheme;

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('langBtn');
    if (b) b.textContent = document.documentElement.lang === 'en' ? '中文' : 'EN';

    // filter chips
    document.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () { applyTheme(chip.dataset.theme, false); });
    });

    // clickable Research-highlight cards -> jump to #pubs with matching filter
    document.querySelectorAll('[data-goto]').forEach(function (el) {
      // inject the bilingual "view related publications" hint
      if (!el.querySelector('.go')) {
        var go = document.createElement('span');
        go.className = 'go';
        go.setAttribute('data-en', 'View related publications ↓');
        go.setAttribute('data-zh', '查看相关论文 ↓');
        el.appendChild(go);
      }
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        applyTheme(el.dataset.goto, true);
      });
      el.setAttribute('role', 'link');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'View related publications');
      el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); applyTheme(el.dataset.goto, true); }
      });
    });

    // deep link: /#pubs?theme=cart  or  #pubs
    var m = location.href.match(/theme=([a-z]+)/i);
    if (m) { applyTheme(m[1].toLowerCase(), true); }
    else if (location.hash === '#pubs') { applyTheme('all', false); }

    // copy-email buttons (works on file:// too, via execCommand fallback)
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var txt = btn.dataset.copy;
        var box = btn.parentNode.querySelector('.copied');
        var lang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
        function done() {
          btn.classList.add('done');
          if (box) {
            box.textContent = (lang === 'zh' ? '已复制：' : 'Copied: ') + txt;
            setTimeout(function () { btn.classList.remove('done'); box.textContent = ''; }, 1800);
          }
        }
        function legacy() {
          var ta = document.createElement('textarea');
          ta.value = txt;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, txt.length);
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta); done();
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(txt).then(done, legacy);
        } else { legacy(); }
      });
    });
  });
})();

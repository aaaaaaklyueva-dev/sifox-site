/* Модалка «Запросить демо». Открывается по клику на любой [data-demo-open]. POST JSON на formsubmit.co. */
(function () {
  if (window.__sifoxDemoModal) return;
  window.__sifoxDemoModal = true;
  var ENDPOINT = 'https://formsubmit.co/ajax/sales@sifox.ru';
  var SUBJECT = 'Заявка на демо — Антифрод';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ERR_TEXT = 'Не удалось отправить. Напишите нам на sales@sifox.ru';
  var F = "font-family:'Nunito',sans-serif;";
  var INPUT = 'height:56px;padding:0 20px;border-radius:12px;border:1px solid #FFFFFF;background:#FFFFFF;color:#323030;font-size:16px;' + F + 'font-weight:500;outline:none;box-sizing:border-box;width:100%;';
  var LABEL = 'display:flex;flex-direction:column;gap:8px;' + F + 'font-weight:700;font-size:16px;line-height:24px;color:#FFFFFF;';
  var BTN = 'cursor:pointer;border:0;display:flex;align-items:center;justify-content:center;min-height:56px;padding:0 32px;border-radius:12px;background:#FFFFFF;color:#373BF9;font-family:var(--font-display),"Druk Wide",sans-serif;font-weight:700;font-size:20px;letter-spacing:.02em;text-transform:uppercase;box-shadow:0 8px 24px rgba(20,24,120,.25);width:100%;';
  var root, lastFocus;

  function field(label, name, type, extra, ph, req) {
    return '<label style="' + LABEL + '"><span>' + label + (req ? '<span aria-hidden="true"> *</span>' : '') + '</span><input ' + (req ? 'required aria-required="true" ' : '') + 'type="' + type + '" name="' + name + '" ' + extra + ' placeholder="' + ph + '" style="' + INPUT + '"></label>';
  }
  function formHTML() {
    return '<form novalidate style="margin:0;display:flex;flex-direction:column;gap:16px">' +
      field('Имя', 'name', 'text', 'autocomplete="name"', 'Иван Иванов', true) +
      field('Компания', 'company', 'text', 'autocomplete="organization"', 'Название компании', false) +
      field('Email', 'email', 'email', 'autocomplete="email" inputmode="email"', 'name@company.ru', true) +
      field('Телефон', 'phone', 'tel', 'autocomplete="tel" inputmode="tel"', '+7 900 000-00-00', false) +
      '<p style="margin:4px 0 0;' + F + 'font-weight:500;font-size:16px;line-height:24px;color:#FFFFFF">Нажимая кнопку, вы соглашаетесь с <a href="/sifox-site/privacy.html" style="color:#FFFFFF;text-decoration:underline">политикой обработки персональных данных</a></p>' +
      '<button type="submit" style="' + BTN + 'margin-top:8px">Запросить демо</button>' +
      '<span data-status aria-live="polite" style="min-height:24px;' + F + 'font-weight:700;font-size:16px;line-height:24px;color:#FFFFFF"></span></form>';
  }
  function successHTML() {
    return '<div style="display:flex;flex-direction:column;gap:24px;padding-top:8px">' +
      '<p style="margin:0;' + F + 'font-weight:700;font-size:20px;line-height:28px;color:#FFFFFF">Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>' +
      '<button type="button" data-close style="' + BTN + '">Закрыть</button></div>';
  }
  function build() {
    root = document.createElement('div');
    root.setAttribute('data-demo-modal', '');
    root.style.cssText = 'position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.5)';
    root.innerHTML = '<style>[data-demo-modal] input::placeholder{color:#5A5A6E;opacity:1}[data-demo-modal] input:focus{box-shadow:0 0 0 3px rgba(255,255,255,.55)}[data-demo-modal] input[aria-invalid="true"]{border-color:#FF87CE;box-shadow:0 0 0 2px #FF87CE}</style>' +
      '<div role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" style="position:relative;width:100%;max-width:560px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto;box-sizing:border-box;padding:40px 32px 32px;border-radius:24px;background:radial-gradient(120% 170% at 78% 10%, #92AEFF 0%, #697DFF 38%, #373BF9 100%);box-shadow:0 24px 64px rgba(20,24,120,.35)">' +
      '<button type="button" data-close aria-label="Закрыть" style="position:absolute;top:12px;right:12px;width:44px;height:44px;border:0;border-radius:12px;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
      '<h2 id="demo-modal-title" style="margin:0 48px 24px 0;font-family:var(--font-display),\'Druk Wide\',sans-serif;font-weight:700;font-size:24px;line-height:100%;color:#FFFFFF;text-transform:uppercase">Запросить демо</h2>' +
      '<div data-body></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) {
      if (e.target === root || (e.target.closest && e.target.closest('[data-close]'))) close();
    });
    root.addEventListener('submit', onSubmit);
  }
  function open() {
    if (!root) build();
    lastFocus = document.activeElement;
    root.querySelector('[data-body]').innerHTML = formHTML();
    root.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    var i = root.querySelector('input'); if (i) i.focus();
  }
  function close() {
    if (!root || root.style.display === 'none') return;
    root.style.display = 'none';
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (form.__sending) return;
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    var data = { name: v('name'), company: v('company'), email: v('email'), phone: v('phone') };
    var badName = !data.name, badEmail = !EMAIL.test(data.email);
    form.elements.name.toggleAttribute('aria-invalid', badName);
    form.elements.email.toggleAttribute('aria-invalid', badEmail);
    if (badName) form.elements.name.setAttribute('aria-invalid', 'true');
    if (badEmail) form.elements.email.setAttribute('aria-invalid', 'true');
    var st = form.querySelector('[data-status]');
    if (badName || badEmail) {
      st.textContent = badName && !data.email ? 'Укажите имя и email.' : badName ? 'Укажите имя.' : !data.email ? 'Укажите email.' : 'Проверьте формат email.';
      form.querySelector('[aria-invalid]').focus();
      return;
    }
    data._subject = SUBJECT;
    var btn = form.querySelector('button[type="submit"]');
    form.__sending = true; st.textContent = '';
    btn.disabled = true; btn.style.opacity = '.7'; btn.textContent = 'Отправляем…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (!(j && (j.success === true || j.success === 'true'))) throw new Error('fail');
        root.querySelector('[data-body]').innerHTML = successHTML();
        root.querySelector('[data-body] [data-close]').focus();
      })
      .catch(function () {
        form.__sending = false; btn.disabled = false; btn.style.opacity = ''; btn.textContent = 'Запросить демо';
        st.textContent = ERR_TEXT;
      });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-demo-open]');
    if (t) { e.preventDefault(); open(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

(function () {
  var words = 'в|во|на|с|со|из|изо|для|и|а|но|не|ни|как|что|к|ко|о|об|обо|от|до|по|за|у|без|под|над|при|про|через|или|то|это|мы|вы|он|она|их|его|её|все|всех|чем|где|при';
  var re = new RegExp('(^|[\\s\\u00A0(«"„—–-])(' + words + ')[ \\t\\n]+', 'gi');
  var dash = /[ \t\n]+([—–])/g;
  var skip = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, TEXTAREA: 1, INPUT: 1 };
  function fix(s) {
    var prev;
    do { prev = s; s = s.replace(re, function (m, a, w) { return a + w + '\u00A0'; }); } while (s !== prev);
    return s.replace(dash, '\u00A0$1');
  }
  function run(root) {
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.parentNode; return p && skip[p.nodeName] ? 2 : 1; }
    });
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue;
      if (!v || !/\s/.test(v)) continue;
      var f = fix(v);
      if (f !== v) n.nodeValue = f;
    }
  }
  var t;
  function schedule() { clearTimeout(t); t = setTimeout(function () { run(); }, 120); }
  function start() {
    run();
    [300, 1000, 2500].forEach(function (d) { setTimeout(run, d); });
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  window.Sifox = window.Sifox || {};
  window.Sifox.nbsp = run;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

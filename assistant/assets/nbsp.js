/* Sifox typography rule: no hanging prepositions, conjunctions or particles.
   Short words must never end a line — they are glued to the word that follows
   with a non-breaking space. Run once on load (and after any text injection):

     <script src="assets/js/nbsp.js"></script>

   or call Sifox.nbsp(rootElement) manually. Skips code, pre, textarea, script.  */
(function (global) {
  var SHORT_RU = 'а|и|но|да|же|ли|бы|б|ж|в|во|к|ко|с|со|у|о|об|обо|от|ото|до|за|на|над|под|подо|при|про|для|без|безо|из|изо|через|перед|между|по|не|ни|как|что|чтоб|чтобы|то|же|уж|вот|ведь|лишь|даже|или|либо|а|тем|чем|все|весь';
  var SHORT_EN = 'a|an|the|in|on|at|to|of|by|for|and|or|as|is|it|if|no|not|but|we|be|do|so';
  var re = new RegExp('(^|[\\s(«"\u2014\u2013-])((?:' + SHORT_RU + '|' + SHORT_EN + '))\\s+', 'gi');
  var DASH = /\s+([\u2014\u2013])\s/g;
  var SKIP = { CODE: 1, PRE: 1, TEXTAREA: 1, SCRIPT: 1, STYLE: 1, KBD: 1, SAMP: 1 };

  function fix(s) {
    var out = s;
    for (var i = 0; i < 2; i++) out = out.replace(re, '$1$2\u00A0');
    return out.replace(DASH, '\u00A0$1 ');
  }

  function nbsp(root) {
    var node = root || document.body;
    if (!node) return;
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: function (t) {
        var p = t.parentNode;
        while (p && p !== node) { if (SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT; p = p.parentNode; }
        return t.nodeValue && /\S/.test(t.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var texts = [], t;
    while ((t = walker.nextNode())) texts.push(t);
    texts.forEach(function (n) { var v = fix(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  }

  global.Sifox = global.Sifox || {};
  global.Sifox.nbsp = nbsp;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { nbsp(); });
  else nbsp();
})(window);

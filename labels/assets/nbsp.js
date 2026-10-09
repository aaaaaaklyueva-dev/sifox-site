/* Sifox typography rule: no hanging prepositions/particles at line ends. */
(function () {
  var SHORT = "а|без|бы|в|во|вы|да|для|до|же|за|и|из|изо|или|к|ко|ли|мы|на|над|не|ни|но|о|об|обо|от|ото|по|под|при|про|с|со|та|то|у|уж|что|как|чем|via|the";
  var RE_WORD = new RegExp("(^|[\\s(«\"])(" + SHORT + ")\\s+", "gi");
  var RE_DASH = /\s+([—–])\s/g;

  function fix(t) {
    return t.replace(RE_DASH, "\u00A0$1 ").replace(RE_WORD, function (m, p, w) {
      return p + w + "\u00A0";
    });
  }

  function walk(root) {
    if (!root) return;
    var skip = { SCRIPT: 1, STYLE: 1, PRE: 1, CODE: 1, TEXTAREA: 1, INPUT: 1 };
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (n.parentNode && skip[n.parentNode.nodeName]) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, list = [];
    while ((n = it.nextNode())) list.push(n);
    list.forEach(function (node) {
      var out = fix(node.nodeValue);
      if (out !== node.nodeValue) node.nodeValue = out;
    });
  }

  window.Sifox = window.Sifox || {};
  window.Sifox.nbsp = walk;
})();

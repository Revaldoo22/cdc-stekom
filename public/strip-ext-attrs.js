(function () {
  // Strip attributes injected by browser extensions (e.g. BIS) that mutate the
  // DOM before React hydrates and cause hydration mismatches.
  var ATTRS = ['bis_skin_checked', 'bis_use', 'bis_id', 'bis_register'];
  function strip(node) {
    if (!node || node.nodeType !== 1) return;
    for (var i = 0; i < ATTRS.length; i++) {
      if (node.hasAttribute && node.hasAttribute(ATTRS[i])) node.removeAttribute(ATTRS[i]);
    }
    if (node.querySelectorAll) {
      var sel = ATTRS.map(function (a) { return '[' + a + ']'; }).join(',');
      var found = node.querySelectorAll(sel);
      for (var j = 0; j < found.length; j++) {
        for (var k = 0; k < ATTRS.length; k++) found[j].removeAttribute(ATTRS[k]);
      }
    }
  }
  strip(document.documentElement);
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && ATTRS.indexOf(m.attributeName) > -1) {
        m.target.removeAttribute(m.attributeName);
      } else if (m.addedNodes) {
        for (var j = 0; j < m.addedNodes.length; j++) strip(m.addedNodes[j]);
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ATTRS,
  });
})();

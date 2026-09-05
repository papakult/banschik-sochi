/* Олег — банщик в Сочи. Метрика + цели по обращениям. */
(function () {
  var ID = 112316770;

  // --- Яндекс.Метрика ---
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    accurateTrackBounce: true,
    trackLinks: true
  });

  // --- цели по обращениям, дедупликация 30 минут на канал ---
  function fresh(key) {
    try {
      var now = Date.now(), prev = sessionStorage.getItem(key);
      if (prev && now - parseInt(prev, 10) < 30 * 60 * 1000) return false;
      sessionStorage.setItem(key, String(now));
    } catch (e) {}
    return true;
  }

  function goal(name) {
    if (typeof ym !== "function") return;
    ym(ID, "reachGoal", name);
    if (name !== "lead_any" && fresh("g_lead_any")) ym(ID, "reachGoal", "lead_any");
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("wa.me") > -1 || href.indexOf("api.whatsapp.com") > -1) {
      if (fresh("g_wa_click")) goal("wa_click");
    } else if (href.indexOf("tel:") === 0) {
      if (fresh("g_phone_click")) goal("phone_click");
    }
  }, true);
})();

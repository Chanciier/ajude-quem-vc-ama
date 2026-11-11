// Interações da landing (checkout real via Hotmart; Pixel da Meta definido no <head>)
document.addEventListener("DOMContentLoaded", function () {
  var track = function () {
    if (typeof PIXEL_OK !== "undefined" && PIXEL_OK && window.fbq) { try { fbq.apply(null, arguments); } catch (e) {} }
  };

  // preço
  if (CONFIG.PRICE_TEXT) {
    var p = document.getElementById("price");
    if (p) p.innerHTML = "Apenas <b>" + CONFIG.PRICE_TEXT + "</b>";
    var pb = document.getElementById("price-big");
    if (pb) pb.textContent = CONFIG.PRICE_TEXT;
  }
  if (CONFIG.CONTACT_EMAIL) {
    var c = document.getElementById("contato");
    if (c) c.textContent = "Contato: " + CONFIG.CONTACT_EMAIL + ".";
  }

  // checkout com repasse dos parâmetros da URL (utm, fbclid etc.)
  function checkoutUrl() {
    var u = CONFIG.CHECKOUT_URL, q = window.location.search.replace(/^\?/, "");
    if (q) { u += (u.indexOf("?") > -1 ? "&" : "?") + q; }
    return u;
  }
  var ctas = document.querySelectorAll(".js-cta");
  for (var i = 0; i < ctas.length; i++) {
    ctas[i].setAttribute("href", checkoutUrl());
    ctas[i].addEventListener("click", function (ev) {
      ev.preventDefault();
      var where = this.getAttribute("data-where") || "";
      track("track", "InitiateCheckout", { content_name: "Guia Cuidar em Família", content_category: "ebook", currency: "BRL" });
      track("trackCustom", "CTAClick", { cta_location: where });
      var url = checkoutUrl();
      setTimeout(function () { window.location.href = url; }, 220);
    });
  }

  // ViewContent quando a seção de conteúdo aparece
  var sent = false, sec = document.getElementById("conteudo");
  if ("IntersectionObserver" in window && sec) {
    new IntersectionObserver(function (es, ob) {
      es.forEach(function (e) {
        if (e.isIntersecting && !sent) { sent = true; track("track", "ViewContent", { content_name: "Guia Cuidar em Família", content_type: "product" }); ob.disconnect(); }
      });
    }, { threshold: 0.35 }).observe(sec);
  }

  // checklist interativo (sem diagnóstico)
  var checklist = document.getElementById("symptoms-checklist");
  var resultBox = document.getElementById("checklist-result");
  var alertTitle = document.getElementById("alert-title");
  var alertText = document.getElementById("alert-text");
  if (checklist && resultBox) {
    var boxes = checklist.querySelectorAll("input[type='checkbox']");
    var evaluate = function () {
      var n = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
      if (n === 0) { resultBox.classList.add("hidden"); return; }
      resultBox.classList.remove("hidden");
      if (n <= 2) {
        alertTitle.textContent = "Alguns sinais merecem atenção";
        alertText.textContent = "Você marcou " + n + ". Esse é um bom momento para conversar e organizar o dinheiro da casa antes que o problema cresça.";
      } else {
        alertTitle.textContent = "Você não precisa passar por isso sozinha(o)";
        alertText.textContent = "Você marcou " + n + ". Com tantos sinais, vale agir com calma e com um plano. Se estiver sofrendo, o CVV atende no 188, 24 horas.";
      }
    };
    boxes.forEach(function (b) { b.addEventListener("change", evaluate); });
  }

  // FAQ accordion
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    item.querySelector(".faq-question").addEventListener("click", function () {
      var active = item.classList.contains("active");
      items.forEach(function (o) { o.classList.remove("active"); });
      if (!active) item.classList.add("active");
    });
  });

  // barra fixa no celular (some perto da oferta) + profundidade de rolagem
  var st = document.getElementById("sticky"), offer = document.getElementById("oferta");
  var marks = { 50: false, 90: false };
  window.addEventListener("scroll", function () {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight, hide = false;
    if (offer) { var r = offer.getBoundingClientRect(); hide = r.top < window.innerHeight * 0.7 && r.bottom > 0; }
    st.classList[(y > 520 && !hide) ? "add" : "remove"]("show");
    if (h > 0) { var pct = y / h * 100; for (var k in marks) { if (!marks[k] && pct >= +k) { marks[k] = true; track("trackCustom", "Scroll" + k); } } }
  }, { passive: true });

  // aviso de cookies
  var ck = document.getElementById("cookie"), key = "ce_cookie_ok";
  try { if (!localStorage.getItem(key)) ck.classList.add("show"); } catch (e) { ck.classList.add("show"); }
  document.getElementById("cookieOk").addEventListener("click", function () { ck.classList.remove("show"); try { localStorage.setItem(key, "1"); } catch (e) {} });
});

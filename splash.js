
(function () {
  var sub = {
    ar: "بيع • اشترِ • اكتشف\nكل ما تحتاجه في مكان واحد",
    fr: "Vendez • Achetez • Découvrez\nTout ce qu'il vous faut au même endroit",
    en: "Sell • Buy • Discover\nEverything you need in one place"
  };

  var l = "ar";
  try {
    l = localStorage.getItem("lang") || "ar";
  } catch (e) {}

  if (!sub[l]) l = "ar";

  var css = `
    #sp {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: linear-gradient(160deg, #043d1d, #0d7139);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      direction: rtl;
      padding: 15px;
      box-sizing: border-box;
      animation: spOut .5s ease 2.7s forwards;
    }

    #sp img {
      display: block;
      width: min(82vw, 360px);
      height: 42vh;
      max-height: 340px;
      object-fit: contain;
      border-radius: 16px;
      opacity: 0;
      flex-shrink: 0;
      animation: spUp .8s ease .15s forwards;
    }

    #sp h1 {
      position: absolute;
      top: 7vh;
      left: 0;
      width: 100%;
      margin: 0;
      text-align: center;
      font-size: 42px;
      font-weight: 800;
      color: #f5d99a;
      font-family: Tahoma, "Segoe UI", sans-serif;
      z-index: 2;
      opacity: 0;
      animation: spUp .7s ease .5s forwards;
    }

    #sp p {
      position: absolute;
      bottom: 7vh;
      left: 0;
      width: 100%;
      margin: 0;
      padding: 0 12px;
      box-sizing: border-box;
      text-align: center;
      white-space: pre-line;
      line-height: 1.9;
      font-size: 17px;
      font-weight: 600;
      color: #e2eee5;
      font-family: Tahoma, "Segoe UI", sans-serif;
      z-index: 2;
      opacity: 0;
      animation: spUp .7s ease .7s forwards;
    }

    @keyframes spOut {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }

    @keyframes spUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #sp, #sp img, #sp h1, #sp p {
        animation: none;
        opacity: 1;
      }
    }
  `;

  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var el = document.createElement("div");
  el.id = "sp";

  var img = document.createElement("img");
  img.src = "./file_00000000633081f48fe9f68514d3da35.png";
  img.alt = "المرصة";

  var title = document.createElement("h1");
  title.textContent = "المرصة";

  var subtitle = document.createElement("p");
  subtitle.textContent = sub[l];

  el.appendChild(title);
  el.appendChild(img);
  el.appendChild(subtitle);

  el.onclick = function () {
    el.remove();
  };

  document.documentElement.appendChild(el);

  setTimeout(function () {
    if (el.parentNode) el.remove();
  }, 3300);

  document.addEventListener("DOMContentLoaded", function () {
    try {
      document.title = "المرصة";
      T.ar.title = "المرصة";
      T.fr.title = "Al Marsa · marché local";
      T.en.title = "Al Marsa · Local Market";
      render();
    } catch (e) {}
  });
})();

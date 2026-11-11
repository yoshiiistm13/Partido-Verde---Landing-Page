const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-menu");
const supportForm = document.querySelector(".support-form");
const formStatus = document.querySelector(".form-status");
const recaptchaContainer = document.querySelector("#recaptcha-widget");
const recaptchaStatus = document.querySelector("#recaptcha-status");
const recaptchaSiteKey = recaptchaContainer?.dataset.sitekey.trim();
let recaptchaWidgetId;

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú de navegación");
    siteNav.classList.remove("site-nav--open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú de navegación" : "Cerrar menú de navegación");
    siteNav.classList.toggle("site-nav--open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 768px)").matches) closeMenu();
  });
}

if (recaptchaContainer && recaptchaStatus && recaptchaSiteKey && recaptchaSiteKey !== "PENDIENTE") {
  window.onRecaptchaApiLoaded = () => {
    recaptchaWidgetId = window.grecaptcha.render(recaptchaContainer, {
      sitekey: recaptchaSiteKey,
      callback: () => {
        recaptchaStatus.textContent = "Verificación completada.";
      },
      "expired-callback": () => {
        recaptchaStatus.textContent = "La verificación expiró. Complétala de nuevo.";
      },
      "error-callback": () => {
        recaptchaStatus.textContent = "No se pudo completar reCAPTCHA. Inténtalo de nuevo.";
      },
    });
  };

  const recaptchaScript = document.createElement("script");
  recaptchaScript.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoaded&render=explicit";
  recaptchaScript.async = true;
  recaptchaScript.defer = true;
  recaptchaScript.addEventListener("error", () => {
    recaptchaStatus.textContent = "No se pudo cargar reCAPTCHA. Revisa tu conexión e inténtalo de nuevo.";
  });
  document.head.append(recaptchaScript);
}

if (supportForm && formStatus) {
  supportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!recaptchaContainer || !recaptchaSiteKey || recaptchaSiteKey === "PENDIENTE") {
      formStatus.textContent = "No se puede enviar la solicitud: primero configura la site key de reCAPTCHA.";
      formStatus.hidden = false;
      return;
    }

    if (typeof window.grecaptcha === "undefined" || typeof recaptchaWidgetId !== "number") {
      formStatus.textContent = "No se pudo iniciar reCAPTCHA. Recarga la página e inténtalo de nuevo.";
      formStatus.hidden = false;
      return;
    }

    if (!window.grecaptcha.getResponse(recaptchaWidgetId)) {
      formStatus.textContent = "Completa la verificación reCAPTCHA antes de enviar la solicitud.";
      formStatus.hidden = false;
      return;
    }

    formStatus.textContent = "reCAPTCHA completado, pero falta conectar el endpoint de envío. Tus datos no fueron enviados.";
    formStatus.hidden = false;
  });
}
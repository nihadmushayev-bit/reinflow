const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const siteHeader = document.querySelector(".header");
const desktopHeaderQuery = window.matchMedia("(min-width: 821px)");

function updateHeaderState() {
  siteHeader?.classList.remove("is-scrolled");
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
desktopHeaderQuery.addEventListener("change", updateHeaderState);

if (menuButton && mobileNav) {
  function setMobileMenu(open) {
    mobileNav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("mobile-menu-open", open);
  }

  menuButton.addEventListener("click", () => {
    setMobileMenu(!mobileNav.classList.contains("open"));
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setMobileMenu(false);
    }
  });

  desktopHeaderQuery.addEventListener("change", () => setMobileMenu(false));
}

const pricingModal = document.querySelector("#subscription-modal");
const pricingDialog = pricingModal?.querySelector(".subscription-modal");
const openPricingTriggers = document.querySelectorAll("[data-open-pricing]");
const closePricingTriggers = document.querySelectorAll("[data-close-pricing]");
const preRegistrationForms = document.querySelectorAll(".pre-registration-form");
const modalPreRegistrationEmail = document.querySelector("#pre-registration-email");
const supabaseUrl = (window.REINFLOW_SUPABASE_URL || window.REIN_SUPABASE_URL || "").trim().replace(/\/$/, "");
const supabaseAnonKey = (window.REINFLOW_SUPABASE_ANON_KEY || window.REIN_SUPABASE_ANON_KEY || "").trim();
let pricingReturnTarget = null;

if (window.location.hash) {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function openPricing(event) {
  event?.preventDefault();
  if (!pricingModal || !pricingDialog) return;

  pricingReturnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  pricingModal.hidden = false;
  document.body.classList.add("modal-open");
  window.requestAnimationFrame(() => (modalPreRegistrationEmail || pricingDialog).focus());
}

function closePricing({ restoreFocus = true, clearHash = true } = {}) {
  if (!pricingModal) return;

  pricingModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (restoreFocus && pricingReturnTarget) {
    pricingReturnTarget.focus();
  }
}

openPricingTriggers.forEach((trigger) => trigger.addEventListener("click", openPricing));

closePricingTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => closePricing());
});

pricingModal?.addEventListener("click", (event) => {
  if (event.target === pricingModal) {
    closePricing();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && pricingModal && !pricingModal.hidden) {
    closePricing();
  }
});

function setPreRegistrationStatus(form, message, type = "") {
  const status = form?.querySelector(".form-status");
  if (!status) return;

  status.textContent = message;
  status.classList.toggle("success", type === "success");
  status.classList.toggle("error", type === "error");
}

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("YOUR_") && !supabaseAnonKey.includes("YOUR_"));
}

function getTrimmedFormValue(formData, key) {
  return String(formData.get(key) || "").trim();
}

async function submitPreRegistration(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;

  const emailInput = form.querySelector('input[name="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const buttonLabel = submitButton?.querySelector(".button-label");
  const originalButtonLabel = buttonLabel?.dataset.originalLabel || buttonLabel?.textContent || "Join Waitlist";
  if (buttonLabel) buttonLabel.dataset.originalLabel = originalButtonLabel;

  const formData = new FormData(form);
  const email = getTrimmedFormValue(formData, "email");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setPreRegistrationStatus(form, "Please enter a valid email address.", "error");
    emailInput?.focus();
    return;
  }

  if (!isSupabaseConfigured()) {
    setPreRegistrationStatus(form, "Supabase URL and anon key must be added before registrations can be saved.", "error");
    return;
  }

  const payload = {
    email,
    full_name: getTrimmedFormValue(formData, "full_name") || null,
    company: getTrimmedFormValue(formData, "company") || null,
    plan: getTrimmedFormValue(formData, "plan") || "rein_meta_149",
    source_path: `${window.location.pathname}${window.location.search}`,
  };

  submitButton?.setAttribute("disabled", "");
  form.setAttribute("aria-busy", "true");
  if (buttonLabel) buttonLabel.textContent = "Saving...";
  setPreRegistrationStatus(form, "Saving your preregistration...", "");

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/pre_registrations`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    form.reset();
    setPreRegistrationStatus(form, "You are on the Reinflow waitlist. We will contact you soon.", "success");
  } catch (error) {
    setPreRegistrationStatus(form, "We could not save this registration. Please try again in a moment.", "error");
  } finally {
    submitButton?.removeAttribute("disabled");
    form.removeAttribute("aria-busy");
    if (buttonLabel) buttonLabel.textContent = originalButtonLabel;
  }
}

preRegistrationForms.forEach((form) => form.addEventListener("submit", submitPreRegistration));

document.querySelectorAll(".app-tabs").forEach((tabGroup) => {
  const tabs = Array.from(tabGroup.querySelectorAll("button"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.toggle("active", item === tab));
    });
  });
});

const snapshots = [
  {
    revenue: "$83,420",
    events: "12,840",
    lift: "+31%",
    waste: "$3,920",
  },
  {
    revenue: "$91,780",
    events: "14,260",
    lift: "+38%",
    waste: "$2,740",
  },
  {
    revenue: "$104,900",
    events: "16,180",
    lift: "+44%",
    waste: "$1,960",
  },
];

const statTargets = {
  revenue: document.querySelector("#tracked-revenue"),
  events: document.querySelector("#recovered-events"),
  lift: document.querySelector("#roas-lift"),
  waste: document.querySelector("#wasted-spend"),
};

let snapshotIndex = 0;

function pulseStats() {
  Object.values(statTargets).forEach((target) => {
    const card = target?.closest(".stat-card");
    if (!card) return;
    card.classList.remove("pulse");
    window.requestAnimationFrame(() => card.classList.add("pulse"));
  });
}

function rotateDashboard() {
  snapshotIndex = (snapshotIndex + 1) % snapshots.length;
  const snapshot = snapshots[snapshotIndex];
  if (statTargets.revenue) statTargets.revenue.textContent = snapshot.revenue;
  if (statTargets.events) statTargets.events.textContent = snapshot.events;
  if (statTargets.lift) statTargets.lift.textContent = snapshot.lift;
  if (statTargets.waste) statTargets.waste.textContent = snapshot.waste;
  pulseStats();
}

window.setInterval(rotateDashboard, 4200);

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px 130px 0px", threshold: 0.08 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 6, 4) * 55}ms`;
  revealObserver.observe(item);
});

window.addEventListener("load", () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

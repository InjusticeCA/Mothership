// Mobile nav toggle
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Scroll-reveal animation
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);

        // Each roadmap step fills the connector segment leading into it
        const step = Number(entry.target.dataset.step);
        if (step > 1) {
          const connector = document.querySelector(`[data-connector="${step - 1}"]`);
          if (connector) connector.classList.add("is-filled");
        }
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Scroll progress bar — fills like a render/export bar as you move down the page
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollProgressFill = document.getElementById("scroll-progress-fill");
const heroGlow = document.getElementById("hero-glow");

if (scrollProgressFill) {
  let ticking = false;

  const updateOnScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    scrollProgressFill.style.transform = `scaleX(${progress})`;

    if (heroGlow && !prefersReducedMotion) {
      heroGlow.style.transform = `translateY(${Math.min(scrollTop * 0.15, 60)}px)`;
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateOnScroll();
}

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Hero timecode readout — counts time on page in HH:MM:SS:FF (24fps), purely decorative
const timecodeEl = document.getElementById("timecode");
if (timecodeEl) {
  const start = performance.now();
  const pad = (n, len = 2) => String(n).padStart(len, "0");

  setInterval(() => {
    const elapsedMs = performance.now() - start;
    const totalFrames = Math.floor(elapsedMs / (1000 / 24));
    const frames = totalFrames % 24;
    const totalSeconds = Math.floor(totalFrames / 24);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    timecodeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 24);
}

// Contact form — submits to Formspree once data-formspree-id is set on the <form>
// (see README "Activating the contact form"). Falls back to a friendly notice until then.
const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formspreeId = contactForm.dataset.formspreeId;
  const submitBtn = contactForm.querySelector("button[type=submit]");

  if (!formspreeId) {
    formNote.textContent =
      "This form isn't connected to an inbox yet — add a Formspree ID in index.html to activate it (see README).";
    return;
  }

  submitBtn.disabled = true;
  formNote.textContent = "Sending…";

  try {
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(contactForm),
    });

    if (response.ok) {
      formNote.textContent = "Thanks! Your message has been sent.";
      contactForm.reset();
    } else {
      formNote.textContent = "Something went wrong sending that — please try again.";
    }
  } catch {
    formNote.textContent = "Something went wrong sending that — please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});

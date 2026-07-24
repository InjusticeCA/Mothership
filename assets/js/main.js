const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const wantsMotion = !prefersReducedMotion && hasFinePointer;

// ============ Mobile nav toggle ============
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

// ============ Scroll-reveal animation ============
const revealEls = document.querySelectorAll(".reveal, .reveal-scale");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);

        const step = Number(entry.target.dataset.step);
        if (step > 1) {
          const connector = document.querySelector(`.roadmap-connector[data-connector="${step - 1}"]`);
          if (connector) connector.classList.add("is-filled");
        }
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// ============ Count-up stats ============
document.querySelectorAll("[data-count]").forEach((el) => {
  const target = Number(el.dataset.count);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        if (prefersReducedMotion) {
          el.textContent = String(target);
          return;
        }

        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(el);
});

// ============ Footer year ============
document.getElementById("year").textContent = new Date().getFullYear();

// ============ Contact form ============
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

// ============ Roadmap elbow lines ============
let elbowState = [];

function layoutElbows() {
  const corner = 28;

  document.querySelectorAll(".roadmap-elbow").forEach((svg) => {
    const rect = svg.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const d =
      svg.dataset.direction === "right"
        ? `M0,0 L0,${h - corner} Q0,${h} ${corner},${h} L${w},${h}`
        : `M${w},0 L${w},${h - corner} Q${w},${h} ${w - corner},${h} L0,${h}`;

    svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
  });

  elbowState = Array.from(document.querySelectorAll(".elbow-fill")).map((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = prefersReducedMotion ? "0" : String(length);
    return { path, length };
  });
}

layoutElbows();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutElbows, 200);
});

// ============ Scroll-driven effects: progress bar, glows, elbow draw, social dock ============
const scrollProgressFill = document.getElementById("scroll-progress-fill");
const processGlow = document.getElementById("process-glow");
const socialDock = document.getElementById("social-dock");
const heroSection = document.querySelector(".hero");

if (scrollProgressFill) {
  let ticking = false;

  const updateOnScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    scrollProgressFill.style.transform = `scaleX(${progress})`;

    if (socialDock && heroSection) {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      socialDock.classList.toggle("is-visible", heroBottom < 0);
    }

    if (!prefersReducedMotion) {
      if (processGlow) {
        const rect = processGlow.getBoundingClientRect();
        const sectionProgress = Math.min(Math.max((window.innerHeight - rect.top) / (rect.height + window.innerHeight), 0), 1);
        processGlow.style.transform = `translateY(${sectionProgress * 120 - 40}px)`;
      }

      elbowState.forEach(({ path, length }) => {
        const svg = path.ownerSVGElement;
        const rect = svg.getBoundingClientRect();
        const drawProgress = Math.min(Math.max((window.innerHeight * 0.85 - rect.top) / rect.height, 0), 1);
        path.style.strokeDashoffset = String(length * (1 - drawProgress));
      });
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

// ============ Custom cursor + magnetic buttons + hero parallax + tilt cards ============
// All skipped on touch devices and for reduced-motion users (CSS also hides the cursor there).
if (wantsMotion) {
  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let mouseX = ringX;
  let mouseY = ringY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  };
  requestAnimationFrame(animateRing);

  document.querySelectorAll("a, button, [data-tilt]").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
  });

  // Magnetic buttons — nudge toward the cursor within a small radius
  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0)";
    });
  });

  // Hero floating chips drift opposite the cursor for a subtle parallax depth effect
  const heroVisual = document.getElementById("hero-visual");
  if (heroVisual) {
    heroVisual.addEventListener("mousemove", (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      heroVisual.querySelectorAll("[data-depth]").forEach((chip) => {
        const depth = Number(chip.dataset.depth);
        chip.style.transform = `translate(${relX * depth * -1}px, ${relY * depth * -1}px)`;
      });
    });
    heroVisual.addEventListener("mouseleave", () => {
      heroVisual.querySelectorAll("[data-depth]").forEach((chip) => {
        chip.style.transform = "translate(0, 0)";
      });
    });
  }

  // Tilt cards — subtle 3D rotation following cursor position within the card
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${relY * -8}deg) rotateY(${relX * 8}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    });
  });
}

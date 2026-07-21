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
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

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

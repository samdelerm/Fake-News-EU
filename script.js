const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

if (menuBtn && menuPanel) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!expanded));
    menuPanel.classList.toggle("open");
  });

  menuPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuPanel.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

const caseButtons = document.querySelectorAll(".case-btn");
const caseCards = document.querySelectorAll(".case-card");

caseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.case;

    caseButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    caseCards.forEach((card) => {
      card.classList.remove("active");
      card.hidden = true;
    });

    const targetCard = document.getElementById(targetId);
    if (targetCard) {
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      targetCard.hidden = false;
      requestAnimationFrame(() => {
        targetCard.classList.add("active");
      });
    }
  });
});

const statNodes = document.querySelectorAll(".stat-value");

const animateCounter = (node) => {
  const target = Number(node.dataset.target || 0);
  const duration = 1000;
  let startTime = null;

  const step = (ts) => {
    if (!startTime) {
      startTime = ts;
    }

    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * target);

    if (target >= 1000) {
      node.textContent = value.toLocaleString("fr-FR");
    } else {
      node.textContent = `${value}`;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

if ("IntersectionObserver" in window && statNodes.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  statNodes.forEach((node) => observer.observe(node));
} else {
  statNodes.forEach((node) => animateCounter(node));
}
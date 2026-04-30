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

const CHARTS = [
  {
    id: "chartLanguages",
    unit: "",
    max: 80,
    labels: ["Langues officielles UE", "Langues regionales/minoritaires (Europe)"],
    values: [24, 60],
  },
  {
    id: "chartMigration",
    unit: "%",
    max: 100,
    labels: ["Ressortissants non-UE", "Part restante"],
    values: [6.8, 93.2],
  },
  {
    id: "chartBudget",
    unit: "%",
    max: 60,
    labels: ["Budget UE / RNB UE", "Depenses publiques totales / PIB (UE)"],
    values: [1.15, 49.5],
  },
  {
    id: "chartEuro",
    unit: "%",
    max: 70,
    labels: ["Dollar (reserves mondiales)", "Euro (reserves mondiales)"],
    values: [55, 22],
  },
  {
    id: "chartTraditions",
    unit: "",
    max: 4000,
    labels: ["Produits AOP/IGP/STG enregistres"],
    values: [3750],
  },
  {
    id: "chartCohesion",
    unit: " MdEUR",
    max: 450,
    labels: ["Budget cohesion 2021-2027 (engagements)"],
    values: [410],
  },
];

const drawHorizontalBars = (canvas, chart) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(320, Math.floor(rect.width || canvas.width || 620));
  const rows = chart.labels.length;
  
  // Calcul amélioré de la hauteur
  const barHeight = 44;
  const rowGap = 28;
  const cssHeight = Math.max(220, 70 + rows * (barHeight + rowGap));

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  // Padding adaptatif pour les longs labels
  const pad = { top: 32, right: 24, bottom: 28, left: 240 };
  const chartWidth = cssWidth - pad.left - pad.right;

  // Configuration du texte avec meilleure lisibilité
  ctx.font = "600 13px Space Grotesk, sans-serif";
  ctx.textBaseline = "middle";

  chart.labels.forEach((label, idx) => {
    const y = pad.top + idx * (barHeight + rowGap);
    const value = chart.values[idx];
    const ratio = Math.max(0, Math.min(1, value / chart.max));
    const barW = chartWidth * ratio;

    // Texte du label avec troncature si nécessaire
    ctx.fillStyle = "#193f9f";
    let displayLabel = label;
    const maxLabelWidth = pad.left - 28;
    
    // Troncature du texte s'il est trop long
    while (ctx.measureText(displayLabel).width > maxLabelWidth && displayLabel.length > 0) {
      displayLabel = displayLabel.substring(0, displayLabel.length - 1);
    }
    if (label.length !== displayLabel.length) {
      displayLabel = displayLabel.substring(0, Math.max(0, displayLabel.length - 3)) + "...";
    }
    
    ctx.fillText(displayLabel, 16, y + barHeight / 2);

    // Fond de la barre
    ctx.fillStyle = "rgba(25, 63, 159, 0.12)";
    ctx.fillRect(pad.left, y, chartWidth, barHeight);

    // Barre avec gradient
    const grad = ctx.createLinearGradient(pad.left, y, pad.left + barW, y + barHeight);
    grad.addColorStop(0, "#2458d6");
    grad.addColorStop(1, "#ffcc00");
    ctx.fillStyle = grad;
    ctx.fillRect(pad.left, y, barW, barHeight);

    // Valeur numérique avec meilleur positionnement
    ctx.fillStyle = "#0f1a3a";
    ctx.font = "600 13px Space Grotesk, sans-serif";
    const suffix = chart.unit || "";
    const valueLabel = Number.isInteger(value) ? `${value}${suffix}` : `${value.toFixed(1)}${suffix}`;
    
    const textWidth = ctx.measureText(valueLabel).width;
    const textX = Math.max(pad.left + 12, Math.min(pad.left + barW + 12, cssWidth - pad.right - textWidth - 8));
    
    ctx.fillText(valueLabel, textX, y + barHeight / 2);
  });
};

const renderCharts = () => {
  CHARTS.forEach((chart) => {
    const canvas = document.getElementById(chart.id);
    if (!canvas) {
      return;
    }
    drawHorizontalBars(canvas, chart);
  });
};

renderCharts();
let chartResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(chartResizeTimer);
  chartResizeTimer = setTimeout(renderCharts, 120);
});
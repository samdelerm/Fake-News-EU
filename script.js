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
    max: 15,
    labels: ["Ressortissants non-UE dans la population de l'UE", "Part restante"],
    values: [6.1, 93.9],
  },
  {
    id: "chartBudget",
    unit: "%",
    max: 60,
    labels: ["Budget UE / RNB UE", "Depenses publiques totales / PIB (UE)"],
    values: [1.1, 49],
  },
  {
    id: "chartEuro",
    unit: "%",
    max: 70,
    labels: ["Dollar (reserves mondiales)", "Euro (reserves mondiales)"],
    values: [58, 20],
  },
  {
    id: "chartTraditions",
    unit: "",
    max: 4000,
    labels: ["Produits AOP/IGP/STG enregistres", "Objectif de reference"],
    values: [3600, 4000],
  },
  {
    id: "chartCohesion",
    unit: " MdEUR",
    max: 450,
    labels: ["Budget cohesion 2021-2027", "Reference comparative"],
    values: [392, 450],
  },
];

const drawHorizontalBars = (canvas, chart) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const pad = { top: 26, right: 20, bottom: 24, left: 210 };
  const chartWidth = cssWidth - pad.left - pad.right;
  const rowGap = 24;
  const barHeight = 36;

  ctx.font = "600 14px Space Grotesk, sans-serif";
  ctx.textBaseline = "middle";

  chart.labels.forEach((label, idx) => {
    const y = pad.top + idx * (barHeight + rowGap);
    const value = chart.values[idx];
    const ratio = Math.max(0, Math.min(1, value / chart.max));
    const barW = chartWidth * ratio;

    ctx.fillStyle = "#193f9f";
    ctx.fillText(label, 16, y + barHeight / 2);

    ctx.fillStyle = "rgba(25, 63, 159, 0.12)";
    ctx.fillRect(pad.left, y, chartWidth, barHeight);

    const grad = ctx.createLinearGradient(pad.left, y, pad.left + barW, y + barHeight);
    grad.addColorStop(0, "#2458d6");
    grad.addColorStop(1, "#ffcc00");
    ctx.fillStyle = grad;
    ctx.fillRect(pad.left, y, barW, barHeight);

    ctx.fillStyle = "#0f1a3a";
    const suffix = chart.unit || "";
    const valueLabel = Number.isInteger(value) ? `${value}${suffix}` : `${value.toFixed(1)}${suffix}`;
    ctx.fillText(valueLabel, pad.left + Math.min(barW + 10, chartWidth - 56), y + barHeight / 2);
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
window.addEventListener("resize", renderCharts);
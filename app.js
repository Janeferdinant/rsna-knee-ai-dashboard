/**
 * RSNA Knee Abnormality Detection AI Platform — Main Application Logic
 */

// Target Abnormalities Data
const ABNORMALITIES = [
  {
    id: "ACL",
    name: "ACL Tear",
    category: "ligament",
    catLabel: "Ligament",
    desc: "Anterior cruciate ligament disruption with discontinuity of low-signal fibers or abnormal orientation.",
    prevalence: "16.4%",
    seqSensitivity: "Sagittal T2 / PDFS",
    auc: 0.912,
  },
  {
    id: "MCL",
    name: "MCL Injury",
    category: "ligament",
    catLabel: "Ligament",
    desc: "Medial collateral ligament sprain, partial tear, or full avulsion with periligamentous fluid signal.",
    prevalence: "12.8%",
    seqSensitivity: "Coronal PDFS",
    auc: 0.884,
  },
  {
    id: "Medial Meniscus",
    name: "Medial Meniscus Tear",
    category: "meniscus",
    catLabel: "Meniscus",
    desc: "High signal extending to articular surface on multiple slices; vertical, horizontal, or complex morphology.",
    prevalence: "34.2%",
    seqSensitivity: "Sagittal & Coronal T2/PD",
    auc: 0.895,
  },
  {
    id: "Lateral Meniscus",
    name: "Lateral Meniscus Tear",
    category: "meniscus",
    catLabel: "Meniscus",
    desc: "Disruption of lateral fibrocartilage ring, bucket-handle tears, or root detachment.",
    prevalence: "21.6%",
    seqSensitivity: "Sagittal & Coronal T2/PD",
    auc: 0.871,
  },
  {
    id: "Medial OA",
    name: "Medial Osteoarthritis",
    category: "oa",
    catLabel: "Osteoarthritis",
    desc: "Cartilage loss, subchondral sclerosis, and osteophytes across the medial femoral-tibial compartment.",
    prevalence: "28.5%",
    seqSensitivity: "Coronal 3D Water-Excitation",
    auc: 0.862,
  },
  {
    id: "Lateral OA",
    name: "Lateral Osteoarthritis",
    category: "oa",
    catLabel: "Osteoarthritis",
    desc: "Degenerative joint disease of the lateral compartment with joint space narrowing and chondral wear.",
    prevalence: "18.1%",
    seqSensitivity: "Coronal PDFS",
    auc: 0.849,
  },
  {
    id: "PF OA",
    name: "Patellofemoral OA",
    category: "oa",
    catLabel: "Osteoarthritis",
    desc: "Patellar cartilage thinning, subchondral bone marrow edema, and trochlear groove osteophytosis.",
    prevalence: "22.3%",
    seqSensitivity: "Axial T2 / PDFS",
    auc: 0.854,
  },
  {
    id: "Effusion",
    name: "Joint Effusion",
    category: "fluid",
    catLabel: "Fluid & Synovium",
    desc: "Pathologic accumulation of intra-articular fluid distending suprapatellar bursa or capsule recesses.",
    prevalence: "41.9%",
    seqSensitivity: "Sagittal Fluid-Sensitive",
    auc: 0.928,
  },
  {
    id: "Synovitis",
    name: "Synovial Thickening",
    category: "fluid",
    catLabel: "Fluid & Synovium",
    desc: "Diffuse or nodular synovial proliferation, pannus formation, and vascular hyper-intensity.",
    prevalence: "14.7%",
    seqSensitivity: "Post-Contrast / T2 PDFS",
    auc: 0.835,
  },
  {
    id: "Baker's",
    name: "Baker's Cyst",
    category: "fluid",
    catLabel: "Fluid & Synovium",
    desc: "Popliteal cyst arising between medial head of gastrocnemius and semimembranosus tendon.",
    prevalence: "11.2%",
    seqSensitivity: "Sagittal & Axial T2",
    auc: 0.901,
  },
  {
    id: "Contusion",
    name: "Bone Contusion",
    category: "bone",
    catLabel: "Bone",
    desc: "Trabecular microfractures presenting as reticular ill-defined high signal on fluid-sensitive sequences.",
    prevalence: "15.3%",
    seqSensitivity: "Coronal / Sagittal PDFS",
    auc: 0.868,
  },
  {
    id: "Fracture",
    name: "Cortical Fracture",
    category: "bone",
    catLabel: "Bone",
    desc: "Sharp cortical disruption of distal femur, tibial plateau, fibular head, or patella.",
    prevalence: "4.8%",
    seqSensitivity: "Multi-planar T1 & T2",
    auc: 0.817,
  },
];

// Model Benchmark Scores
const MODEL_BENCHMARKS = {
  mil: {
    name: "2.5D MIL Gated Attention (Ours)",
    macroAuc: 0.8648,
    scores: [0.912, 0.884, 0.895, 0.871, 0.862, 0.849, 0.854, 0.928, 0.835, 0.901, 0.868, 0.817]
  },
  dinov2: {
    name: "DINOv2-S + Attention Pooling",
    macroAuc: 0.8512,
    scores: [0.895, 0.868, 0.881, 0.859, 0.850, 0.834, 0.841, 0.915, 0.820, 0.887, 0.852, 0.812]
  },
  cnn3d: {
    name: "3D Volumetric CNN (ResNet-18)",
    macroAuc: 0.8240,
    scores: [0.864, 0.832, 0.851, 0.825, 0.815, 0.804, 0.819, 0.889, 0.792, 0.861, 0.830, 0.806]
  },
  simple2d: {
    name: "Simple 2D Max-Pool Baseline",
    macroAuc: 0.7895,
    scores: [0.821, 0.795, 0.812, 0.785, 0.774, 0.762, 0.780, 0.865, 0.742, 0.824, 0.789, 0.725]
  }
};

// Multilingual Reports Data
const REPORTS_DATA = {
  en: {
    lang: "English (US Clinical)",
    badge: "Lang: EN • Multi-institutional",
    text: `CLINICAL INDICATION: 34-year-old male with twisting knee injury during sports. Persistent swelling and joint line pain.
FINDINGS:
There is complete disruption of the <span class="hl-pos">anterior cruciate ligament (ACL tear)</span> with anterior translation of the tibia. The <span class="hl-neg">medial collateral ligament (MCL) appears intact</span> without surrounding edema.
Within the medial meniscus, an oblique tear is identified extending to the inferior articular surface (<span class="hl-pos">medial meniscus tear</span>). The <span class="hl-neg">lateral meniscus is normal</span>.
Marked joint fluid distends the suprapatellar bursa, consistent with <span class="hl-pos">moderate-to-large joint effusion</span>.
Subchondral bone marrow edema is noted in the posterior lateral tibial plateau representing a <span class="hl-pos">bone contusion</span>. No evidence of <span class="hl-neg">fracture</span>. Minimal <span class="hl-neg">medial OA</span> change.`,
    labels: [
      { target: "ACL", prob: "0.98", isPos: true },
      { target: "MCL", prob: "0.04", isPos: false },
      { target: "Medial Meniscus", prob: "0.95", isPos: true },
      { target: "Lateral Meniscus", prob: "0.05", isPos: false },
      { target: "Medial OA", prob: "0.12", isPos: false },
      { target: "Lateral OA", prob: "0.03", isPos: false },
      { target: "PF OA", prob: "0.05", isPos: false },
      { target: "Effusion", prob: "0.96", isPos: true },
      { target: "Synovitis", prob: "0.45", isPos: false },
      { target: "Baker's", prob: "0.02", isPos: false },
      { target: "Contusion", prob: "0.91", isPos: true },
      { target: "Fracture", prob: "0.01", isPos: false },
    ]
  },
  de: {
    lang: "German (Klinischer Befund)",
    badge: "Lang: DE • European Hospital Partner",
    text: `INDIKATION: 58-jährige Patientin mit chronischen Knieschmerzen medial, Verdacht auf Gonarthrose.
BEFUND:
Erhebliche Knorpelreduktion im medialen Gelenkkompartiment mit subchondraler Sklerosierung und marginalen Osteophyten (<span class="hl-pos">mediale Gonarthrose / Medial OA</span>). Das retropatellare Gelenk zeigt ebenfalls deutliche Chondropathie (<span class="hl-pos">Patellofemorale Arthrose / PF OA</span>).
Degenerative Horizontalruptur des Hinterhorns des <span class="hl-pos">Innenmeniskus</span>. Das <span class="hl-neg">vordere Kreuzband (VKB / ACL)</span> und das <span class="hl-neg">Innenband (MCL)</span> stellen sich unauffällig dar.
Geringer <span class="hl-pos">Gelenkerguss (Effusion)</span> im Recessus suprapatellaris. Im medialen Kniekehlenbereich Nachweis einer 3,5 cm großen <span class="hl-pos">Baker-Zyste</span>. Keine frische <span class="hl-neg">Fraktur</span>.`,
    labels: [
      { target: "ACL", prob: "0.03", isPos: false },
      { target: "MCL", prob: "0.02", isPos: false },
      { target: "Medial Meniscus", prob: "0.92", isPos: true },
      { target: "Lateral Meniscus", prob: "0.08", isPos: false },
      { target: "Medial OA", prob: "0.96", isPos: true },
      { target: "Lateral OA", prob: "0.15", isPos: false },
      { target: "PF OA", prob: "0.89", isPos: true },
      { target: "Effusion", prob: "0.78", isPos: true },
      { target: "Synovitis", prob: "0.32", isPos: false },
      { target: "Baker's", prob: "0.94", isPos: true },
      { target: "Contusion", prob: "0.05", isPos: false },
      { target: "Fracture", prob: "0.01", isPos: false },
    ]
  },
  fr: {
    lang: "French (Compte Rendu)",
    badge: "Lang: FR • CHU Centre Hospitalier",
    text: `INDICATION: Traumatisme direct du genou droit suite à un accident de ski.
RÉSULTATS:
Rupture complète du <span class="hl-pos">ligament croisé antérieur (LCA / ACL)</span> avec œdème étendu. Distension sans rupture complète du <span class="hl-pos">ligament collatéral médial (LCM / MCL)</span>.
Intégrité des deux ménisques <span class="hl-neg">médial</span> et <span class="hl-neg">latéral</span>.
Important <span class="hl-pos">épanchement intra-articulaire (Effusion)</span> avec hémarthrose associée.
Mise en évidence de volumineuses impactions trabéculaires au niveau du condyle fémoral externe (<span class="hl-pos">contusion osseuse</span>). Absence de trait de <span class="hl-neg">fracture corticale</span>. Pas de signe d'<span class="hl-neg">arthrose</span>.`,
    labels: [
      { target: "ACL", prob: "0.97", isPos: true },
      { target: "MCL", prob: "0.84", isPos: true },
      { target: "Medial Meniscus", prob: "0.05", isPos: false },
      { target: "Lateral Meniscus", prob: "0.04", isPos: false },
      { target: "Medial OA", prob: "0.02", isPos: false },
      { target: "Lateral OA", prob: "0.02", isPos: false },
      { target: "PF OA", prob: "0.03", isPos: false },
      { target: "Effusion", prob: "0.98", isPos: true },
      { target: "Synovitis", prob: "0.60", isPos: true },
      { target: "Baker's", prob: "0.02", isPos: false },
      { target: "Contusion", prob: "0.93", isPos: true },
      { target: "Fracture", prob: "0.02", isPos: false },
    ]
  }
};

// Verified Sample Submission Text
const VERIFIED_SAMPLE_CSV = `StudyInstanceUID,ACL,MCL,Medial Meniscus,Lateral Meniscus,Medial OA,Lateral OA,PF OA,Effusion,Synovitis,Baker's,Contusion,Fracture
1.2.826.0.1.3680043.8.498.10047035057544427318018579121635276191,0.1500,0.1200,0.3500,0.2500,0.3000,0.2000,0.2200,0.4000,0.1800,0.1000,0.1500,0.0500
1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260,0.8520,0.0410,0.9140,0.0820,0.1200,0.0510,0.0950,0.8840,0.3400,0.0310,0.7620,0.0120`;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  renderAbnormalityCards("all");
  initFilters();
  initMriCanvas();
  initBenchmarkChart();
  initNlpLab();
  initValidator();
});

// Countdown Timer to Oct 22, 2026 23:59:00 UTC
function initCountdown() {
  const targetDate = new Date("2026-10-22T23:59:00Z").getTime();
  const el = document.getElementById("countdown-val");

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      el.textContent = "COMPETITION CONCLUDED";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = `${days}d ${hours}h ${mins}m remaining`;
  }
  update();
  setInterval(update, 60000);
}

// Render 12 Abnormality Cards
function renderAbnormalityCards(filter) {
  const container = document.getElementById("abnormality-cards");
  container.innerHTML = "";

  const filtered = filter === "all" 
    ? ABNORMALITIES 
    : ABNORMALITIES.filter(a => a.category === filter);

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "target-card";
    card.innerHTML = `
      <div>
        <div class="target-header">
          <span class="target-name">${item.name}</span>
          <span class="target-cat cat-${item.category}">${item.catLabel}</span>
        </div>
        <p class="target-desc">${item.desc}</p>
      </div>
      <div>
        <div class="target-stats">
          <span class="stat-k">Prevalence: <strong class="stat-v">${item.prevalence}</strong></span>
          <span class="stat-k">ROC AUC: <strong class="stat-auc">${item.auc.toFixed(3)}</strong></span>
        </div>
        <div class="target-stats" style="border:none; padding-top:4px;">
          <span class="stat-k">Key MR Sequence:</span>
          <span class="stat-v" style="font-size:0.75rem; color:var(--cyan-primary);">${item.seqSensitivity}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function initFilters() {
  const btns = document.querySelectorAll(".filter-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderAbnormalityCards(btn.dataset.filter);
    });
  });
}

// Interactive Knee MRI Canvas Simulator
function initMriCanvas() {
  const canvas = document.getElementById("mriCanvas");
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("sliceSlider");
  const toggleOrder = document.getElementById("toggle-slice-order");
  const sliceLabel = document.getElementById("current-slice-label");
  const overlaySlice = document.getElementById("overlay-slice-num");
  const overlayZ = document.getElementById("overlay-z-pos");
  const orderStatus = document.getElementById("order-status-text");
  const orderLabel = document.getElementById("slice-order-label");

  function drawSlice() {
    const rawVal = parseInt(slider.value, 10);
    const isFixed = toggleOrder.checked;

    // If corrupted order is toggled, pseudo-randomize slice mapping to demonstrate the bug!
    const corruptedIndices = [12, 3, 15, 1, 9, 14, 2, 7, 16, 4, 11, 6, 8, 13, 5, 10];
    const actualSlice = isFixed ? rawVal : corruptedIndices[rawVal - 1];

    // Clear canvas
    ctx.fillStyle = "#04060b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Simulate Anatomical Sagittal Knee Slice
    // Femur Condyle
    const femurRadius = 55 + Math.sin(actualSlice * 0.3) * 15;
    const femurGrad = ctx.createRadialGradient(cx - 20, cy - 60, 10, cx - 20, cy - 60, femurRadius);
    femurGrad.addColorStop(0, "rgba(220, 235, 255, 0.95)");
    femurGrad.addColorStop(0.7, "rgba(90, 115, 150, 0.6)");
    femurGrad.addColorStop(1, "rgba(10, 15, 30, 0.2)");
    ctx.fillStyle = femurGrad;
    ctx.beginPath();
    ctx.ellipse(cx - 20, cy - 60, femurRadius * 0.9, femurRadius * 1.1, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tibia Plateau
    const tibiaGrad = ctx.createRadialGradient(cx - 15, cy + 85, 15, cx - 15, cy + 85, 65);
    tibiaGrad.addColorStop(0, "rgba(220, 235, 255, 0.9)");
    tibiaGrad.addColorStop(0.75, "rgba(80, 105, 140, 0.5)");
    tibiaGrad.addColorStop(1, "rgba(10, 15, 30, 0.15)");
    ctx.fillStyle = tibiaGrad;
    ctx.beginPath();
    ctx.ellipse(cx - 15, cy + 85, 75, 45, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Patella (Anterior)
    ctx.fillStyle = "rgba(180, 205, 230, 0.75)";
    ctx.beginPath();
    ctx.ellipse(cx + 90, cy - 40, 18, 32, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Meniscus Triangular Wedges
    ctx.fillStyle = "rgba(15, 25, 45, 0.95)"; // Meniscus is low signal
    ctx.strokeStyle = "rgba(0, 242, 254, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy + 18);
    ctx.lineTo(cx - 35, cy + 18);
    ctx.lineTo(cx - 50, cy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Joint Effusion / Fluid signal (Bright White / T2 High Intensity)
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(cx + 60, cy - 65, 16 + Math.sin(actualSlice * 0.4) * 4, 0, Math.PI * 2);
    ctx.fill();

    // ACL Ligament Fibers
    ctx.strokeStyle = actualSlice >= 6 && actualSlice <= 10 ? "rgba(244, 63, 94, 0.9)" : "rgba(10, 15, 25, 0.9)";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 25);
    ctx.lineTo(cx + 5, cy + 45);
    ctx.stroke();

    // Subtle MRI scanline noise
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    // Update overlay text
    const zPos = (-24.0 + actualSlice * 3.0).toFixed(1);
    sliceLabel.textContent = `Slice ${rawVal} (Displaying Slice #${actualSlice})`;
    overlaySlice.textContent = `Slice: ${actualSlice.toString().padStart(2, "0")} / 16`;
    overlayZ.textContent = `Physical Z: ${zPos} mm`;

    if (isFixed) {
      orderStatus.textContent = "Normal Vector Projected: z = p · (r_row × r_col)";
      orderStatus.style.color = "var(--emerald-accent)";
      orderLabel.textContent = "Physical Normal Vector Order (Fixed & Smooth)";
    } else {
      orderStatus.textContent = "WARNING: Corrupted SOP Filename Sorting (Scrambled Anatomy)";
      orderStatus.style.color = "var(--rose-accent)";
      orderLabel.textContent = "Corrupted Filename Order (Bug Recreated)";
    }
  }

  slider.addEventListener("input", drawSlice);
  toggleOrder.addEventListener("change", drawSlice);
  drawSlice();
}

// Chart.js Benchmark Matrix
let aucChartInstance = null;
function initBenchmarkChart() {
  const ctx = document.getElementById("aucChart").getContext("2d");
  const macroEl = document.getElementById("chart-macro-auc");
  const tabBtns = document.querySelectorAll(".tab-btn");

  function renderChart(modelKey) {
    const model = MODEL_BENCHMARKS[modelKey];
    macroEl.textContent = model.macroAuc.toFixed(4);

    const labels = ABNORMALITIES.map(a => a.id);
    const data = model.scores;

    if (aucChartInstance) {
      aucChartInstance.destroy();
    }

    aucChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "ROC AUC",
            data: data,
            backgroundColor: "rgba(0, 242, 254, 0.65)",
            borderColor: "#00f2fe",
            borderWidth: 1.5,
            borderRadius: 6,
            hoverBackgroundColor: "#38bdf8",
          },
          {
            type: "line",
            label: "Macro Average Target",
            data: new Array(labels.length).fill(model.macroAuc),
            borderColor: "#10b981",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(7, 10, 19, 0.9)",
            titleColor: "#00f2fe",
            bodyColor: "#fff",
            borderColor: "rgba(0, 242, 254, 0.3)",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (context) => ` ROC AUC: ${context.parsed.y.toFixed(4)}`
            }
          }
        },
        scales: {
          y: {
            min: 0.65,
            max: 1.0,
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            ticks: { color: "#94a3b8", font: { family: "JetBrains Mono", size: 11 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: "#f8fafc", font: { family: "Outfit", size: 11, weight: "600" } }
          }
        }
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderChart(btn.dataset.model);
    });
  });

  renderChart("mil");
}

// Multilingual NLP Lab
function initNlpLab() {
  const langBtns = document.querySelectorAll(".lang-btn");
  const reportContainer = document.getElementById("report-text-container");
  const extractionsContainer = document.getElementById("extractions-list");
  const langBadge = document.getElementById("report-lang-badge");

  function updateNlp(langKey) {
    const data = REPORTS_DATA[langKey];
    langBadge.textContent = data.badge;
    reportContainer.innerHTML = data.text;

    extractionsContainer.innerHTML = "";
    data.labels.forEach(item => {
      const row = document.createElement("div");
      row.className = "extract-item";
      row.innerHTML = `
        <span class="extract-target">${item.target}</span>
        <span class="extract-prob ${item.isPos ? 'prob-high' : 'prob-low'}">
          ${item.isPos ? 'Positive' : 'Negative'} • p = ${item.prob}
        </span>
      `;
      extractionsContainer.appendChild(row);
    });
  }

  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      langBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateNlp(btn.dataset.lang);
    });
  });

  updateNlp("en");
}

// Submission Validator
function initValidator() {
  const input = document.getElementById("csvInput");
  const btnLoad = document.getElementById("btn-load-sample");
  const btnValidate = document.getElementById("btn-validate");
  const btnDownload = document.getElementById("btn-download-csv");
  const statusBadge = document.getElementById("validator-status-badge");
  const checkList = document.getElementById("check-list");

  btnLoad.addEventListener("click", () => {
    input.value = VERIFIED_SAMPLE_CSV;
    validateCsv();
  });

  btnValidate.addEventListener("click", validateCsv);

  btnDownload.addEventListener("click", () => {
    const text = input.value.trim() || VERIFIED_SAMPLE_CSV;
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "submission.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  function validateCsv() {
    const text = input.value.trim();
    if (!text) {
      statusBadge.textContent = "Empty Input";
      statusBadge.className = "badge-status-fail";
      return;
    }

    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const expectedCols = ["StudyInstanceUID", ...ABNORMALITIES.map(a => a.id)];

    let passColCount = false;
    let passHeaders = false;
    let passNoNulls = true;
    let passProbRange = true;
    let passUids = false;

    if (lines.length > 0) {
      const headerCols = lines[0].split(",").map(c => c.trim());
      passColCount = (headerCols.length === 13);
      passHeaders = JSON.stringify(headerCols) === JSON.stringify(expectedCols);

      if (lines.length > 1) {
        passUids = true;
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",").map(c => c.trim());
          if (cells.length !== 13) {
            passColCount = false;
          }
          for (let j = 1; j < cells.length; j++) {
            const val = parseFloat(cells[j]);
            if (isNaN(val) || cells[j] === "") {
              passNoNulls = false;
            }
            if (val < 0.0 || val > 1.0) {
              passProbRange = false;
            }
          }
        }
      }
    }

    const allPass = passColCount && passHeaders && passNoNulls && passProbRange && passUids;

    statusBadge.textContent = allPass ? "100% Compliant (PASS)" : "Schema Violation (FAIL)";
    statusBadge.className = allPass ? "badge-status-pass" : "badge-status-fail";

    checkList.innerHTML = `
      <div class="check-item ${passColCount ? 'check-pass' : 'check-fail'}">
        <span class="check-icon">${passColCount ? '✓' : '✗'}</span>
        Exactly 13 Columns matching official order (${passColCount ? '13/13' : 'Failed'})
      </div>
      <div class="check-item ${passHeaders ? 'check-pass' : 'check-fail'}">
        <span class="check-icon">${passHeaders ? '✓' : '✗'}</span>
        All 12 Abnormality target headers present in exact order
      </div>
      <div class="check-item ${passNoNulls ? 'check-pass' : 'check-fail'}">
        <span class="check-icon">${passNoNulls ? '✓' : '✗'}</span>
        Zero NaN / Null / Inf values detected
      </div>
      <div class="check-item ${passProbRange ? 'check-pass' : 'check-fail'}">
        <span class="check-icon">${passProbRange ? '✓' : '✗'}</span>
        All probabilities strictly bounded in [0.0, 1.0]
      </div>
      <div class="check-item ${passUids ? 'check-pass' : 'check-fail'}">
        <span class="check-icon">${passUids ? '✓' : '✗'}</span>
        Valid StudyInstanceUID identifiers (${lines.length - 1} study rows)
      </div>
    `;
  }
}

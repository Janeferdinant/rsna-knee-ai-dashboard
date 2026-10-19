# RSNA Knee Abnormality Detection — Clinical AI Dashboard

An interactive clinical AI intelligence platform and competition suite for the Kaggle **RSNA Knee Abnormality Detection** challenge.

![Dashboard Preview](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

1. **Live Competition Intelligence & Countdown:** Real-time countdown to the final submission deadline (Oct 22, 2026), tracking prize pool ($77k USD), study counts, and macro ROC AUC targets.
2. **12 Target Abnormality Breakdown:** Clinical anatomy definitions, prevalence metrics, and sequence sensitivities across all 12 evaluated findings (`ACL`, `MCL`, `Medial Meniscus`, `Lateral Meniscus`, `Medial OA`, `Lateral OA`, `PF OA`, `Effusion`, `Synovitis`, `Baker's`, `Contusion`, `Fracture`).
3. **Interactive 2.5D MRI Slicer Simulator:** Demonstrates the critical physical slice normal vector projection fix ($z = \vec{p} \cdot (\vec{r}_{\text{row}} \times \vec{r}_{\text{col}})$) vs corrupted alphabetical filename scrambling.
4. **Validation Benchmark Matrix:** Interactive Chart.js comparative matrix evaluating candidate deep learning models against the official 58 gold-standard multi-radiologist validation split.
5. **Multilingual NLP Weak-Supervision Lab:** Real-time demonstration of clinical report parsing across English, German, and French medical notes into calibrated binary labels.
6. **Live Kaggle Submission Validator:** Instant client-side verification of `submission.csv` schemas, 13-column ordering, probability bounds $[0.0, 1.0]$, and sample template downloads.
7. **Glassmorphic Medical Dark UI:** Built with Vanilla CSS, responsive layouts, glowing indicators, and modern typography (`Outfit`, `Space Grotesk`, `JetBrains Mono`).

---

## 🚀 Deployment

Deployed automatically to Vercel via Git integration.
- **Framework:** Static HTML5 / Vanilla CSS / Modern JS
- **Repository:** [https://github.com/Janeferdinant/rsna-knee-ai-dashboard](https://github.com/Janeferdinant/rsna-knee-ai-dashboard)

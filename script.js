console.log("EXCELSO'26 — Abyssal Glass loaded");

/* ---------- Rising bubbles in hero ---------- */
(function generateBubbles() {
  const field = document.querySelector('.bubbles');
  if (!field) return;
  const count = window.innerWidth < 600 ? 14 : 26;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.className = 'bubble';
    const size = Math.random() * 16 + 4;
    const left = Math.random() * 100;
    const duration = Math.random() * 10 + 9;
    const delay = Math.random() * 12;
    const drift = (Math.random() - 0.5) * 80;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${left}%`;
    b.style.setProperty('--drift', `${drift}px`);
    b.style.animationDuration = `${duration}s`;
    b.style.animationDelay = `${delay}s`;
    field.appendChild(b);
  }
})();

/* ---------- Rules toggle ---------- */
document.querySelectorAll('.rules-toggle').forEach(button => {
  button.addEventListener('click', (e) => {
    const rulesDiv = document.getElementById(button.getAttribute('aria-controls'));
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isExpanded));
    rulesDiv.hidden = isExpanded;
    rulesDiv.classList.toggle('open', !isExpanded);
    if (!isExpanded) createSparkles(e.clientX, e.clientY);
  });
});

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* ---------- Sparkle micro-interaction ---------- */
function createSparkles(x, y) {
  const colors = ['#5fe3f0', '#ecc886'];
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    const size = Math.random() * 6 + 4;
    sparkle.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      width:${size}px; height:${size}px; border-radius:50%;
      background:${colors[i % 2]}; pointer-events:none; z-index:9999;
      box-shadow:0 0 8px ${colors[i % 2]};
    `;
    document.body.appendChild(sparkle);
    const dx = (Math.random() - 0.5) * 110;
    const dy = (Math.random() - 0.5) * 110;
    sparkle.animate(
      [
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
      ],
      { duration: 700, easing: 'ease-out' }
    ).onfinish = () => sparkle.remove();
  }
}

/* ---------- Countdown ---------- */
const targetDate = new Date("March 7, 2026 08:30:00").getTime();
const countdownEl = document.getElementById("countdown");

function updateCountdown() {
  const distance = targetDate - Date.now();
  if (distance <= 0) {
    countdownEl.innerHTML = `<strong>It's here!</strong>`;
    clearInterval(countdownTimer);
    return;
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  countdownEl.innerHTML =
    `<span><strong>${days}</strong> Days</span>
     <span><strong>${hours}</strong> Hours</span>
     <span><strong>${minutes}</strong> Minutes</span>`;
}
updateCountdown();
const countdownTimer = setInterval(updateCountdown, 1000 * 30);

/* ---------- Multi-step registration form ---------- */
const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
let currentStep = 0;

function showStep(step) {
  steps.forEach((el, index) => el.classList.toggle("active", index === step));
}

nextBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const stepEl = btn.closest('.form-step');
    const input = stepEl.querySelector('input[required]');
    if (input && !input.reportValidity()) return;
    currentStep = Math.min(currentStep + 1, steps.length - 1);
    showStep(currentStep);
  });
});

prevBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentStep = Math.max(currentStep - 1, 0);
    showStep(currentStep);
  });
});

showStep(currentStep);

/* ---------- Dynamic participant fields ---------- */
const eventCheckboxes = document.querySelectorAll(".event-checkbox");
const container = document.getElementById("participantsContainer");

eventCheckboxes.forEach(checkbox => {
  checkbox.addEventListener("change", generateParticipants);
});

function generateParticipants() {
  container.innerHTML = "";

  eventCheckboxes.forEach(checkbox => {
    if (!checkbox.checked) return;

    let count = 0;
    if (["Upside Down Abyss", "Comeback Arena", "Sunken Strategy Quest"].includes(checkbox.value)) {
      count = 2;
    } else if (["Aquavengers", "Timeless Tides"].includes(checkbox.value)) {
      count = 1;
    }

    let html = `<h3>${checkbox.value}</h3>`;
    for (let i = 1; i <= count; i++) {
      html += `
        <input type="text" name="${checkbox.value} Participant ${i} Name" required placeholder="Participant ${i} Name">
        <input type="tel" name="${checkbox.value} Participant ${i} Contact" required placeholder="Participant ${i} Contact Number">
      `;
    }
    container.innerHTML += html;
  });
}

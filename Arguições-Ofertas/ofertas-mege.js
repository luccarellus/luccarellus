let total = 8 * 3600 + 42 * 60 + 17;

const cdh = document.getElementById('cdh');
const cdm = document.getElementById('cdm');
const cds = document.getElementById('cds');

setInterval(() => {
  if (total <= 0) return;
  total--;
  cdh.textContent = String(Math.floor(total / 3600)).padStart(2, '0');
  cdm.textContent = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  cds.textContent = String(total % 60).padStart(2, '0');
}, 1000);

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initSaldo();
  configurarEdicaoSaldo();
  renderizarGastos();
  atualizarTudo();
});

// =========================
// ELEMENTOS
// =========================
const voiceBtn = document.getElementById('voiceBtn');
const output = document.getElementById('output');
const listaGastos = document.getElementById('listaGastos');

const saldoDisplay = document.getElementById('saldoDisponivel');
const saldoInicialEl = document.getElementById('saldoInicial');
const totalGastosEl = document.getElementById('totalGastos');
const totalCaixinhasEl = document.getElementById('totalCaixinhas');
const saldoLivreEl = document.getElementById('saldoLivre');

const btnExcluirUltimo = document.getElementById('btnExcluirUltimo');
const btnExcluirTodos = document.getElementById('btnExcluirTodos');

const inputTextoGasto = document.getElementById('inputTextoGasto');
const btnRegistrarTexto = document.getElementById('btnRegistrarTexto');

// =========================
// ESTADO
// =========================
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let saldoTotal = Number(localStorage.getItem('saldoTotal')) || 0;

// 🔒 TRAVAS DE VOZ
let reconhecimentoAtivo = false;
let bloqueioRegistro = false;

// =========================
// SPEECH RECOGNITION
// =========================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.continuous = false;

  voiceBtn.addEventListener('click', () => {
    if (reconhecimentoAtivo) return;

    bloqueioRegistro = false;
    reconhecimentoAtivo = true;

    output.textContent = 'Ouvindo... 🎧';
    recognition.start();
  });

  recognition.onresult = (event) => {
    if (bloqueioRegistro) return;

    bloqueioRegistro = true;

    const texto = event.results[0][0].transcript.toLowerCase().trim();
    const resultado = interpretarGasto(texto);

    if (!resultado) {
      output.textContent = 'Diga algo como: "arroz 12"';
      finalizarReconhecimento();
      return;
    }

    registrarGasto(resultado);
    finalizarReconhecimento();
  };

  recognition.onerror = () => {
    output.textContent = 'Erro no reconhecimento de voz';
    finalizarReconhecimento();
  };

  recognition.onend = () => {
    reconhecimentoAtivo = false;
  };
}

// =========================
// FINALIZA VOZ (CRÍTICO)
// =========================
function finalizarReconhecimento() {
  try {
    recognition.stop();
  } catch (e) {}

  reconhecimentoAtivo = false;

  // cooldown defensivo
  setTimeout(() => {
    bloqueioRegistro = false;
  }, 800);
}

// =========================
// INTERPRETAÇÃO
// =========================
function interpretarGasto(texto) {
  const match = texto.match(/(.+?)\s+([\d.,]+)/);
  if (!match) return null;

  let valor = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
  if (isNaN(valor)) return null;

  return {
    descricao: match[1].trim(),
    valor
  };
}

// =========================
// REGISTRO DE GASTO
// =========================
function registrarGasto({ descricao, valor }) {
  gastos.push({ descricao, valor, data: new Date().toISOString() });
  salvar();
  renderizarGastos();
  atualizarTudo();

  output.textContent = `Registrado: ${descricao} — ${formatarMoeda(valor)}`;
}

// =========================
// REGISTRO POR TEXTO
// =========================
btnRegistrarTexto.addEventListener('click', () => {
  const texto = inputTextoGasto.value.trim().toLowerCase();
  if (!texto) return;

  const resultado = interpretarGasto(texto);
  if (!resultado) {
    output.textContent = 'Use: mercado 45,90';
    return;
  }

  registrarGasto(resultado);
  inputTextoGasto.value = '';
});

// =========================
// RENDER
// =========================
function renderizarGastos() {
  listaGastos.innerHTML = '';

  for (let i = gastos.length - 1; i >= 0; i--) {
    const g = gastos[i];
    const li = document.createElement('li');
    li.innerHTML = `<span>${g.descricao} — ${formatarMoeda(g.valor)}</span>`;
    listaGastos.appendChild(li);
  }
}

// =========================
// SALDOS
// =========================
function atualizarTudo() {
  const totalGastos = gastos.reduce((a, g) => a + g.valor, 0);
  const caixinhas = JSON.parse(localStorage.getItem('caixinhas')) || [];
  const totalCaixinhas = caixinhas.reduce((a, c) => a + Number(c.valor || 0), 0);

  const saldoDisponivel = saldoTotal - totalGastos;
  const saldoLivre = saldoDisponivel - totalCaixinhas;

  saldoDisplay.textContent = formatarMoeda(saldoDisponivel);
  saldoInicialEl.textContent = formatarMoeda(saldoTotal);
  totalGastosEl.textContent = formatarMoeda(totalGastos);
  totalCaixinhasEl.textContent = formatarMoeda(totalCaixinhas);
  saldoLivreEl.textContent = formatarMoeda(saldoLivre);
}

// =========================
// SALVAR
// =========================
function salvar() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
  localStorage.setItem('saldoTotal', saldoTotal);
}

function formatarMoeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

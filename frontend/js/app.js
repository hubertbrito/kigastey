// =========================
// INIT SALDO (modal)
// =========================
document.addEventListener('DOMContentLoaded', () => {
  initSaldo();
  configurarEdicaoSaldo();
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

const btnCaixinhasDesktop = document.getElementById('btnCaixinhasDesktop');
const btnCaixinhasMobile = document.getElementById('btnCaixinhasMobile');
const inputTextoGasto = document.getElementById('inputTextoGasto');
const btnRegistrarTexto = document.getElementById('btnRegistrarTexto');


// =========================
// ESTADO
// =========================
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let saldoTotal = Number(localStorage.getItem('saldoTotal')) || 0;

// =========================
// FUNÇÕES SALDO
// =========================
function initSaldo() {
  const saldo = localStorage.getItem('saldoTotal');

  if (!saldo || isNaN(Number(saldo))) {
    abrirModalSaldo(true);
  }
}

function configurarEdicaoSaldo() {
  const btnEditar = document.getElementById('btnEditarSaldo');
  if (!btnEditar) return;

  btnEditar.addEventListener('click', () => abrirModalSaldo(false));
}

function abrirModalSaldo(primeiraVez = false) {
  const modal = document.getElementById('modalSaldo');
  const input = document.getElementById('inputSaldo');
  const btn = document.getElementById('btnSalvarSaldo');
  const aviso = document.getElementById('avisoSaldo');

  if (!modal || !input || !btn) return;

  modal.classList.remove('hidden');

  const saldoAtual = Number(localStorage.getItem('saldoTotal')) || 0;
  input.value = saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (aviso) {
    aviso.textContent = primeiraVez
      ? 'Informe seu saldo inicial para começar.'
      : 'Alterar o saldo não apaga gastos nem caixinhas.';
  }

  btn.onclick = () => {
    const valor = parseFloat(input.value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valor)) {
      alert('Informe um valor válido');
      return;
    }
    saldoTotal = valor;
    localStorage.setItem('saldoTotal', valor);
    modal.classList.add('hidden');
    atualizarTudo();
  };
}

// =========================
// FUNÇÕES DE CAIXINHAS E GASTOS
// =========================
function obterTotalCaixinhas() {
  const caixinhas = JSON.parse(localStorage.getItem('caixinhas')) || [];
  return caixinhas.reduce((acc, c) => acc + Number(c.valor || 0), 0);
}

function obterTotalGastos() {
  return gastos.reduce((acc, g) => acc + Number(g.valor || 0), 0);
}

// =========================
// FUNÇÃO DE ALERTAS
// =========================
function mostrarAlerta(mensagem) {
  const modal = document.getElementById('modalAlerta');
  const texto = document.getElementById('mensagemAlerta');
  const btn = document.getElementById('btnFecharAlerta');
  if (!modal || !texto || !btn) return;

  texto.textContent = mensagem;
  modal.classList.remove('hidden');
  btn.onclick = () => modal.classList.add('hidden');
}

// =========================
// SPEECH RECOGNITION
// =========================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (!SpeechRecognition) {
  output.textContent = 'Seu navegador não suporta reconhecimento de voz.';
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;

  voiceBtn.addEventListener('click', () => {
    output.textContent = 'Ouvindo... 🎧';
    recognition.start();
  });

  recognition.onresult = (event) => {
    const texto = event.results[0][0].transcript.toLowerCase().trim();
    const resultado = interpretarGasto(texto);

    if (!resultado) {
      output.textContent = 'Diga algo como: "arroz 12" ou "uber 25,50"';
      return;
    }

    registrarGasto(resultado);
  };

  recognition.onerror = (event) => {
    output.textContent = `Erro no áudio: ${event.error}`;
  };
}

// =========================
// INTERPRETAÇÃO DE GASTO
// =========================
function interpretarGasto(texto) {
  const match = texto.match(/(.+?)\s+([\d.,]+)/);
  if (!match) return null;

  const valor = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
  if (isNaN(valor)) return null;

  return { descricao: match[1].trim(), valor };
}

// =========================
// REGISTRO DE GASTO COM DECISÃO
// =========================
function registrarGasto({ descricao, valor }) {
  const totalGastos = obterTotalGastos();
  const totalCaixinhas = obterTotalCaixinhas();
  const saldoDisponivel = saldoTotal - totalGastos;
  const saldoLivre = saldoDisponivel - totalCaixinhas;

  // CASO 1 — SALDO INSUFICIENTE
  if (valor > saldoDisponivel && totalCaixinhas === 0) {
    mostrarAlerta(
      `🚫 Saldo insuficiente\n\nVocê tem ${formatarMoeda(saldoDisponivel)} disponível.\n\nRegistrar este gasto deixará seu saldo negativo.`
    );
    return;
  }

  // CASO 2 — GASTO COMPROMETE CAIXINHAS
  if (totalCaixinhas > 0 && (saldoDisponivel - valor) < totalCaixinhas) {
    const confirmar = confirm(
      `⚠️ Este gasto comprometerá ${formatarMoeda((totalCaixinhas - (saldoDisponivel - valor)))} do dinheiro reservado nas suas caixinhas.\n\nDeseja continuar?`
    );
    if (!confirmar) {
      output.textContent = 'Gasto cancelado para proteger sua reserva.';
      return;
    }
  }

  // REGISTRA GASTO
  gastos.push({ descricao, valor, data: new Date().toISOString() });
  salvar();
  renderizarGastos();
  atualizarTudo();

  output.textContent = `Registrado: ${descricao} — ${formatarMoeda(valor)}`;
}

// =========================
// RENDERIZAÇÃO DE GASTOS
// =========================
function renderizarGastos() {
  listaGastos.innerHTML = '';
  for (let i = gastos.length - 1; i >= 0; i--) {
    const gasto = gastos[i];
    const li = document.createElement('li');

    const texto = document.createElement('span');
    texto.textContent = `${gasto.descricao} — ${formatarMoeda(gasto.valor)}`;

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = () => {
      if (confirm(`Excluir "${gasto.descricao}"?`)) {
        gastos.splice(i, 1);
        salvar();
        renderizarGastos();
        atualizarTudo();
      }
    };

    li.appendChild(texto);
    li.appendChild(btnExcluir);
    listaGastos.appendChild(li);
  }
}

// =========================
// ATUALIZA SALDOS
// =========================
function atualizarTudo() {
  const totalGastos = obterTotalGastos();
  const totalCaixinhas = obterTotalCaixinhas();

  const saldoDisponivel = saldoTotal - totalGastos;
  const saldoLivre = saldoDisponivel - totalCaixinhas;

  saldoDisplay.textContent = formatarMoeda(saldoDisponivel);
  saldoInicialEl.textContent = formatarMoeda(saldoTotal);
  totalGastosEl.textContent = formatarMoeda(totalGastos);
  totalCaixinhasEl.textContent = formatarMoeda(totalCaixinhas);
  saldoLivreEl.textContent = formatarMoeda(saldoLivre);

  saldoDisplay.classList.toggle('negativo', saldoDisponivel < 0);

  saldoLivreEl.classList.remove('positivo', 'negativo');
  saldoLivreEl.classList.add(saldoLivre < 0 ? 'negativo' : 'positivo');
}

// =========================
// BOTÕES DE EXCLUSÃO
// =========================
btnExcluirUltimo.addEventListener('click', () => {
  if (!gastos.length) return;
  if (confirm(`Excluir "${gastos[gastos.length - 1].descricao}"?`)) {
    gastos.pop();
    salvar();
    renderizarGastos();
    atualizarTudo();
  }
});

btnExcluirTodos.addEventListener('click', () => {
  if (!gastos.length) return;
  if (confirm('Excluir TODOS os gastos?')) {
    gastos = [];
    salvar();
    renderizarGastos();
    atualizarTudo();
  }
});

// =========================
// UTILIDADES
// =========================
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvar() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
  localStorage.setItem('saldoTotal', saldoTotal);
}

// =========================
// NAVEGAÇÃO PARA CAIXINHAS
// =========================
if (btnCaixinhasDesktop) btnCaixinhasDesktop.onclick = () => window.location.href = 'caixinhas.html';
if (btnCaixinhasMobile) btnCaixinhasMobile.onclick = () => window.location.href = 'caixinhas.html';

// =========================
// REGISTRO POR TEXTO
// =========================
btnRegistrarTexto.addEventListener('click', () => {
  const texto = inputTextoGasto.value.trim().toLowerCase();

  if (!texto) return;

  const resultado = interpretarGasto(texto);

  if (!resultado) {
    output.textContent = 'Use algo como: "almoço 25" ou "mercado 40,90"';
    return;
  }

  registrarGasto(resultado);
  inputTextoGasto.value = '';
});


// =========================
// INIT RENDERIZAÇÃO
// =========================
renderizarGastos();
atualizarTudo();



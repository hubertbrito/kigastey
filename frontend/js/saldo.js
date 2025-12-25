// =========================
// SALDO.JS — MODAL E EDIÇÃO
// =========================

document.addEventListener('DOMContentLoaded', () => {
  initSaldo();
  configurarEdicaoSaldo();
});

const modalSaldo = document.getElementById('modalSaldo');
const inputSaldo = document.getElementById('inputSaldo');
const btnSalvarSaldo = document.getElementById('btnSalvarSaldo');
const avisoSaldo = document.getElementById('avisoSaldo');

function initSaldo() {
  const saldo = localStorage.getItem('saldoTotal');
  if (!saldo || isNaN(Number(saldo))) {
    abrirModalSaldo(true);
  } else {
    // Apenas garante que os elementos de saldo inicial existam na partida
    if (typeof atualizarTudo === 'function') atualizarTudo();
  }
}

function configurarEdicaoSaldo() {
  const btnEditar = document.getElementById('btnEditarSaldo');
  if (btnEditar) btnEditar.onclick = () => abrirModalSaldo(false);
}

function abrirModalSaldo(primeiraVez = false) {
  if (!modalSaldo) return;
  modalSaldo.classList.remove('hidden');

  const saldoAtual = Number(localStorage.getItem('saldoTotal')) || 0;
  inputSaldo.value = saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  if (avisoSaldo) {
    avisoSaldo.textContent = primeiraVez 
      ? 'Informe seu saldo inicial para começar.' 
      : 'Alterar o saldo não apaga gastos nem caixinhas.';
  }

  btnSalvarSaldo.onclick = () => {
    const valor = parseFloat(inputSaldo.value.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valor)) {
      alert('Informe um valor válido');
      return;
    }

    localStorage.setItem('saldoTotal', valor);
    modalSaldo.classList.add('hidden');

    // CRÍTICO: Chama a função do app.js para atualizar a tela toda
    if (typeof atualizarTudo === 'function') {
      atualizarTudo();
    } else {
      location.reload(); // Fallback caso o app.js não tenha carregado
    }
  };
}
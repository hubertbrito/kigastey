// =========================
// SALDO.JS — MODAL E EDIÇÃO
// =========================

document.addEventListener('DOMContentLoaded', () => {
  initSaldo();
  configurarEdicaoSaldo();
});

// =========================
// ELEMENTOS DO MODAL
// =========================
const modalSaldo = document.getElementById('modalSaldo');
const inputSaldo = document.getElementById('inputSaldo');
const btnSalvarSaldo = document.getElementById('btnSalvarSaldo');
const avisoSaldo = document.getElementById('avisoSaldo');

// =========================
// INIT SALDO
// =========================
function initSaldo() {
  const saldo = localStorage.getItem('saldoTotal');

  if (!saldo || isNaN(Number(saldo))) {
    abrirModalSaldo(true);
  } else {
    atualizarSaldo();
  }
}

// =========================
// CONFIGURAR BOTÃO EDITAR
// =========================
function configurarEdicaoSaldo() {
  const btnEditar = document.getElementById('btnEditarSaldo');
  if (!btnEditar) return;

  btnEditar.addEventListener('click', () => abrirModalSaldo(false));
}

// =========================
// ABRIR MODAL
// =========================
function abrirModalSaldo(primeiraVez = false) {
  if (!modalSaldo || !inputSaldo || !btnSalvarSaldo) return;

  modalSaldo.classList.remove('hidden');

  const saldoAtual = Number(localStorage.getItem('saldoTotal')) || 0;
  inputSaldo.value = saldoAtual.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

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

    // Atualiza a tela sem reload pesado
    if (typeof atualizarTudo === 'function') {
      atualizarTudo();
    }
  };
}

// =========================
// FUNÇÃO PARA ATUALIZAR SALDO NA TELA
// =========================
function atualizarSaldo() {
  const saldoTotal = Number(localStorage.getItem('saldoTotal')) || 0;
  const saldoDisponivelEl = document.getElementById('saldoDisponivel');
  const saldoInicialEl = document.getElementById('saldoInicial');

  if (saldoDisponivelEl) saldoDisponivelEl.textContent = saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (saldoInicialEl) saldoInicialEl.textContent = saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

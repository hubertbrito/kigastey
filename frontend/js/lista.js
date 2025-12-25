// =========================
// PARAMS
// =========================
const params = new URLSearchParams(window.location.search);
const listaId = params.get('id');

if (!listaId) {
  alert('Lista inválida');
  window.location.href = 'listas.html';
}

// =========================
// ELEMENTOS
// =========================
const tituloLista = document.getElementById('tituloLista');
const inputItem = document.getElementById('inputItem');
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const listaItens = document.getElementById('listaItens');

const btnExcluirUltimo = document.getElementById('btnExcluirUltimo');
const btnExcluirTodos = document.getElementById('btnExcluirTodos');
const btnIntegrarGastos = document.getElementById('btnIntegrarGastos');

const modalPreco = document.getElementById('modalPreco');
const inputPreco = document.getElementById('inputPreco');
const btnCancelarPreco = document.getElementById('btnCancelarPreco');
const btnConfirmarPreco = document.getElementById('btnConfirmarPreco');

// =========================
// ESTADO
// =========================
let listas = JSON.parse(localStorage.getItem('listas')) || [];
let itens = JSON.parse(localStorage.getItem(`itens_${listaId}`)) || [];
let itemSelecionado = null;

// =========================
// INIT
// =========================
carregarTitulo();
renderizarItens();

// =========================
// TÍTULO
// =========================
function carregarTitulo() {
  const lista = listas.find(l => l.id === listaId);
  if (!lista) {
    alert('Lista não encontrada');
    window.location.href = 'listas.html';
    return;
  }
  tituloLista.textContent = lista.nome;
}

// =========================
// ADICIONAR ITEM
// =========================
btnAdicionarItem.onclick = () => {
  const nome = inputItem.value.trim();
  if (!nome) return;

  itens.push({
    id: Date.now().toString(),
    nome,
    ok: false,
    comprado: false,
    valor: null,
    integrado: false
  });

  salvar();
  renderizarItens();
  inputItem.value = '';
};

// =========================
// RENDER
// =========================
function renderizarItens() {
  listaItens.innerHTML = '';

  if (!itens.length) {
    listaItens.innerHTML = `<li class="item-card">Nenhum item</li>`;
    return;
  }

  itens.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-card';

    if (item.ok) li.classList.add('item-ok');
    if (item.comprado) li.classList.add('item-comprado');

    const nome = document.createElement('span');
    nome.className = 'item-nome';
    nome.textContent = item.valor
      ? `${item.nome} — R$ ${item.valor.toFixed(2)}`
      : item.nome;

    const btnOk = document.createElement('button');
    btnOk.textContent = '✔️';
    btnOk.onclick = () => {
      item.ok = !item.ok;
      salvar();
      renderizarItens();
    };

    const btnComprado = document.createElement('button');
    btnComprado.textContent = '💰';
    btnComprado.onclick = () => abrirModalPreco(item);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.onclick = () => {
      if (!confirm('Excluir item?')) return;
      itens.splice(index, 1);
      salvar();
      renderizarItens();
    };

    li.append(nome, btnOk, btnComprado, btnExcluir);
    listaItens.appendChild(li);
  });
}

// =========================
// MODAL
// =========================
function abrirModalPreco(item) {
  itemSelecionado = item;
  inputPreco.value = item.valor ?? '';
  modalPreco.classList.remove('hidden');
}

btnCancelarPreco.onclick = () => {
  modalPreco.classList.add('hidden');
  itemSelecionado = null;
};

btnConfirmarPreco.onclick = () => {
  const valor = Number(inputPreco.value);
  if (!valor || valor <= 0) return alert('Valor inválido');

  itemSelecionado.valor = valor;
  itemSelecionado.comprado = true;
  itemSelecionado.ok = false;

  salvar();
  renderizarItens();
  modalPreco.classList.add('hidden');
};

// =========================
// AÇÕES
// =========================
btnExcluirUltimo.onclick = () => {
  if (!itens.length) return;
  itens.pop();
  salvar();
  renderizarItens();
};

btnExcluirTodos.onclick = () => {
  if (!confirm('Excluir todos os itens?')) return;
  itens = [];
  salvar();
  renderizarItens();
};

btnIntegrarGastos.onclick = () => {
  const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
  const comprados = itens.filter(i => i.comprado && !i.integrado);

  if (!comprados.length) {
    alert('Nenhum item comprado');
    return;
  }

  const total = comprados.reduce((s, i) => s + i.valor, 0);

  gastos.push({
    descricao: tituloLista.textContent,
    valor: Number(total.toFixed(2)),
    data: new Date().toISOString()
  });

  comprados.forEach(i => (i.integrado = true));

  localStorage.setItem('gastos', JSON.stringify(gastos));
  salvar();
  alert('Total integrado aos gastos');
};

// =========================
// SALVAR
// =========================
function salvar() {
  localStorage.setItem(`itens_${listaId}`, JSON.stringify(itens));
}

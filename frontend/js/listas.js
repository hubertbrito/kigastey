// =========================
// ELEMENTOS
// =========================
const inputNomeLista = document.getElementById('inputNomeLista');
const btnCriarLista = document.getElementById('btnCriarLista');
const btnExcluirTodas = document.getElementById('btnExcluirTodas');
const listaDeListas = document.getElementById('listaDeListas');

// =========================
// ESTADO
// =========================
let listas = JSON.parse(localStorage.getItem('listas')) || [];

// =========================
// INIT
// =========================
renderizarListas();

// =========================
// CRIAR LISTA
// =========================
btnCriarLista.addEventListener('click', () => {
  const nome = inputNomeLista.value.trim();
  if (!nome) return;

  listas.push({
    id: Date.now().toString(),
    nome,
    criadaEm: new Date().toISOString()
  });

  salvar();
  renderizarListas();
  inputNomeLista.value = '';
});

// =========================
// EXCLUIR TODAS
// =========================
btnExcluirTodas?.addEventListener('click', () => {
  if (listas.length === 0) return;

  const confirmar = confirm('Excluir TODAS as listas?');
  if (!confirmar) return;

  // Remove itens de cada lista
  listas.forEach(lista => {
    localStorage.removeItem(`itens_${lista.id}`);
  });

  listas = [];
  salvar();
  renderizarListas();
});

// =========================
// RENDER
// =========================
function renderizarListas() {
  listaDeListas.innerHTML = '';

  if (listas.length === 0) {
    listaDeListas.innerHTML = `
      <li class="lista-vazia">
        Nenhuma lista criada ainda
      </li>
    `;
    return;
  }

  listas.forEach(lista => {
    const li = document.createElement('li');
    li.className = 'lista-card';

    const info = document.createElement('div');
    info.className = 'lista-info-wrapper';
    info.innerHTML = `
      <div class="lista-nome">${lista.nome}</div>
      <div class="lista-info">Toque para abrir</div>
    `;

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn-excluir-lista';
    btnExcluir.innerHTML = '🗑️';

    btnExcluir.addEventListener('click', (e) => {
      e.stopPropagation();
      excluirLista(lista.id);
    });

    li.append(info, btnExcluir);

    // Card inteiro clicável
    li.addEventListener('click', () => {
      li.classList.add('ativo');
      setTimeout(() => {
        window.location.href = `lista.html?id=${lista.id}`;
      }, 120);
    });

    listaDeListas.appendChild(li);
  });
}

// =========================
// EXCLUIR LISTA
// =========================
function excluirLista(id) {
  if (!confirm('Excluir esta lista?')) return;

  listas = listas.filter(l => l.id !== id);
  localStorage.removeItem(`itens_${id}`);

  salvar();
  renderizarListas();
}

// =========================
// SALVAR
// =========================
function salvar() {
  localStorage.setItem('listas', JSON.stringify(listas));
}

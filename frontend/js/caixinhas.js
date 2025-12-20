// =========================
// ELEMENTOS DO HTML
// =========================
const listaCaixinhasContainer = document.getElementById('listaCaixinhas');
const btnNovaCaixinha = document.querySelector('.btn-nova-caixinha');
const btnVoltar = document.querySelector('.btn-voltar');

// =========================
// ESTADO
// =========================
let caixinhas = JSON.parse(localStorage.getItem('caixinhas')) || [];

// =========================
// FORMATAÇÃO DE VALORES
// =========================
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function interpretarValorEntrada(valorStr) {
  if (!valorStr) return null;

  // Remove tudo que não é número, vírgula ou ponto
  valorStr = valorStr.replace(/[^0-9,\.]/g, '');

  let valor = 0;
  if (valorStr.includes(',')) {
    // Separar parte inteira e decimal
    let partes = valorStr.split(',');
    let inteiro = partes[0].replace(/\./g, ''); // remove pontos da parte inteira
    let decimal = partes[1].slice(0, 2); // pega no máximo dois dígitos para centavos
    valor = parseFloat(`${inteiro}.${decimal}`);
  } else {
    // Apenas números, remove pontos
    valor = parseFloat(valorStr.replace(/\./g, ''));
  }

  if (isNaN(valor)) return null;
  return valor;
}

// =========================
// FUNÇÃO DE RENDERIZAÇÃO
// =========================
function renderizarCaixinhas() {
  listaCaixinhasContainer.innerHTML = '';

  if (caixinhas.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.classList.add('empty');
    emptyMsg.textContent = 'Nenhuma caixinha registrada.';
    listaCaixinhasContainer.appendChild(emptyMsg);
    return;
  }

  const lista = document.createElement('div');
  lista.classList.add('lista-caixinhas');

  caixinhas.forEach((c, index) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const nome = document.createElement('span');
    nome.classList.add('nome');
    nome.textContent = c.nome;

    const valor = document.createElement('span');
    valor.classList.add('valor');
    valor.textContent = `R$ ${formatarMoeda(c.valor)}`;

    // Botão lixeira
const btnExcluir = document.createElement('button');
btnExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>'; // ícone de lixeira
btnExcluir.style.background = 'none';
btnExcluir.style.border = 'none';
btnExcluir.style.cursor = 'pointer';
btnExcluir.style.color = 'red';
btnExcluir.style.fontSize = '1.1rem';
btnExcluir.style.marginLeft = '12px';
btnExcluir.title = 'Excluir caixinha';
btnExcluir.onclick = () => {
  if (confirm(`Excluir caixinha "${c.nome}"?`)) {
    caixinhas.splice(index, 1);
    salvarCaixinhas();
    renderizarCaixinhas();
  }
};


    card.appendChild(nome);
    card.appendChild(valor);
    card.appendChild(btnExcluir);

    lista.appendChild(card);
  });

  listaCaixinhasContainer.appendChild(lista);
}

// =========================
// FUNÇÃO ADICIONAR NOVA CAIXINHA
// =========================
btnNovaCaixinha.addEventListener('click', () => {
  const nome = prompt('Nome da caixinha:');
  if (!nome || nome.trim() === '') return alert('Nome inválido!');

  let valorStr = prompt('Valor da caixinha:');
  const valor = interpretarValorEntrada(valorStr);
  if (valor === null) return alert('Valor inválido!');

  caixinhas.push({ nome: nome.trim(), valor });
  salvarCaixinhas();
  renderizarCaixinhas();
});

// =========================
// FUNÇÃO SALVAR LOCALSTORAGE
// =========================
function salvarCaixinhas() {
  localStorage.setItem('caixinhas', JSON.stringify(caixinhas));
}

// =========================
// VOLTAR PARA HOME
// =========================
btnVoltar.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// =========================
// INICIALIZAÇÃO
// =========================
renderizarCaixinhas();

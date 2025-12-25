// =========================
// APP.JS — VERSÃO COMPLETA E CORRIGIDA
// =========================

// ESTADO GLOBAL
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];
let saldoTotal = Number(localStorage.getItem('saldoTotal')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as funções
    renderizarGastos();
    atualizarTudo();
    configurarVoz(); // Ativa o microfone
});

// =========================
// 1. REGISTRO POR TEXTO (BOTÃO REGISTRAR)
// =========================
const btnRegistrarTexto = document.getElementById('btnRegistrarTexto');
const inputTextoGasto = document.getElementById('inputTextoGasto');

if (btnRegistrarTexto) {
    btnRegistrarTexto.onclick = () => {
        const texto = inputTextoGasto.value.trim().toLowerCase();
        if (!texto) return;

        const resultado = interpretarGasto(texto);
        if (!resultado) {
            alert('Use o formato: Uber 20 ou Mercado 45,90');
            return;
        }

        registrarGasto(resultado);
        inputTextoGasto.value = '';
    };
}

// =========================
// 2. REGISTRO POR VOZ (MICROFONE)
// =========================
function configurarVoz() {
    const voiceBtn = document.getElementById('voiceBtn');
    const output = document.getElementById('output');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition || !voiceBtn) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';

    voiceBtn.onclick = () => {
        output.textContent = 'Ouvindo... 🎧';
        recognition.start();
    };

    recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript.toLowerCase().trim();
        const resultado = interpretarGasto(texto);

        if (resultado) {
            registrarGasto(resultado);
            output.textContent = `Registrado: ${resultado.descricao}`;
        } else {
            output.textContent = 'Não entendi. Diga: "Café 5 reais"';
        }
    };
}

// =========================
// 3. INTERPRETAÇÃO E REGISTRO
// =========================
function interpretarGasto(texto) {
    const match = texto.match(/(.+?)\s+([\d.,]+)/);
    if (!match) return null;

    let valor = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
    if (isNaN(valor)) return null;

    return { descricao: match[1].trim(), valor };
}

function registrarGasto(gastoObj) {
    gastos.push({ ...gastoObj, data: new Date().toISOString() });
    salvarESincronizar();
}

// =========================
// 4. EXCLUSÃO (BOTÕES E LIXEIRA)
// =========================
const btnExcluirUltimo = document.getElementById('btnExcluirUltimo');
const btnExcluirTodos = document.getElementById('btnExcluirTodos');

if (btnExcluirUltimo) {
    btnExcluirUltimo.onclick = () => {
        if (gastos.length > 0 && confirm("Excluir o último gasto?")) {
            gastos.pop();
            salvarESincronizar();
        }
    };
}

if (btnExcluirTodos) {
    btnExcluirTodos.onclick = () => {
        if (gastos.length > 0 && confirm("Apagar toda a lista?")) {
            gastos = [];
            salvarESincronizar();
        }
    };
}

// Lixeira individual (Global para o HTML achar)
window.excluirGastoUnico = function(index) {
    if (confirm("Deseja excluir este item?")) {
        gastos.splice(index, 1);
        salvarESincronizar();
    }
};

// =========================
// 5. RENDERIZAÇÃO E SALDOS
// =========================
function renderizarGastos() {
    const lista = document.getElementById('listaGastos');
    if (!lista) return;

    lista.innerHTML = '';
    [...gastos].reverse().forEach((g, i) => {
        const indexReal = gastos.length - 1 - i;
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${g.descricao} — ${formatarMoeda(g.valor)}</span>
            <button class="btn-deletar-item" onclick="excluirGastoUnico(${indexReal})">🗑️</button>
        `;
        lista.appendChild(li);
    });
}

function atualizarTudo() {
    saldoTotal = Number(localStorage.getItem('saldoTotal')) || 0;
    const totalGastos = gastos.reduce((a, g) => a + g.valor, 0);
    const caixinhas = JSON.parse(localStorage.getItem('caixinhas')) || [];
    const totalCaixinhas = caixinhas.reduce((a, c) => a + Number(c.valor || 0), 0);

    const saldoDisponivel = saldoTotal - totalGastos;
    const saldoLivre = saldoDisponivel - totalCaixinhas;

    document.getElementById('saldoDisponivel').textContent = formatarMoeda(saldoDisponivel);
    document.getElementById('saldoInicial').textContent = formatarMoeda(saldoTotal);
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('totalCaixinhas').textContent = formatarMoeda(totalCaixinhas);
    
    const elLivre = document.getElementById('saldoLivre');
    if (elLivre) {
        elLivre.textContent = formatarMoeda(saldoLivre);
        elLivre.classList.remove('positivo', 'negativo');
        elLivre.classList.add(saldoLivre >= 0 ? 'positivo' : 'negativo');
    }
}

function salvarESincronizar() {
    localStorage.setItem('gastos', JSON.stringify(gastos));
    renderizarGastos();
    atualizarTudo();
}

function formatarMoeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Exporta para o saldo.js
window.atualizarTudo = atualizarTudo;
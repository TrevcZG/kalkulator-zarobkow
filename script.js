let isNettoMode = true;

// Oficjalne procenty na rok 2026 (Glovo, Uber Eats, Wolt, Pyszne.pl, Bolt Food)
const standardRates = [
    { text: 'Osoba nigdzie nie pracująca BEZ rezygnacji z PPK (29.82%)', val: 0.2982 },
    { text: 'Osoba nigdzie nie pracująca PO rezygnacji z PPK (27.82%)', val: 0.2782 },
    { text: 'Osoba nigdzie nie pracująca PONIŻEJ 26 roku życia BEZ rezygnacji z PPK (21.25%)', val: 0.2125 },
    { text: 'Osoba nigdzie nie pracująca PONIŻEJ 26 roku życia PO rezygnacji z PPK (19.25%)', val: 0.1925 },
    { text: 'Osoba pracująca (18.72%)', val: 0.1872, selected: true },
    { text: 'Osoba pracująca PONIŻEJ 26 roku życia (9%)', val: 0.09 },
    { text: 'Student / Uczeń DO 26 roku życia (0%)', val: 0 }
];

const stuartRates = [
    { text: 'Osoba pracująca (18.72%)', val: 0.1872, selected: true },
    { text: 'Osoba pracująca <26 roku życia (9%)', val: 0.09 },
    { text: 'Osoba bez pracy (48.61%)', val: 0.4861 },
    { text: 'Osoba bez pracy, po rezygnacji z PPK (45.11%)', val: 0.4511 },
    { text: 'Osoba bez pracy <26 roku życia (40.04%)', val: 0.4004 },
    { text: 'Student / Uczeń <26 roku życia (0%)', val: 0 }
];

// Elementy DOM
const appTypeSelect = document.getElementById('appType');
const statusSelect = document.getElementById('status');
const incomeInput = document.getElementById('incomeInput');
const partnerInput = document.getElementById('partner');
const cashInput = document.getElementById('cash');

const btnNetto = document.getElementById('btnNetto');
const btnBrutto = document.getElementById('btnBrutto');
const incomeLabelText = document.getElementById('incomeLabelText');

const totalNettoEl = document.getElementById('totalNetto');
const zusTaxEl = document.getElementById('zusTax');
const partnerFeeEl = document.getElementById('partnerFee');
const cashDeductionEl = document.getElementById('cashDeduction');
const bankTransferEl = document.getElementById('bankTransfer');
const totalProfitEl = document.getElementById('totalProfit');

const themeToggle = document.getElementById('themeToggle');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const saveCalcBtn = document.getElementById('saveCalcBtn');

// Motyw Czarny / Biały
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('theme', newTheme);
});

// Wczytywanie motywu
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

function populateStatusOptions() {
    const rates = appTypeSelect.value === 'stuart' ? stuartRates : standardRates;
    statusSelect.innerHTML = '';
    rates.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.val;
        opt.textContent = item.text;
        if (item.selected) opt.selected = true;
        statusSelect.appendChild(opt);
    });
    calculate();
}

btnNetto.addEventListener('click', () => {
    isNettoMode = true;
    btnNetto.classList.add('active');
    btnBrutto.classList.remove('active');
    incomeLabelText.textContent = 'Przychód Netto (bez VAT)';
    calculate();
});

btnBrutto.addEventListener('click', () => {
    isNettoMode = false;
    btnBrutto.classList.add('active');
    btnNetto.classList.remove('active');
    incomeLabelText.textContent = 'Przychód Brutto (z VAT 23%)';
    calculate();
});

function calculate() {
    const inputValue = parseFloat(incomeInput.value) || 0;
    const taxRate = parseFloat(statusSelect.value) || 0;
    const partnerFee = parseFloat(partnerInput.value) || 0;
    const cash = parseFloat(cashInput.value) || 0;

    let totalNetto = isNettoMode ? inputValue : (inputValue / 1.23);
    let zusTax = totalNetto * taxRate;
    let bankTransfer = totalNetto - zusTax - partnerFee - cash;
    let totalProfit = bankTransfer + cash;

    totalNettoEl.textContent = totalNetto.toFixed(2) + ' zł';
    zusTaxEl.textContent = '-' + zusTax.toFixed(2) + ' zł';
    partnerFeeEl.textContent = '-' + partnerFee.toFixed(2) + ' zł';
    cashDeductionEl.textContent = '-' + cash.toFixed(2) + ' zł';
    bankTransferEl.textContent = bankTransfer.toFixed(2) + ' zł';
    totalProfitEl.textContent = totalProfit.toFixed(2) + ' zł';

    return { totalNetto, zusTax, partnerFee, cash, bankTransfer, totalProfit };
}

// Obsługa LocalStorage - Historia
function getHistory() {
    return JSON.parse(localStorage.getItem('calc_history') || '[]');
}

function updateHistoryUI() {
    const history = getHistory();
    historyCount.textContent = history.length;
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center;">Brak zapisanych obliczeń.</p>';
        return;
    }

    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info">
                <div>${item.totalProfit} zł</div>
                <small>${item.date} • Przelew: ${item.bankTransfer} zł</small>
            </div>
            <button class="btn-danger-link" onclick="deleteHistoryItem(${index})">Usuń</button>
        `;
        historyList.appendChild(div);
    });
}

saveCalcBtn.addEventListener('click', () => {
    const res = calculate();
    if (res.totalProfit === 0) return;

    const history = getHistory();
    history.unshift({
        date: new Date().toLocaleDateString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        totalProfit: res.totalProfit.toFixed(2),
        bankTransfer: res.bankTransfer.toFixed(2)
    });

    localStorage.setItem('calc_history', JSON.stringify(history));
    updateHistoryUI();
    alert('Zapisano wyliczenie w historii!');
});

window.deleteHistoryItem = function(index) {
    const history = getHistory();
    history.splice(index, 1);
    localStorage.setItem('calc_history', JSON.stringify(history));
    updateHistoryUI();
};

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('calc_history');
    updateHistoryUI();
});

// Modal Szczegółów
document.getElementById('detailedCalcBtn').addEventListener('click', () => {
    const res = calculate();
    const modalText = document.getElementById('modalText');
    modalText.innerHTML = `
        <p><strong>Wyliczenia Krok po Kroku:</strong></p><br>
        <p>1. Podstawa Netto: <strong>${res.totalNetto.toFixed(2)} zł</strong></p>
        <p>2. Podatek / ZUS: <strong>-${res.zusTax.toFixed(2)} zł</strong></p>
        <p>3. Prowizja Partnera: <strong>-${res.partnerFee.toFixed(2)} zł</strong></p>
        <p>4. Potrącenie Gotówki: <strong>-${res.cash.toFixed(2)} zł</strong></p>
        <hr style="margin: 10px 0; border-color: var(--card-border);">
        <p><strong>Przelew na konto: ${res.bankTransfer.toFixed(2)} zł</strong></p>
        <p><strong>Twój zysk całkowity: ${res.totalProfit.toFixed(2)} zł</strong></p>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
});

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display = 'none';
});

appTypeSelect.addEventListener('change', populateStatusOptions);
statusSelect.addEventListener('change', calculate);
incomeInput.addEventListener('input', calculate);
partnerInput.addEventListener('input', calculate);
cashInput.addEventListener('input', calculate);

populateStatusOptions();
updateHistoryUI();

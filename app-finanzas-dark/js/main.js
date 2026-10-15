document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transactionForm');
    const typeInput = document.getElementById('type');
    const amountInput = document.getElementById('amount');
    const detailInput = document.getElementById('detail');
    const datetimeInput = document.getElementById('datetime');
    
    const transactionsList = document.getElementById('transactionsList');
    const noTransactions = document.getElementById('noTransactions');
    const clearHistoryBtn = document.getElementById('clearHistory');

    const totalBalanceEl = document.getElementById('totalBalance');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');

    // Establecer fecha y hora actual por defecto en el input
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    datetimeInput.value = now.toISOString().slice(0, 16);

    let transactions = JSON.parse(localStorage.getItem('finanzas_transactions')) || [];

    function saveAndRender() {
        localStorage.setItem('finanzas_transactions', JSON.stringify(transactions));
        renderTransactions();
        updateSummary();
    }

    function formatDateTime(isoString) {
        const date = new Date(isoString);
        if (isNaN(date)) return isoString;
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function renderTransactions() {
        transactionsList.innerHTML = '';
        
        if (transactions.length === 0) {
            noTransactions.style.display = 'block';
            return;
        }

        noTransactions.style.display = 'none';

        // Ordenar por fecha descendiente (más reciente primero)
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

        sortedTransactions.forEach((t) => {
            const tr = document.createElement('tr');
            
            const formattedDate = formatDateTime(t.datetime);
            const formattedAmount = formatCurrency(t.amount);
            const badgeClass = t.type === 'ingreso' ? 'badge-ingreso' : 'badge-egreso';
            const sign = t.type === 'ingreso' ? '+' : '-';

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td><span class="${badgeClass}">${t.type}</span></td>
                <td>${escapeHTML(t.detail)}</td>
                <td style="font-weight: 600; color: ${t.type === 'ingreso' ? 'var(--income)' : 'var(--expense)'}">${sign}${formattedAmount}</td>
                <td><button class="btn-delete" data-id="${t.id}" title="Eliminar">&times;</button></td>
            `;

            transactionsList.appendChild(tr);
        });
    }

    function updateSummary() {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            const amt = parseFloat(t.amount);
            if (t.type === 'ingreso') {
                totalIncome += amt;
            } else {
                totalExpense += amt;
            }
        });

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        totalBalanceEl.textContent = formatCurrency(balance);
        
        totalBalanceEl.style.color = balance >= 0 ? 'var(--income)' : 'var(--expense)';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newTransaction = {
            id: Date.now().toString(),
            type: typeInput.value,
            amount: parseFloat(amountInput.value),
            detail: detailInput.value.trim(),
            datetime: datetimeInput.value
        };

        transactions.push(newTransaction);
        saveAndRender();

        transactionForm.reset();
        // Restaurar fecha y hora actual
        const freshNow = new Date();
        freshNow.setMinutes(freshNow.getMinutes() - freshNow.getTimezoneOffset());
        datetimeInput.value = freshNow.toISOString().slice(0, 16);
        typeInput.focus();
    });

    transactionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            transactions = transactions.filter(t => t.id !== id);
            saveAndRender();
        }
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (transactions.length > 0 && confirm('¿Estás seguro de que deseas borrar todo el historial?')) {
            transactions = [];
            saveAndRender();
        }
    });

    // Carga inicial
    renderTransactions();
    updateSummary();
});

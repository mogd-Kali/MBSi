// Глобальные переменные
let wallet = {
    address: "",
    balance: 0,
    transactions: []
};

// Локальное хранилище для всех пользователей
let users = JSON.parse(localStorage.getItem('users')) || {};

// Генерация уникального адреса
function generateAddress() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let address = '';
    for (let i = 0; i < 10; i++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
}

// Создание или вход в аккаунт
function loginOrCreate() {
    const seedPhrase = document.getElementById('seedPhrase').value;
    if (seedPhrase) {
        if (users[seedPhrase]) {
            // Восстановление аккаунта
            wallet = users[seedPhrase];
        } else {
            // Создание нового аккаунта
            wallet = {
                address: generateAddress(),
                balance: 92, // Начальный баланс
                transactions: []
            };
            users[seedPhrase] = wallet;
            localStorage.setItem('users', JSON.stringify(users));
        }
        document.getElementById('login').style.display = 'none';
        document.getElementById('wallet').style.display = 'block';
        updateWallet();
        setCookie('seedPhrase', seedPhrase, 7);
    } else {
        alert('Please enter a seed phrase');
    }
}

// Отправка монет
function sendCoins() {
    const recipient = document.getElementById('recipient').value;
    const amount = parseInt(document.getElementById('amount').value);

    if (recipient && amount > 0 && amount <= wallet.balance) {
        // Поиск получателя
        let recipientWallet = null;
        for (const seed in users) {
            if (users[seed].address === recipient) {
                recipientWallet = users[seed];
                break;
            }
        }

        if (recipientWallet) {
            // Обновление балансов
            wallet.balance -= amount;
            recipientWallet.balance += amount;

            // Запись транзакций
            wallet.transactions.push({ to: recipient, amount: amount, date: new Date() });
            recipientWallet.transactions.push({ from: wallet.address, amount: amount, date: new Date() });

            // Сохранение данных
            localStorage.setItem('users', JSON.stringify(users));
            updateWallet();
        } else {
            alert('Recipient not found');
        }
    } else {
        alert('Invalid transaction');
    }
}

// Обновление интерфейса кошелька
function updateWallet() {
    document.getElementById('userAddress').innerText = wallet.address;
    document.getElementById('balance').innerText = wallet.balance;
    const transactionsList = document.getElementById('transactions');
    transactionsList.innerHTML = '';
    wallet.transactions.forEach(tx => {
        const li = document.createElement('li');
        li.innerText = `To: ${tx.to || tx.from}, Amount: ${tx.amount}, Date: ${tx.date}`;
        transactionsList.appendChild(li);
    });
}

// Установка куки
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Получение куки
function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";
}

// Автоматический вход при загрузке страницы
window.onload = function() {
    const seedPhrase = getCookie('seedPhrase');
    if (seedPhrase) {
        document.getElementById('seedPhrase').value = seedPhrase;
        loginOrCreate();
    }
};

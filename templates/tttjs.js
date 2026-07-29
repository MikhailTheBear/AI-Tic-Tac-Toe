let symbol = "X";
let gameOver = false;
let ws = null;
let mySymbol = "X";
let isMyTurn = true;
let currentTurn = "X";

function connectWebSocket() {
    ws = new WebSocket('ws://127.0.0.1:8765');
    
    ws.onopen = function() {
        document.getElementById('status').textContent = 'Подключено!';
    };
    
    ws.onmessage = function(event) {
        let data = JSON.parse(event.data);
        console.log('Получено:', data);
        
        if (data.type === 'init') {
            mySymbol = data.symbol;
            symbol = mySymbol;
            currentTurn = 'X';
            isMyTurn = (mySymbol === 'X');
            document.getElementById('status').textContent = 'Вы за ' + mySymbol + '. ' + (isMyTurn ? 'Ваш ход!' : 'Ждите...');
        }
        else if (data.type === 'move') {
            document.getElementById('c' + data.cellId).innerHTML = data.symbol;
            currentTurn = (data.symbol === 'X') ? 'O' : 'X';
            
            if (data.winner) {
                alert('Победил ' + data.winner + '!');
                gameOver = true;
                document.getElementById('status').textContent = 'Игра окончена!';
                isMyTurn = false;
            } else if (data.draw) {
                alert('Ничья!');
                gameOver = true;
                document.getElementById('status').textContent = 'Ничья!';
                isMyTurn = false;
            } else {
                isMyTurn = (mySymbol === currentTurn);
                document.getElementById('status').textContent = isMyTurn ? 'Ваш ход!' : 'Ждите...';
            }
        }
        else if (data.type === 'reset') {
            resetBoard();
            gameOver = false;
            currentTurn = 'X';
            isMyTurn = (mySymbol === 'X');
            document.getElementById('status').textContent = 'Новая игра! ' + (isMyTurn ? 'Ваш ход!' : 'Ждите...');
        }
    };
    
    ws.onclose = function() {
        document.getElementById('status').textContent = 'Отключено от сервера!';
    };
}

function press(id) {
    if (gameOver) {
        alert("Игра окончена!");
        return;
    }
    if (!isMyTurn) {
        alert("Сейчас не ваш ход!");
        return;
    }
    if (mySymbol !== currentTurn) {
        alert("Сейчас не ваш ход!");
        return;
    }
    
    let cell = document.getElementById("c" + id);
    if (cell.innerHTML !== "-") {
        alert("Ячейка занята!");
        return;
    }
    
    cell.innerHTML = symbol;
    isMyTurn = false;
    document.getElementById('status').textContent = 'Ждите...';
    
    let win = checkWin(symbol);
    let draw = !win && checkDraw();
    
    let data = {
        type: 'move',
        cellId: id,
        symbol: symbol,
        winner: win ? symbol : null,
        draw: draw
    };
    ws.send(JSON.stringify(data));
    
    if (win) {
        alert("Вы победили!");
        gameOver = true;
        document.getElementById('status').textContent = 'Игра окончена!';
        isMyTurn = false;
    } else if (draw) {
        alert("Ничья!");
        gameOver = true;
        document.getElementById('status').textContent = 'Ничья!';
        isMyTurn = false;
    } else {
        currentTurn = (currentTurn === 'X') ? 'O' : 'X';
    }
}

function checkWin(s) {
    let combos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let combo of combos) {
        let a = document.getElementById("c" + combo[0]).innerHTML;
        let b = document.getElementById("c" + combo[1]).innerHTML;
        let c = document.getElementById("c" + combo[2]).innerHTML;
        if (a == s && b == s && c == s) return true;
    }
    return false;
}

function checkDraw() {
    for (let i = 0; i <= 8; i++) {
        if (document.getElementById("c" + i).innerHTML == "-") return false;
    }
    return true;
}

function resetBoard() {
    for (let i = 0; i <= 8; i++) {
        document.getElementById("c" + i).innerHTML = "-";
    }
}

function resetGame() {
    resetBoard();
    gameOver = false;
    currentTurn = 'X';
    isMyTurn = (mySymbol === 'X');
    document.getElementById('status').textContent = 'Новая игра! ' + (isMyTurn ? 'Ваш ход!' : 'Ждите...');
    ws.send(JSON.stringify({type: 'reset'}));
}

window.onload = connectWebSocket;

const cars = [
    "🚗", "🏎️", "🚕", "🚙", "🚓",
    "🚑", "🚒", "🚐", "🚚", "🏍️"
];

let mode = 1;
let currentPlayer = 0;
let lives = [5, 5];
let scores = [0, 0];
let flippedCards = [];
let matchedPairs = 0;
let locked = false;
let gameActive = false;
let cards = [];

// Iniciar jogo
function startGame(selectedMode) {
    mode = selectedMode;
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    document.getElementById("result-modal").classList.add("hidden");

    document.getElementById("player2").classList.toggle(
        "hidden", mode === 1
    );

    restartGame();
}

// Reiniciar partida
function restartGame() {
    lives = [10, 10];
    scores = [0, 0];
    currentPlayer = 0;
    flippedCards = [];
    matchedPairs = 0;
    locked = false;
    gameActive = true;

    document.getElementById("result-modal").classList.add("hidden");

    // Criar os pares
    cards = [...cars, ...cars];

    // Embaralhar cartas
    cards.sort(() => Math.random() - 0.5);

    renderBoard();
    updateInfo();
    updateTurn();

    document.getElementById("status").textContent =
        "Encontre os pares de carros!";

    document.getElementById("found").textContent = "0";
}

// Criar tabuleiro
function renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    cards.forEach((car, index) => {
        const card = document.createElement("button");

        card.className = "card";
        card.textContent = "❓";
        card.dataset.index = index;
        card.setAttribute("aria-label", "Carta fechada");

        card.addEventListener("click", () => flipCard(card, index));

        board.appendChild(card);
    });
}

// Virar carta
function flipCard(card, index) {
    if (!gameActive || locked) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    card.textContent = cards[index];
    card.classList.add("flipped");
    card.setAttribute("aria-label", "Carta " + cards[index]);

    flippedCards.push({
        element: card,
        value: cards[index]
    });

    // Verificar duas cartas
    if (flippedCards.length === 2) {
        locked = true;

        const first = flippedCards[0];
        const second = flippedCards[1];

        if (first.value === second.value) {
            // Acertou!
            setTimeout(() => {
                first.element.classList.add("matched");
                second.element.classList.add("matched");

                first.element.disabled = true;
                second.element.disabled = true;

                matchedPairs++;
                scores[currentPlayer]++;

                document.getElementById("found").textContent =
                    matchedPairs;

                updateInfo();

                flippedCards = [];
                locked = false;

                document.getElementById("status").textContent =
                    "🎉 Par encontrado! Muito bem!";

                // Verificar vitória
                if (matchedPairs === 10) {
                    finishGame("victory");
                }

            }, 500);

        } else {
            // Errou: perder uma chance
            setTimeout(() => {
                first.element.textContent = "❓";
                second.element.textContent = "❓";

                first.element.classList.remove("flipped");
                second.element.classList.remove("flipped");

                first.element.setAttribute("aria-label", "Carta fechada");
                second.element.setAttribute("aria-label", "Carta fechada");

                lives[currentPlayer]--;

                updateInfo();

                flippedCards = [];
                locked = false;

                // Verificar se perdeu todas as chances
                if (lives[currentPlayer] <= 0) {
                    finishGame("defeat");
                    return;
                }

                // Alternar jogador no modo de dois jogadores
                if (mode === 2) {
                    currentPlayer = currentPlayer === 0 ? 1 : 0;
                    updateTurn();
                }

                document.getElementById("status").textContent =
                    "❌ Você errou! Perdeu uma chance.";

            }, 1000);
        }
    }
}

// Atualizar placar
function updateInfo() {
    document.getElementById("lives1").textContent = lives[0];
    document.getElementById("score1").textContent = scores[0];

    document.getElementById("lives2").textContent = lives[1];
    document.getElementById("score2").textContent = scores[1];
}

// Atualizar jogador da vez
function updateTurn() {
    const player1 = document.getElementById("player1");
    const player2 = document.getElementById("player2");

    player1.classList.toggle("active", currentPlayer === 0);
    player2.classList.toggle(
        "active",
        mode === 2 && currentPlayer === 1
    );

    if (mode === 1) {
        document.getElementById("turn-info").textContent =
            "Você está jogando sozinho!";
    } else {
        document.getElementById("turn-info").textContent =
            "Vez do Jogador " + (currentPlayer + 1);
    }
}

// Finalizar partida
function finishGame(result) {
    gameActive = false;
    locked = true;

    const modal = document.getElementById("result-modal");
    const title = document.getElementById("result-title");
    const message = document.getElementById("result-message");

    if (result === "victory") {
        title.textContent = "🏆 Parabéns!";

        if (mode === 1) {
            message.textContent =
                "Você encontrou todos os pares e venceu o jogo!";
        } else {
            message.textContent =
                "Jogador " + (scores[0] > scores[1] ? "1" :
                scores[1] > scores[0] ? "2" : "1 e Jogador 2") +
                (scores[0] === scores[1] ? " empataram!" : " venceu!");
        }

    } else {
        title.textContent = "💔 Fim de jogo!";

        if (mode === 1) {
            message.textContent =
                "Suas 5 chances acabaram! Tente novamente.";
        } else {
            const winner = currentPlayer === 0 ? 2 : 1;

            message.textContent =
                "Jogador " + winner +
                " venceu! O Jogador " + (currentPlayer + 1) +
                " perdeu todas as chances.";
        }
    }

    modal.classList.remove("hidden");
}

// Voltar ao menu
function backToMenu() {
    gameActive = false;
    locked = true;

    document.getElementById("game").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("result-modal").classList.add("hidden");
}


// Tema escolhido: carros.
// Cada símbolo aparece exatamente duas vezes.
const carSymbols = ["🚗", "🏎️", "🚕", "🚙", "🚓", "🏍️"];

let mode = 1;
let currentPlayer = 0;
let scores = [0, 0];
let deck = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let timerStarted = false;
let locked = false;
let gameActive = false;

const $ = (id) => document.getElementById(id);

// Iniciar jogo
function startGame(selectedMode) {
  mode = selectedMode;

  $("menu").classList.add("hidden");
  $("game").classList.remove("hidden");

  $("turn-stat").classList.toggle("hidden", mode === 1);

  restartGame();
}

// Embaralhar cartas usando Fisher-Yates
function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Reiniciar partida
function restartGame() {
  stopTimer();

  currentPlayer = 0;
  scores = [0, 0];
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  elapsedSeconds = 0;
  timerStarted = false;
  locked = false;
  gameActive = true;

  // Criar 12 cartas com 6 pares
  deck = shuffle([...carSymbols, ...carSymbols]);

  $("result-modal").classList.add("hidden");

  $("status").textContent = "Encontre os pares de carros!";

  $("turn-info").textContent = mode === 1
    ? "Clique em uma carta para começar."
    : "Vez do Jogador 1 — clique em uma carta.";

  updateStats();
  renderBoard();
}

// Criar tabuleiro
function renderBoard() {
  const board = $("board");

  board.innerHTML = "";

  deck.forEach((symbol, index) => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "card";
    card.dataset.index = index;

    card.setAttribute("aria-label", "Carta fechada");

    card.innerHTML = '<span class="symbol"></span>';

    card.addEventListener("click", () => {
      flipCard(card, index);
    });

    board.appendChild(card);
  });
}

// Iniciar cronômetro no primeiro clique
function startTimer() {
  if (timerStarted) return;

  timerStarted = true;

  timerInterval = setInterval(() => {
    elapsedSeconds++;

    $("timer").textContent = formatTime(elapsedSeconds);
  }, 1000);
}

// Parar cronômetro
function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Formatar tempo
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return String(minutes).padStart(2, "0") + ":" +
         String(seconds).padStart(2, "0");
}

// Virar carta
function flipCard(card, index) {

  // Impedir jogadas inválidas
  if (!gameActive || locked) return;

  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }

  startTimer();

  card.classList.add("flipped");

  card.querySelector(".symbol").textContent = deck[index];

  card.setAttribute(
    "aria-label",
    "Carta revelada: " + deck[index]
  );

  flippedCards.push({
    element: card,
    value: deck[index]
  });

  // Verificar duas cartas
  if (flippedCards.length === 2) {

    moves++;

    updateStats();

    locked = true;

    const [first, second] = flippedCards;

    // Acertou o par
    if (first.value === second.value) {

      window.setTimeout(() => {

        first.element.classList.add("matched");
        second.element.classList.add("matched");

        first.element.disabled = true;
        second.element.disabled = true;

        matchedPairs++;

        scores[currentPlayer]++;

        flippedCards = [];

        locked = false;

        updateStats();

        $("status").textContent =
          "🎉 Par encontrado! Muito bem!";

        // Verificar vitória
        if (matchedPairs === 6) {
          finishGame();
        } else {
          updateTurnInfo();
        }

      }, 350);

    } else {

      $("status").textContent =
        "Não são iguais. Tente novamente!";

      // Fechar cartas diferentes após 1 segundo
      window.setTimeout(() => {

        [first, second].forEach(({ element }) => {

          element.classList.remove("flipped");

          element.querySelector(".symbol").textContent = "";

          element.setAttribute(
            "aria-label",
            "Carta fechada"
          );
        });

        flippedCards = [];

        locked = false;

        // Alternar jogador no modo de dois jogadores
        if (mode === 2) {
          currentPlayer = currentPlayer === 0 ? 1 : 0;
        }

        $("status").textContent =
          "Continue procurando os pares!";

        updateTurnInfo();
        updateStats();

      }, 1000);
    }
  }
}

// Atualizar informações
function updateStats() {
  $("moves").textContent = moves;

  $("timer").textContent = formatTime(elapsedSeconds);

  $("pairs").textContent = matchedPairs + "/6";

  $("turn").textContent = currentPlayer + 1;
}

// Atualizar jogador da vez
function updateTurnInfo() {
  $("turn-info").textContent = mode === 1
    ? "Continue jogando. Boa sorte!"
    : "Vez do Jogador " + (currentPlayer + 1);
}

// Finalizar jogo
function finishGame() {
  gameActive = false;
  locked = true;

  stopTimer();

  $("status").textContent =
    "🏆 Todos os pares foram encontrados!";

  $("turn-info").textContent = "Jogo concluído!";

  $("result-title").textContent = "🏆 Parabéns!";

  $("result-message").textContent = mode === 1
    ? "Você completou o jogo da memória!"
    : "Os 6 pares foram encontrados! " +
      (scores[0] > scores[1]
        ? "Jogador 1 venceu!"
        : scores[1] > scores[0]
          ? "Jogador 2 venceu!"
          : "A partida terminou empatada!");

  $("result-stats").textContent =
    "Jogadas: " + moves +
    " | Tempo: " + formatTime(elapsedSeconds);

  $("result-modal").classList.remove("hidden");
}

// Voltar ao menu
function backToMenu() {
  gameActive = false;

  stopTimer();

  $("game").classList.add("hidden");

  $("menu").classList.remove("hidden");

  $("result-modal").classList.add("hidden");
}

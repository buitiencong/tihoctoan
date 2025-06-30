
let canvas, ctx;
let currentQuestion = null;
let bridgePieces = 0;
let gameStatus = 'playing';
let carPosition = -50;
let showFireworks = false;
let fireworksParticles = [];
let currentTheme = 0;

const bridgeImage = new Image();
bridgeImage.src = "bridge_1.png";
const carImage = new Image();
carImage.src = "car_1.png";


const maxBridgePieces = 5;

const canvasEl = document.getElementById("game-canvas");
const questionTextEl = document.getElementById("math-question");
const answerInputEl = document.getElementById("answer-input");
const formEl = document.getElementById("question-form");
const feedbackEl = document.getElementById("feedback");
const resetBtn = document.getElementById("reset-btn");
const progressEl = document.getElementById("progress");
const themeNameEl = document.getElementById("theme-name");

const victorySectionEl = document.getElementById("victory-section");
const victoryMsgEl = document.getElementById("victory-message");
const finalScoreEl = document.getElementById("final-score");
const continueBtn = document.getElementById("continue-btn");
const restartBtn = document.getElementById("restart-btn");
const nextThemeEl = document.getElementById("next-theme-preview");

function generateQuestion() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let n1, n2, ans;
  if (op === '+') {
    n1 = Math.floor(Math.random() * 20 + 1);
    n2 = Math.floor(Math.random() * 20 + 1);
    ans = n1 + n2;
  } else if (op === '-') {
    n1 = Math.floor(Math.random() * 20 + 10);
    n2 = Math.floor(Math.random() * 10 + 1);
    ans = n1 - n2;
  } else {
    n1 = Math.floor(Math.random() * 10 + 1);
    n2 = Math.floor(Math.random() * 10 + 1);
    ans = n1 * n2;
  }
  return { question: n1 + ' ' + op + ' ' + n2, answer: ans };
}

function updateUI() {
  questionTextEl.textContent = currentQuestion.question + ' = ?';
  progressEl.textContent = 'Tiến độ cầu: ' + bridgePieces + '/' + maxBridgePieces;
  themeNameEl.textContent = gameThemes[currentTheme].name;
}

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  const userAns = parseInt(answerInputEl.value);
  answerInputEl.value = '';

  if (userAns === currentQuestion.answer) {
    bridgePieces = Math.min(bridgePieces + 1, maxBridgePieces);
    if (bridgePieces === maxBridgePieces) {
      gameStatus = 'won';
      carPosition = -50;
      showVictory();
    } else {
      showFeedback('✅ Đúng rồi!');
    }
  } else {
    bridgePieces = Math.max(bridgePieces - 1, 0);
    showFeedback('❌ Sai rồi!');
  }

  if (gameStatus !== 'won') {
    currentQuestion = generateQuestion();
    updateUI();
  }
});

function showFeedback(msg) {
  feedbackEl.textContent = msg;
  feedbackEl.style.display = 'block';
  setTimeout(() => {
    feedbackEl.style.display = 'none';
  }, 3000);
}

function showVictory() {
  feedbackEl.style.display = 'none';
  victorySectionEl.style.display = 'block';
  showFireworks = true;
  createFirework(canvas.width / 2, canvas.height / 2);
  victoryMsgEl.innerHTML = 'Bạn đã hoàn thành ' + gameThemes[currentTheme].name + '!<br>Xe đã chạy qua cầu!';
  finalScoreEl.style.display = 'none';
  nextThemeEl.innerHTML = 'Level tiếp theo: <strong>' + gameThemes[(currentTheme + 1) % gameThemes.length].name + '</strong><br>' +
    gameThemes[(currentTheme + 1) % gameThemes.length].description;
}

function resetGame() {
  bridgePieces = 0;
  gameStatus = 'playing';
  carPosition = -50;
  showFireworks = false;
  fireworksParticles = [];
  currentQuestion = generateQuestion();
  victorySectionEl.style.display = 'none';
  finalScoreEl.style.display = 'none';
  updateUI();
}

function continueGame() {
  currentTheme = (currentTheme + 1) % gameThemes.length;
  resetGame();
}

resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);
continueBtn.addEventListener("click", continueGame);

const gameThemes = [
  // {
  //   name: "Forest Valley",
  //   description: "Cầu rừng xanh mát",
  //   background: "bg_forest.png",
  //   bridge: "bridge_forest.png",
  //   car: "car_forest.png"
  // },
  { name: "Forest Valley", description: "Cầu rừng xanh mát" },
  { name: "Desert Canyon", description: "Cầu sa mạc huyền bí" },
  { name: "City Skyline", description: "Cầu thành phố hiện đại" },
  { name: "Space Station", description: "Cầu vũ trụ tương lai" },
  { name: "Autumn Lake", description: "Cầu mùa thu lãng mạn" }
];

window.onload = () => {
  canvas = canvasEl;
  ctx = canvas.getContext("2d");
  currentQuestion = generateQuestion();
  updateUI();
  loop();
};

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ddeeff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ mảnh cầu bằng hình ảnh
  const pieceWidth = (canvas.width - 120) / maxBridgePieces;
  for (let i = 0; i < bridgePieces; i++) {
    const x = 60 + i * pieceWidth;
    const y = canvas.height - 40;
    ctx.drawImage(bridgeImage, x, y, pieceWidth - 4, 12);
  }

  // Vẽ xe nếu thắng
  if (gameStatus === "won") {
    const carY = canvas.height - 60;
    ctx.drawImage(carImage, carPosition, carY, 40, 20); // tùy chỉnh size nếu cần
    carPosition += 2;
  }

    // Vẽ pháo hoa nếu đang ở trạng thái thắng
  if (showFireworks) {
    fireworksParticles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Cập nhật vị trí
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // trọng lực
      p.alpha -= 0.015; // mờ dần
    });
    // Loại bỏ các hạt đã tắt
    fireworksParticles = fireworksParticles.filter(p => p.alpha > 0);
    ctx.globalAlpha = 1.0;
  }

}


function loop() {
  requestAnimationFrame(loop);
  drawGame();
}

// Tạo pháo hoa
function createFirework(x, y) {
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 3 + 2;
    fireworksParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }
}

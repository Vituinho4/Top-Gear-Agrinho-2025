let gameState = "menu"; // menu, estrada, mercado, loja, puzzle

// Jogador
let player;
let carroSelecionadoIndex = 0;

// Arrays de objetos
let carrosInimigos = [];
let frutas = [];
let mercados = [];

// Dinheiro e frutas coletadas
let dinheiro = 0;
let frutasColetadas = 0;

// Scroll vertical para simular movimento
let scrollY = 0;

// Tempo parado no mercado para entregar
let tempoParado = 0;
const tempoNecessario = 5000;
let paradoNoMercado = false;

// Dados dos carros disponíveis na loja
let lojaCarros = [
  { name: "Carro Básico", speed: 8, price: 0, hasTurbo: false, color: "red" },
  { name: "Carro Rápido", speed: 10, price: 50, hasTurbo: true, color: "blue" },
  { name: "Carro Super", speed: 12, price: 120, hasTurbo: true, color: "green" },
];

// Puzzles para o mercado
let puzzleAtivo = null; // 'puzzleE' ou 'puzzleMemoria'
let puzzleResolvido = false;
let puzzleTempo = 0;
const puzzleDuracao = 5000; // 5s para completar puzzle

// Jogo de Memória
let memoriaSequencia = [];
let memoriaJogador = [];
let memoriaNivel = 1;
let memoriaAguardando = false;
let memoriaMostrando = false;
let memoriaTempoMostrar = 0;
let coresMemoria = ['red', 'blue', 'green', 'yellow'];

// Controle de clique para botões
let botaoClicado = false;

function setup() {
  createCanvas(900, 600);
  player = new Player(lojaCarros[carroSelecionadoIndex].speed, lojaCarros[carroSelecionadoIndex].color);
  gerarMercados();
  gerarCarrosInimigos();
  gerarFrutas();
}

function draw() {
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "loja") {
    drawLoja();
  } else if (gameState === "estrada") {
    drawEstrada();
  } else if (gameState === "mercado") {
    drawMercado();
  } else if (gameState === "puzzle") {
    if (puzzleAtivo === 'puzzleE') {
      drawPuzzleE();
    } else if (puzzleAtivo === 'puzzleMemoria') {
      drawPuzzleMemoria();
    }
  }
}

function mouseReleased() {
  botaoClicado = false; // libera clique ao soltar o mouse
}

function keyPressed() {
  if (gameState === "puzzle" && puzzleAtivo === 'puzzleE' && !puzzleResolvido && (key === 'e' || key === 'E')) {
    puzzleTempo += 500; // Pressionar 'E' acelera o puzzle
    if (puzzleTempo >= puzzleDuracao) {
      completarPuzzle();
    }
  }
  
  if ((gameState === "loja" || gameState === "puzzle") && (key === 'r' || key === 'R')) {
    gameState = "menu";
  }
}

// --- Estados ---

function drawMenu() {
  background(100, 150, 200);
  fill(255);
  textAlign(CENTER);
  textSize(48);
  text("Top Gear Agrinho 2025", width / 2, 150);

  // Botão Jogar
  drawButton(width / 2 - 100, 300, 200, 60, "Jogar", () => {
    gameState = "estrada";
    resetJogo();
  });

  // Botão Loja
  drawButton(width / 2 - 100, 400, 200, 60, "Loja", () => {
    gameState = "loja";
  });
}

function drawLoja() {
  background(180, 220, 255);
  fill(0);
  textAlign(CENTER);
  textSize(36);
  text("Loja de Carros", width / 2, 60);
  mostrarDinheiro();

  for (let i = 0; i < lojaCarros.length; i++) {
    let c = lojaCarros[i];
    let y = 120 + i * 80;

    if (i === carroSelecionadoIndex) {
      stroke(255, 215, 0);
      strokeWeight(4);
    } else {
      noStroke();
    }
    fill(230);
    rect(100, y, 250, 50, 10);
    noStroke();
    fill(0);
    textSize(20);
    textAlign(LEFT, CENTER);
    text(`${c.name} - Velocidade: ${c.speed} - Preço: $${c.price}`, 110, y + 25);

    // Botão Comprar / Selecionar
    let btnX = 380,
      btnY = y + 10,
      btnW = 120,
      btnH = 30;

    fill(100, 200, 100);
    rect(btnX, btnY, btnW, btnH, 5);
    fill(0);
    textAlign(CENTER, CENTER);

    if (i === carroSelecionadoIndex) {
      text("Selecionado", btnX + btnW / 2, btnY + btnH / 2);
    } else if (dinheiro >= c.price) {
      text("Comprar", btnX + btnW / 2, btnY + btnH / 2);
    } else {
      text("Sem grana", btnX + btnW / 2, btnY + btnH / 2);
    }

    // Clique botão Comprar/Selecionar
    if (
      !botaoClicado &&
      mouseIsPressed &&
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      if (i !== carroSelecionadoIndex && dinheiro >= c.price) {
        dinheiro -= c.price;
        carroSelecionadoIndex = i;
        player = new Player(lojaCarros[carroSelecionadoIndex].speed, lojaCarros[carroSelecionadoIndex].color);
      }
      botaoClicado = true;
    }

    // Botão Turbo se tem turbo e selecionado
    if (c.hasTurbo && i === carroSelecionadoIndex) {
      let turboX = btnX + btnW + 20,
        turboY = btnY,
        turboW = 80,
        turboH = 30;
      fill(player.turboAtivo ? "orange" : "gray");
      rect(turboX, turboY, turboW, turboH, 5);
      fill(0);
      textSize(16);
      textAlign(CENTER, CENTER);
      text("Turbo", turboX + turboW / 2, turboY + turboH / 2);

      // Clique botão turbo
      if (
        !botaoClicado &&
        mouseIsPressed &&
        mouseX > turboX &&
        mouseX < turboX + turboW &&
        mouseY > turboY &&
        mouseY < turboY + turboH
      ) {
        player.toggleTurbo();
        botaoClicado = true;
      }
    }
  }

  textSize(18);
  textAlign(CENTER);
  fill(0);
  text("Pressione 'R' para voltar ao menu", width / 2, height - 40);
}

function drawEstrada() {
  desenharEstradaScroll(scrollY);

  // Atualizar e mostrar frutas
  for (let i = frutas.length - 1; i >= 0; i--) {
    frutas[i].update();
    frutas[i].show(scrollY);

    if (player.coletou(frutas[i], scrollY)) {
      frutasColetadas++;
      frutas.splice(i, 1);
    }
  }

  // Atualizar e mostrar carros inimigos
  for (let ci of carrosInimigos) {
    ci.update(scrollY);
    ci.show(scrollY);

    if (player.colidiu(ci, scrollY)) {
      alert("Você bateu! Fim de jogo.");
      resetJogo();
      gameState = "menu";
      return;
    }
  }

  // Mostrar mercados
  for (let m of mercados) {
    m.show(scrollY);

    if (player.estaNaArea(m, scrollY)) {
      gameState = "mercado";
      paradoNoMercado = true;
      tempoParado = 0;
    }
  }

  // Mostrar jogador e atualizar movimento
  player.update();
  player.show();

  // Avança o scroll
  scrollY += 1;

  // HUD
  mostrarDinheiro();
  mostrarFrutas();

  // Distância até próximo mercado
  if (mercados.length > 0) {
    let prox = mercados[0];
    let distM = prox.y - scrollY - player.y;
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text(`Distância até o mercado: ${max(0, floor(distM))} px`, width / 2, 30);
  }
}

function drawMercado() {
  background(0, 150, 0);
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text("Mercado - Estacione e fique 5 segundos para entregar frutas", width / 2, 80);

  tempoParado += deltaTime;

  let restante = max(0, (tempoNecessario - tempoParado) / 1000).toFixed(1);
  textSize(24);
  text(`Tempo restante: ${restante}s`, width / 2, 140);

  player.show();

  if (tempoParado >= tempoNecessario) {
    // Escolhe aleatoriamente entre os dois puzzles
    puzzleAtivo = random(['puzzleE', 'puzzleMemoria']) > 0.5 ? 'puzzleE' : 'puzzleMemoria';
    
    if (puzzleAtivo === 'puzzleMemoria') {
      iniciarPuzzleMemoria();
    } else {
      puzzleTempo = 0;
    }
    
    puzzleResolvido = false;
    gameState = "puzzle";
  }
  
  textSize(16);
  text("Pressione 'R' para sair do mercado (voltar ao menu)", width / 2, height - 40);
}

function drawPuzzleE() {
  background(50, 50, 100);
  fill(255);
  textSize(28);
  textAlign(CENTER);
  text("Mini Puzzle - Pressione 'E' para ajudar a trocar as frutas por dinheiro!", width / 2, 100);

  // Barrinha de progresso do puzzle
  let progresso = map(puzzleTempo, 0, puzzleDuracao, 0, width - 200);
  fill(0, 200, 100);
  rect(100, height / 2 - 20, progresso, 40, 10);
  noFill();
  stroke(255);
  rect(100, height / 2 - 20, width - 200, 40, 10);
  noStroke();

  if (puzzleResolvido) {
    fill(0, 255, 0);
    textSize(32);
    text("Puzzle concluído! Dinheiro recebido.", width / 2, height / 2 + 80);
    textSize(18);
    text("Pressione 'R' para voltar ao menu", width / 2, height - 40);
  }
}

function drawPuzzleMemoria() {
  background(70, 70, 120);
  fill(255);
  textSize(28);
  textAlign(CENTER);
  text("Jogo de Memória - Repita a sequência de cores!", width / 2, 60);
  textSize(20);
  text(`Nível: ${memoriaNivel}`, width / 2, 100);
  
  // Desenha os botões de cores
  let tamanho = 80;
  let espaco = 20;
  let xInicio = width/2 - (tamanho*2 + espaco)/2;
  let yInicio = height/2 - tamanho/2;
  
  for (let i = 0; i < 4; i++) {
    let x = xInicio + i*(tamanho + espaco);
    let cor = memoriaMostrando && memoriaSequencia[memoriaTempoMostrar] === i ? 
              coresMemoria[i] : 
              color(red(coresMemoria[i])*0.5, green(coresMemoria[i])*0.5, blue(coresMemoria[i])*0.5);
    
    fill(cor);
    rect(x, yInicio, tamanho, tamanho, 10);
    
    // Verifica cliques nos botões
    if (!memoriaMostrando && !botaoClicado && mouseIsPressed && 
        mouseX > x && mouseX < x + tamanho && mouseY > yInicio && mouseY < yInicio + tamanho) {
      botaoClicado = true;
      memoriaJogador.push(i);
      verificarSequenciaMemoria();
    }
  }
  
  // Mostra a sequência
  if (memoriaMostrando) {
    memoriaTempoMostrar += deltaTime;
    if (memoriaTempoMostrar >= 1000) { // 1 segundo por cor
      memoriaTempoMostrar = 0;
      if (memoriaSequencia.length > memoriaTempoMostrar) {
        // Mostra próxima cor
      } else {
        memoriaMostrando = false;
      }
    }
  }
  
  if (puzzleResolvido) {
    fill(0, 255, 0);
    textSize(32);
    text("Sequência correta! Dinheiro recebido.", width / 2, height - 100);
    textSize(18);
    text("Pressione 'R' para voltar ao menu", width / 2, height - 40);
  }
}

function iniciarPuzzleMemoria() {
  memoriaSequencia = [];
  memoriaJogador = [];
  memoriaNivel = 1;
  memoriaMostrando = true;
  memoriaTempoMostrar = 0;
  
  // Gera sequência inicial
  for (let i = 0; i < memoriaNivel; i++) {
    memoriaSequencia.push(floor(random(4)));
  }
}

function verificarSequenciaMemoria() {
  // Verifica se o jogador acertou até agora
  for (let i = 0; i < memoriaJogador.length; i++) {
    if (memoriaJogador[i] !== memoriaSequencia[i]) {
      // Errou - reinicia
      iniciarPuzzleMemoria();
      return;
    }
  }
  
  // Se completou a sequência atual
  if (memoriaJogador.length === memoriaSequencia.length) {
    if (memoriaNivel >= 3) { // Completa após 3 níveis
      completarPuzzle();
    } else {
      // Próximo nível
      memoriaNivel++;
      memoriaJogador = [];
      memoriaMostrando = true;
      memoriaTempoMostrar = 0;
      memoriaSequencia.push(floor(random(4))); // Adiciona mais uma cor
    }
  }
}

function completarPuzzle() {
  puzzleResolvido = true;
  dinheiro += frutasColetadas * 10;
  frutasColetadas = 0;
  frutas = [];
  gerarFrutas();
  mercados.shift();
}

// --- Funções e Classes ---

function resetJogo() {
  player = new Player(lojaCarros[carroSelecionadoIndex].speed, lojaCarros[carroSelecionadoIndex].color);
  gerarMercados();
  gerarCarrosInimigos();
  gerarFrutas();
  scrollY = 0;
  frutasColetadas = 0;
  tempoParado = 0;
  paradoNoMercado = false;
  puzzleResolvido = false;
  puzzleTempo = 0;
  puzzleAtivo = null;
}

function gerarMercados() {
  mercados = [];
  let y = -500;
  for (let i = 0; i < 3; i++) {
    let x = random(width / 4 + 30, (width * 3) / 4 - 30);
    mercados.push(new Mercado(x, y));
    y -= random(700, 1200);
  }
}

function gerarCarrosInimigos() {
  carrosInimigos = [];
  let cores = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  for (let i = 0; i < 5; i++) {
    let x = random(width / 4 + 30, (width * 3) / 4 - 30);
    let y = random(-800, -100);
    let cor = cores[i % cores.length];
    carrosInimigos.push(new CarroInimigo(x, y, cor));
  }
}

function gerarFrutas() {
  frutas = [];
  for (let i = 0; i < 20; i++) {
    let x = random(width / 4 + 30, (width * 3) / 4 - 30);
    let y = random(-1500, height + 500);
    frutas.push(new Fruta(x, y));
  }
}

function mostrarDinheiro() {
  fill(255, 255, 0);
  textSize(20);
  textAlign(LEFT);
  text(`Dinheiro: $${dinheiro}`, 20, 30);
}

function mostrarFrutas() {
  fill(255, 100, 100);
  textSize(20);
  textAlign(LEFT);
  text(`Frutas coletadas: ${frutasColetadas}`, 20, 60);
}

function desenharEstradaScroll(scroll) {
  background(50, 50, 50);

  // Faixas das laterais (grama)
  fill(50, 150, 50);
  rect(0, 0, width / 4, height);
  rect((width * 3) / 4, 0, width / 4, height);

  // Estrada central
  fill(80);
  rect(width / 4, 0, (width / 2), height);

  // Faixas amarelas no meio da estrada
  stroke(255, 255, 0);
  strokeWeight(4);
  for (let i = -1000; i < height + 1000; i += 60) {
    let y = (i + scroll) % (height + 60) - 60;
    line(width / 2 - 10, y, width / 2 - 10, y + 30);
    line(width / 2 + 10, y + 30, width / 2 + 10, y + 60);
  }
  noStroke();
}

// --- Classes ---

class Player {
  constructor(speed, color) {
    this.x = width / 2;
    this.y = height - 100;
    this.speed = speed;
    this.width = 40;
    this.height = 70;
    this.color = color;
    this.turboAtivo = false;
    this.turboTimer = 0;
    this.turboCooldown = 3000; // 3s de cooldown
  }

  update() {
    let s = this.speed;
    if (this.turboAtivo && this.turboTimer > 0) {
      s *= 2;
      this.turboTimer -= deltaTime;
      if (this.turboTimer <= 0) {
        this.turboAtivo = false;
        this.turboTimer = 0;
      }
    }

    if (keyIsDown(LEFT_ARROW)) {
      this.x -= s;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += s;
    }
    if (keyIsDown(UP_ARROW)) {
      this.y -= s;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y += s;
    }

    // Limitar dentro da estrada
    this.x = constrain(this.x, width / 4 + this.width / 2, (width * 3) / 4 - this.width / 2);
    this.y = constrain(this.y, height / 2, height - this.height / 2);
  }

  show() {
    push();
    fill(this.turboAtivo ? "orange" : this.color);
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height, 10);
    pop();
  }

  coletou(fruta, scroll) {
    let frutaY = fruta.y + scroll;
    return (
      dist(this.x, this.y, fruta.x, frutaY) < (this.width + fruta.size) / 2
    );
  }

  colidiu(carro, scroll) {
    let carroY = carro.y + scroll;
    return !(
      this.x + this.width / 2 < carro.x - carro.width / 2 ||
      this.x - this.width / 2 > carro.x + carro.width / 2 ||
      this.y + this.height / 2 < carroY - carro.height / 2 ||
      this.y - this.height / 2 > carroY + carro.height / 2
    );
  }

  estaNaArea(mercado, scroll) {
    let mercadoY = mercado.y + scroll;
    return (
      abs(this.x - mercado.x) < mercado.size / 2 + this.width / 2 &&
      abs(this.y - mercadoY) < mercado.size / 2 + this.height / 2
    );
  }

  toggleTurbo() {
    if (!this.turboAtivo && this.turboTimer <= 0) {
      this.turboAtivo = true;
      this.turboTimer = 3000;
    }
  }
}

class CarroInimigo {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 70;
    this.speed = random(3, 6);
    this.color = color;
  }

  update(scroll) {
    this.y += this.speed;
    if (this.y > height + 100) {
      this.y = random(-800, -100);
      this.x = random(width / 4 + 30, (width * 3) / 4 - 30);
      this.speed = random(3, 6);
    }
  }

  show(scroll) {
    push();
    translate(this.x, this.y + scroll);
    fill(this.color);
    rectMode(CENTER);
    rect(0, 0, this.width, this.height, 10);
    pop();
  }
}

class Fruta {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
  }

  update() {
    // As frutas não se movem sozinhas, só o scroll afeta elas
  }

  show(scroll) {
    push();
    translate(this.x, this.y + scroll);
    fill("orange");
    ellipse(0, 0, this.size);
    pop();
  }
}

class Mercado {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 80;
  }

  show(scroll) {
    push();
    translate(this.x, this.y + scroll);
    // Destacar se player estiver próximo
    let distancia = dist(this.x, this.y + scroll, player.x, player.y);
    if (distancia < 80) {
      stroke(255, 255, 0);
      strokeWeight(4);
    } else {
      noStroke();
    }
    fill(200, 100, 50);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size, 10);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Mercado", 0, 0);
    pop();
  }
}

// Função auxiliar para botões simples
function drawButton(x, y, w, h, label, callback) {
  fill(100, 200, 100);
  rect(x, y, w, h, 10);
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);

  if (!botaoClicado && mouseIsPressed && mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    callback();
    botaoClicado = true;
  }
}
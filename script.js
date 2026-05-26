// ================= CANVAS =================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas(){

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

// ================= GAME STATE =================

let gameStarted = false;
let gamePaused = false;
let gameOver = false;

let score = 0;

// ================= WORLD =================

const worldWidth = 3000;
const worldHeight = 2000;

// ================= CAMERA =================

const camera = {

  x:0,
  y:0

};

// ================= AUDIO =================

const bgMusic =
document.getElementById("bgMusic");

const menuMusic =
document.getElementById("menuMusic");

const buttonSound =
document.getElementById("buttonSound");

const coinSound =
new Audio("assets/coin.wav");

const diamondSound =
new Audio("assets/diamond.wav");

const gameOverSound =
new Audio("assets/gameover.mp3");

const heartSound =
new Audio("assets/heart.wav");

// ================= VOLUME =================

bgMusic.volume = 0.5;
menuMusic.volume = 0.5;
buttonSound.volume = 0.7;

coinSound.volume = 0.5;
diamondSound.volume = 0.6;
gameOverSound.volume = 1;

heartSound.volume = 0.3;

// ================= PRELOAD =================

heartSound.preload = "auto";

// ================= MENU MUSIC =================

window.addEventListener("click", ()=>{

  if(!gameStarted){
    menuMusic.play().catch(()=>{});
  }

},{
  once:true
});

// ================= BUTTON SOUND =================

function playButtonSound(){

  buttonSound.currentTime = 0;

  buttonSound.play().catch(()=>{});

}

// ================= CONTROL =================

const keys = {};
// ================= MOBILE CONTROL =================

function setupMobileButton(id,key){

  const btn =
  document.getElementById(id);

  btn.addEventListener(
    "touchstart",
    (e)=>{

      e.preventDefault();

      keys[key] = true;

    }
  );

  btn.addEventListener(
    "touchend",
    ()=>{

      keys[key] = false;

    }
  );

}

setupMobileButton(
  "upBtn",
  "ArrowUp"
);

setupMobileButton(
  "downBtn",
  "ArrowDown"
);

setupMobileButton(
  "leftBtn",
  "ArrowLeft"
);

setupMobileButton(
  "rightBtn",
  "ArrowRight"
);

window.addEventListener("keydown",(e)=>{

  keys[e.key] = true;

  if(
    e.key.toLowerCase() === "p" ||
    e.key === "Escape"
  ){
    togglePause();
  }

  if(

    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight"

  ){

    e.preventDefault();

  }

});

window.addEventListener("keyup",(e)=>{

  keys[e.key] = false;

});

// ================= SAFE IMAGE =================

function createImage(src){

  const img = new Image();

  img.src = src;

  img.onerror = ()=>{

    console.log("Gagal load:", src);

  };

  return img;

}

// ================= ASSET =================

const bgImg =
createImage("assets/bg.png");

const playerImg =
createImage("assets/player.png");

const playerHurtImg =
createImage("assets/player_hurt.png");

const sharkImg =
createImage("assets/sharks.png");

const jellyImg =
createImage("assets/jellyfish.png");

const coinImg =
createImage("assets/coins.png");

const diamondImg =
createImage("assets/diamonds.png");

const heartImg =
createImage("assets/heart.png");

// ================= FISH ASSETS =================

const fishImages = [];

for(let i = 1; i <= 10; i++){

  fishImages.push(

    createImage(`assets/fish${i}.png`)

  );

}

// ================= PLAYER =================

const player = {

  x:500,
  y:500,

  width:80,
  height:80,

  speed:5,

  hp:100,

  facingLeft:false,

  hurt:false,
  hurtTimer:0

};

// ================= OBJECT =================

let sharks = [];
let jellyfish = [];
let coins = [];
let diamonds = [];
let hearts = [];
let fishes = [];

// ================= SPAWN =================

function spawnObjects(){

  // SHARK

  while(sharks.length < 6){

    sharks.push({

      x:Math.random() * (worldWidth - 140),
      y:Math.random() * (worldHeight - 140),

      width:140,
      height:140,

      direction:
      Math.random() > 0.5 ? 1 : -1,

      patrolTimer:0,

      state:"patrol"

    });

  }

  // JELLY

  while(jellyfish.length < 6){

    jellyfish.push({

      x:Math.random() * worldWidth,
      y:Math.random() * worldHeight,

      offset:Math.random() * 1000

    });

  }

  // COINS

  while(coins.length < 15){

    coins.push({

      x:Math.random() * worldWidth,
      y:Math.random() * worldHeight

    });

  }

  // DIAMONDS

  while(diamonds.length < 8){

    diamonds.push({

      x:Math.random() * worldWidth,
      y:Math.random() * worldHeight

    });

  }

  // HEART

  while(hearts.length < 4){

    hearts.push({

      x:Math.random() * worldWidth,
      y:Math.random() * worldHeight

    });

  }

  // FISH

  while(fishes.length < 20){

    fishes.push({

      x:Math.random() * worldWidth,
      y:Math.random() * worldHeight,

      width:60 + Math.random()*40,
      height:40 + Math.random()*20,

      speed:1 + Math.random()*1.5,

      direction:
      Math.random() > 0.5 ? 1 : -1,

      offset:Math.random()*1000,

      image:
      fishImages[
        Math.floor(
          Math.random() * fishImages.length
        )
      ]

    });

  }

}

spawnObjects();

setInterval(spawnObjects,3000);

// ================= PLAYER MOVE =================

function movePlayer(){

  if(keys["ArrowUp"]){

    player.y -= player.speed;

  }

  if(keys["ArrowDown"]){

    player.y += player.speed;

  }

  if(keys["ArrowLeft"]){

    player.x -= player.speed;

    player.facingLeft = true;

  }

  if(keys["ArrowRight"]){

    player.x += player.speed;

    player.facingLeft = false;

  }

  player.x = Math.max(
    0,
    Math.min(
      worldWidth - player.width,
      player.x
    )
  );

  player.y = Math.max(
    0,
    Math.min(
      worldHeight - player.height,
      player.y
    )
  );

}

// ================= SHARK AI =================

function moveSharks(){

  sharks.forEach(s=>{

    const dx = player.x - s.x;
    const dy = player.y - s.y;

    const dist =
    Math.sqrt(dx*dx + dy*dy);

    // ATTACK

    if(dist < 90){

      s.state = "attack";

      const speed = 3.8;

      s.x += (dx / dist) * speed;
      s.y += (dy / dist) * speed;

    }

    // CHASE

    else if(dist < 320){

      s.state = "chase";

      const speed = 2.2;

      s.x += (dx / dist) * speed;
      s.y += (dy / dist) * speed;

    }

    // PATROL

    else{

      s.state = "patrol";

      s.x += 1.1 * s.direction;

      s.y +=
      Math.sin(
        Date.now()*0.001 +
        s.patrolTimer
      ) * 0.4;

      s.patrolTimer += 0.01;

      if(s.x <= 0){

        s.direction = 1;

      }

      if(s.x >= worldWidth - s.width){

        s.direction = -1;

      }

    }

    if(dx < 0){

      s.direction = -1;

    }else{

      s.direction = 1;

    }

  });

}

// ================= JELLY =================

function moveJellyfish(){

  jellyfish.forEach(j=>{

    j.y +=
    Math.sin(Date.now()*0.002 + j.offset)
    * 0.3;

  });

}

// ================= FISH =================

function moveFish(){

  fishes.forEach(f=>{

    f.x += f.speed * f.direction;

    f.y +=
    Math.sin(Date.now()*0.002 + f.offset)
    * 0.2;

    if(f.x <= 0){

      f.direction = 1;

    }

    if(f.x >= worldWidth - f.width){

      f.direction = -1;

    }

  });

}

// ================= COLLISION =================

function checkCollision(a,b,size){

  return(

    Math.abs(a.x - b.x) < size &&
    Math.abs(a.y - b.y) < size

  );

}

// ================= DAMAGE TIMER =================

let lastJellyHit = 0;
const jellyHitCooldown = 700;

// ================= GAME OVER =================

function triggerGameOver(){

  if(gameOver) return;

  gameOver = true;

  gamePaused = true;

  bgMusic.pause();

  gameOverSound.currentTime = 0;

  document.getElementById(
    "gameOverScreen"
  ).style.display = "flex";

  document.getElementById(
  "finalScore"
).innerText =
"Final Score : " + score;

  gameOverSound.play().catch(()=>{});

}

// ================= UPDATE =================

function update(){

  if(!gameStarted) return;
  if(gamePaused) return;
  if(gameOver) return;

  movePlayer();
  moveSharks();
  moveJellyfish();
  moveFish();

  // CAMERA

  camera.x =
  player.x - canvas.width/2;

  camera.y =
  player.y - canvas.height/2;

  camera.x = Math.max(
    0,
    Math.min(
      worldWidth - canvas.width,
      camera.x
    )
  );

  camera.y = Math.max(
    0,
    Math.min(
      worldHeight - canvas.height,
      camera.y
    )
  );

  // SHARK

  sharks.forEach(s=>{

    if(checkCollision(player,s,70)){

      triggerGameOver();

    }

  });

  // JELLY

  jellyfish.forEach(j=>{

    if(checkCollision(player,j,45)){

      if(

        Date.now() - lastJellyHit >
        jellyHitCooldown

      ){

        player.hp -= 10;

        player.hurt = true;
        player.hurtTimer = 20;

        lastJellyHit = Date.now();

      }

    }

  });

  // HURT TIMER

  if(player.hurt){

    player.hurtTimer--;

    if(player.hurtTimer <= 0){

      player.hurt = false;

    }

  }

  // HEART

  hearts = hearts.filter(h=>{

    if(checkCollision(player,h,40)){

      player.hp += 5;

      if(player.hp > 100){

        player.hp = 100;

      }

      // SOUND EFFECT

      heartSound.currentTime = 0;

      heartSound.play().catch(()=>{});

      return false;

    }

    return true;

  });

  // COINS

  coins = coins.filter(c=>{

    if(checkCollision(player,c,40)){

      score += 10;

      coinSound.currentTime = 0;

      coinSound.play().catch(()=>{});

      return false;

    }

    return true;

  });

  // DIAMONDS

  diamonds = diamonds.filter(d=>{

    if(checkCollision(player,d,40)){

      score += 25;

      diamondSound.currentTime = 0;

      diamondSound.play().catch(()=>{});

      return false;

    }

    return true;

  });

  // HP

  if(player.hp <= 0){

    triggerGameOver();

  }

  // UI

  document.getElementById("hp").innerText =
  Math.floor(player.hp);

  document.getElementById("score").innerText =
  score;

  updateBubbles();
}

// ================= SAFE DRAW =================

function drawImageSafe(
  img,
  x,
  y,
  w,
  h,
  flip=false
){

  if(

    !img ||
    !img.complete ||
    img.naturalWidth === 0

  ){

    return;

  }

  ctx.save();

  if(flip){

    ctx.scale(-1,1);

    ctx.drawImage(

      img,

      -x - w,
      y,

      w,
      h

    );

  }else{

    ctx.drawImage(

      img,

      x,
      y,

      w,
      h

    );

  }

  ctx.restore();

}

// ================= DRAW =================

function draw(){

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // BACKGROUND

  drawImageSafe(

    bgImg,

    -camera.x * 0.2,
    -camera.y * 0.2,

    worldWidth,
    worldHeight

  );

  // FISH

  fishes.forEach(f=>{

    drawImageSafe(

      f.image,

      f.x - camera.x,
      f.y - camera.y,

      f.width,
      f.height,

      f.direction < 0

    );

  });

   drawBubbles();

  // PLAYER

  let currentPlayerImage =
  player.hurt
  ? playerHurtImg
  : playerImg;

  drawImageSafe(

    currentPlayerImage,

    player.x - camera.x,
    player.y - camera.y,

    player.width,
    player.height,

    player.facingLeft

  );

  // SHARK

  sharks.forEach(s=>{

    drawImageSafe(

      sharkImg,

      s.x - camera.x,
      s.y - camera.y,

      s.width,
      s.height,

      s.direction < 0

    );

  });

  // JELLY

  jellyfish.forEach(j=>{

    drawImageSafe(

      jellyImg,

      j.x - camera.x,
      j.y - camera.y,

      50,
      50

    );

  });

  // HEART

  hearts.forEach(h=>{

    drawImageSafe(

      heartImg,

      h.x - camera.x,
      h.y - camera.y,

      40,
      40

    );

  });

  // COINS

  coins.forEach(c=>{

    drawImageSafe(

      coinImg,

      c.x - camera.x,
      c.y - camera.y,

      35,
      35

    );

  });

  // DIAMONDS

  diamonds.forEach(d=>{

    drawImageSafe(

      diamondImg,

      d.x - camera.x,
      d.y - camera.y,

      40,
      40

    );

  });

}

// ================= BUBBLE =================

const bubbles = [];

for(let i = 0; i < 40; i++){

  bubbles.push({

    x:Math.random() * worldWidth,
    y:Math.random() * worldHeight,

    size:2 + Math.random()*6,

    speed:0.5 + Math.random()*1

  });

}

function updateBubbles(){

  bubbles.forEach(b=>{

    b.y -= b.speed;

    if(b.y < 0){

      b.y = worldHeight;

      b.x = Math.random() * worldWidth;

    }

  });

}

function drawBubbles(){

  bubbles.forEach(b=>{

    ctx.beginPath();

    ctx.arc(

      b.x - camera.x,
      b.y - camera.y,

      b.size,

      0,
      Math.PI * 2

    );

    ctx.fillStyle =
    "rgba(255,255,255,0.3)";

    ctx.fill();

  });

}

// ================= LOOP =================

function gameLoop(){

  update();
  draw();

  requestAnimationFrame(gameLoop);

}

gameLoop();

// ================= BUTTON =================

window.startGame = function(){

  playButtonSound();

  gameStarted = true;

  menuMusic.pause();

  document.getElementById(
    "startScreen"
  ).style.display = "none";

  document.getElementById(
    "pauseBtn"
  ).style.display = "block";

  bgMusic.play().catch(()=>{});

};

window.openSettings = function(){

  playButtonSound();

  document.getElementById(
    "settingsPanel"
  ).classList.remove("hidden");

};

window.closeSettings = function(){

  playButtonSound();

  document.getElementById(
    "settingsPanel"
  ).classList.add("hidden");

};

// ================= MUSIC VOLUME =================

window.setMusicVolume = function(v){

  bgMusic.volume = v;
  menuMusic.volume = v;

};

// ================= EFFECT VOLUME =================

window.setEffectVolume = function(v){

  buttonSound.volume = v;

  coinSound.volume = v;

  diamondSound.volume = v;

  heartSound.volume = v;

  gameOverSound.volume = v;

};

window.togglePause = function(){

  playButtonSound();

  if(!gameStarted) return;
  if(gameOver) return;

  gamePaused = !gamePaused;

  const menu =
  document.getElementById("pauseMenu");

  if(gamePaused){

    menu.classList.remove("hidden");

    bgMusic.pause();

  }else{

    menu.classList.add("hidden");

    bgMusic.play().catch(()=>{});

  }

};

window.restartGame = function(){

  playButtonSound();

  location.reload();

};

window.backToMenu = function(){

  playButtonSound();

  // RESET GAME STATE
  gamePaused = false;
  gameStarted = false;
  gameOver = false;

  // RESET SCORE
  score = 0;

  // RESET PLAYER
  player.hp = 100;

  player.x = 500;
  player.y = 500;

  player.hurt = false;
  player.hurtTimer = 0;

  // RESET OBJECT
  coins = [];
  diamonds = [];
  hearts = [];
  sharks = [];
  jellyfish = [];
  fishes = [];

  // SPAWN ULANG
  spawnObjects();

  // RESET UI
  document.getElementById("hp").innerText = 100;
  document.getElementById("score").innerText = 0;

  // AUDIO
  bgMusic.pause();

  menuMusic.currentTime = 0;
  menuMusic.play().catch(()=>{});

  // HIDE PANEL
  document.getElementById(
    "pauseMenu"
  ).classList.add("hidden");

  document.getElementById(
    "gameOverScreen"
  ).style.display = "none";

  document.getElementById(
    "startScreen"
  ).style.display = "flex";

  document.getElementById(
    "pauseBtn"
  ).style.display = "none";

};
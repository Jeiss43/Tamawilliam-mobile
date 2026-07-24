/**
 * TAMAWILLIAM - Le Tamagotchi Ardéchois Parodique (GameBoy Color Edition)
 * William Edition - V6 Bal de Coucouron & Cinématique Caillette
 */

// --- SAFE DOM SELECTORS ---
function safeGet(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[Tamawilliam] Element avec ID '${id}' introuvable dans le DOM.`);
  }
  return el;
}

function safeAddListener(id, event, cb) {
  const el = safeGet(id);
  if (el) {
    el.addEventListener(event, cb);
  }
}

// --- AUDIO SYNTHESIZER (Web Audio API) ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.activeOscillators = [];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  beep(freq = 800, duration = 0.1, type = 'square', volume = 0.1) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  stopMusic() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch(e) {}
    });
    this.activeOscillators = [];
  }

  playFerrat() {
    this.init();
    if (!this.ctx) return;
    this.stopMusic();
    
    // Refrain exact 16-bit SNES : "Pourtant que la montagne est belle"
    const tempo = 120;
    const b = 60 / tempo; 
    
    const ferratNotes16bit = [
      { f: 659.25, d: b },       // Pour- (Mi5)
      { f: 783.99, d: b },       // tant (Sol5)
      { f: 880.00, d: b },       // que (La5)
      { f: 880.00, d: b },       // la (La5)
      { f: 987.77, d: b },       // mon- (Si5)
      { f: 1046.50, d: b },      // tagne (Do6)
      { f: 1174.66, d: b },      // est (Ré6)
      { f: 1046.50, d: b * 2 },  // bel- (Do6)
      { f: 987.77, d: b * 2 }    // le (Si5)
    ];

    let time = this.ctx.currentTime + 0.05;
    ferratNotes16bit.forEach(note => {
      try {
        // Lead 16-bit Pulse
        const oscLead = this.ctx.createOscillator();
        const gainLead = this.ctx.createGain();
        oscLead.type = 'square';
        oscLead.frequency.setValueAtTime(note.f, time);
        
        gainLead.gain.setValueAtTime(0.12, time);
        gainLead.gain.exponentialRampToValueAtTime(0.001, time + note.d - 0.04);
        oscLead.connect(gainLead);
        gainLead.connect(this.ctx.destination);
        oscLead.start(time);
        oscLead.stop(time + note.d);
        this.activeOscillators.push(oscLead);

        // Accord synth 16-bit
        const oscChord = this.ctx.createOscillator();
        const gainChord = this.ctx.createGain();
        oscChord.type = 'sawtooth';
        oscChord.frequency.setValueAtTime(note.f * 1.25, time);
        gainChord.gain.setValueAtTime(0.04, time);
        gainChord.gain.exponentialRampToValueAtTime(0.001, time + note.d - 0.04);
        oscChord.connect(gainChord);
        gainChord.connect(this.ctx.destination);
        oscChord.start(time);
        oscChord.stop(time + note.d);
        this.activeOscillators.push(oscChord);

        // Basse 16-bit
        const oscBass = this.ctx.createOscillator();
        const gainBass = this.ctx.createGain();
        oscBass.type = 'triangle';
        oscBass.frequency.setValueAtTime(note.f / 4, time);
        gainBass.gain.setValueAtTime(0.18, time);
        gainBass.gain.exponentialRampToValueAtTime(0.001, time + note.d - 0.04);
        oscBass.connect(gainBass);
        gainBass.connect(this.ctx.destination);
        oscBass.start(time);
        oscBass.stop(time + note.d);
        this.activeOscillators.push(oscBass);

        time += note.d;
      } catch(e) {}
    });
  }

  playError() {
    this.beep(160, 0.18, 'sawtooth', 0.12);
    setTimeout(() => this.beep(110, 0.22, 'sawtooth', 0.12), 150);
  }

  playSuccess() {
    this.beep(523, 0.08, 'square', 0.08);
    setTimeout(() => this.beep(659, 0.08, 'square', 0.08), 80);
    setTimeout(() => this.beep(784, 0.08, 'square', 0.08), 160);
    setTimeout(() => this.beep(1046, 0.25, 'square', 0.08), 240);
  }

  playTextLetter() {
    this.beep(1200, 0.02, 'sine', 0.02);
  }

  playVomitSound() {
    this.init();
    if (!this.ctx) return;
    let time = this.ctx.currentTime + 0.05;
    // Bruit de vomissement 8-bit (gargouillis + pitch drop)
    for (let i = 0; i < 6; i++) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const startFreq = 350 - (i % 2) * 80;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.linearRampToValueAtTime(70, time + 0.3);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.linearRampToValueAtTime(0.001, time + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.3);
        time += 0.25;
      } catch (e) {}
    }
  }
}

const sound = new SoundController();

// --- STATE MANAGEMENT ---
const state = {
  // Démarre à 40% (exigence client)
  food: 40,       
  drink: 40,      
  ferrat: 40,     
  health: 40,    
  distance: 100.0, 
  
  isPoisoned: false, 
  isDrunk: false,    
  isSleeping: false,
  
  gameActive: false,
  introPage: 0,
  gameOver: false,
  gameWon: false,
  showStatusScreen: false,
  statusPageIndex: 0,
  deathCause: '',
  
  // Événements personnalisés
  customEventAnimation: null,
  customEventTimer: 0,
  customEventText: "",
  
  // Cinématique flash de nourriture
  foodFlashActive: false,
  foodFlashTimer: 0,
  foodFlashType: 'A', // 'A' ou 'D'
  
  // Animations actions
  healAnimationActive: false,
  healAnimationTimer: 0,
  sleepAnimationActive: false,
  sleepAnimationTimer: 0,
  coffeeAnimationActive: false,
  coffeeAnimationTimer: 0,
  ferratAnimationActive: false,
  ferratAnimationTimer: 0,
  poopForestActive: false,
  poopForestTimer: 0,
  needsThermesClean: false,
  walkCooldownTimer: 60, // au moins 1s de marche après animation avant tout événement
  actionTextActive: false,

  eatAnimationActive: false,
  eatAnimationTimer: 0,
  eatAnimationType: 'A',
  drinkAnimationActive: false,
  drinkAnimationTimer: 0,

  cailletteActive: false,
  cailletteType: 'A', 
  
  eventPool: [],
  secondsSinceLastAction: 0,
  pendingCustomEvent: null,
  
  skyScroll: 0,
  mountainScroll: 0,
  groundScroll: 0,

  eventActive: false,
  eventText: "",
  eventTypedText: "",
  eventCharIndex: 0,
  eventIcon: "🐗",
  eventFlash: 0,
  eventFrame: 0,

  frame: 0,
  dialogText: "",
  dialogTimer: 0,
};

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 240;

const canvas = safeGet('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const lcdDialog = safeGet('lcd-dialog');
const choiceOverlay = safeGet('choice-overlay');
const powerLight = safeGet('power-light');

if (canvas && ctx) {
  ctx.imageSmoothingEnabled = false;
}

// Déterminer la vitesse de marche globale de William (synchronisée écran / distance)
function getWalkSpeed() {
  if (!state.gameActive || state.gameOver || state.gameWon || state.isSleeping) return 0;

  const isAnyAnimationActive = state.eventActive || state.foodFlashActive || state.vomitActive || state.poopForestActive || state.healAnimationActive || state.sleepAnimationActive || state.coffeeAnimationActive || state.ferratAnimationActive || state.eatAnimationActive || state.drinkAnimationActive || state.customEventAnimation;
  const isBusy = isAnyAnimationActive || state.cailletteActive;
  if (isBusy) return 0;

  let speed = 0.8;
  if (state.isDrunk) {
    speed = Math.random() > 0.45 ? 0.25 : -0.25;
  }
  if (state.isPoisoned) {
    speed *= 0.5;
  }
  if (state.health <= 20 || state.food <= 15 || state.drink <= 15) {
    speed *= 0.5;
  }
  return speed;
}

const COLORS = {
  skin: '#ffd1a9',
  whiteHair: '#ffffff',
  shirt: '#1d3557',
  pants: '#457b9d',
  bgSky: '#a8dadc',
  bgGrass: '#2a9d8f',
  cailletteArdeche: '#e76f51',
  cailletteDrome: '#9b2226',
  dromeDevil: '#e63946'
};

document.addEventListener('click', () => {
  sound.init();
});

// Dessiner William
function drawWilliam(x, y, scale = 2.5, frame = 0) {
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  let bob = 0;
  if (!state.isSleeping && !state.gameOver) {
    bob = Math.floor(Math.sin(frame * 0.15) * 1.5);
  }

  // CHEVEUX BLANCS ÉBOURIFFÉS
  ctx.fillStyle = COLORS.whiteHair;
  ctx.fillRect(4, 0 + bob, 10, 4);
  ctx.fillRect(3, 1 + bob, 12, 4);
  ctx.fillRect(3, -1 + bob, 2, 2);
  ctx.fillRect(6, -2 + bob, 2, 2);
  ctx.fillRect(9, -2 + bob, 2, 2);
  ctx.fillRect(12, -1 + bob, 2, 2);

  // VISAGE
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(5, 3 + bob, 8, 7);
  ctx.fillRect(4, 5 + bob, 10, 4);

  // Yeux et bouche
  ctx.fillStyle = '#000000';
  if (state.gameOver) {
    ctx.fillRect(5, 5 + bob, 2, 1);
    ctx.fillRect(11, 5 + bob, 2, 1);
    ctx.fillStyle = '#d90429';
    ctx.fillRect(6, 8 + bob, 6, 1);
  } else if (state.isSleeping) {
    ctx.fillRect(5, 6 + bob, 2, 1);
    ctx.fillRect(11, 6 + bob, 2, 1);
    ctx.fillRect(7, 8 + bob, 4, 1);
  } else if (state.isDrunk) {
    if (frame % 8 < 4) {
      ctx.fillRect(5, 5 + bob, 1, 2);
      ctx.fillRect(11, 6 + bob, 1, 2);
    } else {
      ctx.fillRect(5, 6 + bob, 1, 2);
      ctx.fillRect(11, 5 + bob, 1, 2);
    }
    ctx.fillRect(6, 8 + bob, 5, 1);
    ctx.fillRect(10, 7 + bob, 1, 1);
  } else {
    ctx.fillRect(5, 5 + bob, 2, 1); 
    ctx.fillRect(11, 5 + bob, 2, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(8, 6 + bob, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, 8 + bob, 6, 1);
    ctx.fillRect(11, 7 + bob, 1, 1);
  }

  // CHEMISE BLEUE
  ctx.fillStyle = COLORS.shirt;
  ctx.fillRect(3, 10, 12, 6);
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(8, 10, 2, 2);

  // PANTALON
  ctx.fillStyle = COLORS.pants;
  ctx.fillRect(4, 16, 10, 4);

  // PIEDS / PAS DE MARCHE
  ctx.fillStyle = '#222';
  const currentSpeed = getWalkSpeed();
  if (currentSpeed !== 0) {
    const step = Math.floor(frame / 6) % 2;
    if (step === 0) {
      ctx.fillRect(4, 20, 2, 2); 
      ctx.fillRect(11, 20, 2, 1);
    } else {
      ctx.fillRect(4, 20, 2, 1);
      ctx.fillRect(11, 20, 2, 2); 
    }
  } else {
    ctx.fillRect(4, 20, 2, 2);
    ctx.fillRect(11, 20, 2, 2);
  }

  ctx.restore();
}

// Dessiner William et 2 amis dansant au Bal de Coucouron
function drawBalDeCoucouron(frame) {
  if (!ctx) return;
  // Fond noir festif de nuit avec flash de stroboscope
  ctx.fillStyle = '#0b0b14';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Guirlandes lumineuses colorées en haut
  const colors = ['#e63946', '#ffb703', '#2a9d8f', '#a8dadc', '#e76f51', '#9b5de5', '#f15bb5'];
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = colors[(i + Math.floor(frame / 6)) % colors.length];
    ctx.beginPath();
    ctx.arc(20 + i * 32, 20 + Math.sin(frame * 0.15 + i) * 6, 6, 0, Math.PI * 2);
    ctx.fill();
    // Fil de guirlande
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    if (i < 9) {
      ctx.beginPath();
      ctx.moveTo(20 + i * 32, 20 + Math.sin(frame * 0.15 + i) * 6);
      ctx.lineTo(20 + (i + 1) * 32, 20 + Math.sin(frame * 0.15 + (i + 1)) * 6);
      ctx.stroke();
    }
  }

  // Sol de piste de danse rétro phosphorescent
  ctx.fillStyle = Math.floor(frame / 8) % 2 === 0 ? '#1d3557' : '#14213d';
  ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

  // Confettis colorés qui tombent
  for (let j = 0; j < 18; j++) {
    ctx.fillStyle = colors[(j + frame) % colors.length];
    const cy = (j * 18 + frame * 2) % 160;
    const cx = (j * 22 + Math.sin(frame * 0.08 + j) * 18) % CANVAS_WIDTH;
    ctx.fillRect(cx, cy, 3, 3);
  }

  // Les danseurs
  // Ami 1 à gauche (trinque avec un verre de Marquisette)
  ctx.save();
  let bob1 = Math.floor(Math.sin(frame * 0.2) * 5);
  ctx.fillStyle = '#f4a261'; // Corps orange
  ctx.fillRect(40, 100 + bob1, 25, 40);
  ctx.fillStyle = COLORS.skin; // Tête
  ctx.fillRect(45, 80 + bob1, 15, 20);
  ctx.fillStyle = '#000'; // Cheveux
  ctx.fillRect(43, 75 + bob1, 19, 8);
  // Verre de Marquisette dans la main
  ctx.fillStyle = '#e63946'; // Marquisette rouge pétillant
  ctx.fillRect(66, 95 + bob1, 8, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(65, 93 + bob1, 10, 2);
  ctx.restore();

  // William au centre (danse frénétique + boit de la Marquisette !)
  let bobW = Math.floor(Math.cos(frame * 0.3) * 6);
  drawWilliam(135, 85 + bobW, 3, frame);

  // Bouteille & verre de Marquisette dans la main de William !
  ctx.save();
  const drinkArmY = 110 + bobW + Math.sin(frame * 0.2) * 6;
  // Bouteille de Marquisette géante
  ctx.fillStyle = '#2a9d8f'; // Verre de bouteille
  ctx.fillRect(172, drinkArmY - 10, 10, 25);
  ctx.fillStyle = '#e63946'; // Étiquette / Marquisette
  ctx.fillRect(174, drinkArmY - 4, 6, 12);
  ctx.fillStyle = '#ffb703'; // Bouchon doré
  ctx.fillRect(175, drinkArmY - 14, 4, 4);

  // Gouttes / Bulles de Marquisette festives qui giclent en l'air 🍾✨
  ctx.fillStyle = '#e63946';
  for (let b = 0; b < 6; b++) {
    const bx = 175 + Math.sin(frame * 0.2 + b) * 12;
    const by = drinkArmY - 18 - ((frame * 2 + b * 15) % 40);
    ctx.fillRect(bx, by, 3, 3);
  }
  ctx.restore();

  // Ami 2 à droite (danse en tenant une chopine)
  ctx.save();
  let bob2 = Math.floor(Math.sin(frame * 0.2 + Math.PI) * 5); // Opposition
  ctx.fillStyle = '#2a9d8f'; // Corps vert
  ctx.fillRect(240, 100 + bob2, 25, 40);
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(245, 80 + bob2, 15, 20);
  ctx.fillStyle = '#e76f51'; // Cheveux roux
  ctx.fillRect(243, 75 + bob2, 19, 8);
  // Verre Marquisette
  ctx.fillStyle = '#e63946';
  ctx.fillRect(230, 95 + bob2, 8, 12);
  ctx.restore();

  // Pancarte "BAL DE COUCOURON"
  ctx.fillStyle = '#ffb703';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.fillRect(40, 20, 240, 30);
  ctx.strokeRect(40, 20, 240, 30);
  
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("BAL DE COUCOURON 🍾", Math.round(CANVAS_WIDTH / 2), 35);
  ctx.textBaseline = 'alphabetic'; // reset

  // Message de félicitation humoristique en bas
  ctx.fillStyle = 'rgba(11, 11, 20, 0.95)';
  ctx.strokeStyle = '#ffb703';
  ctx.lineWidth = 2;
  ctx.fillRect(10, 150, CANVAS_WIDTH - 20, 82);
  ctx.strokeRect(10, 150, CANVAS_WIDTH - 20, 82);

  ctx.fillStyle = '#ffb703';
  ctx.font = 'bold 10px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText("🏆 VICTOIRE ARDECHOISE ! 🏆", Math.round(CANVAS_WIDTH / 2), 168);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText("William danse & boit de la Marquisette au Bal !", Math.round(CANVAS_WIDTH / 2), 185);
  ctx.fillText("Il a terrassé la caillette drômoise & la Burle !", Math.round(CANVAS_WIDTH / 2), 198);
  ctx.fillText("La fête bat son plein à Coucouron ! 🍾🎶", Math.round(CANVAS_WIDTH / 2), 211);
  
  ctx.fillStyle = '#e9c46a';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText("APPUYEZ SUR ENTREE POUR REJOUER", Math.round(CANVAS_WIDTH / 2), 226);
}

function drawCailletteFlash(frame) {
  if (!ctx) return;
  resetCanvasFilter();

  const isArdeche = state.foodFlashType === 'A';

  // Arrière-plan coloré stylisé selon le type
  ctx.fillStyle = isArdeche ? '#1b4332' : '#5c0d12';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Clignotement de l'arrière-plan
  if (Math.floor(frame / 4) % 2 === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
  }

  // Plat géant au centre
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Contenu du plat (Caillette)
  ctx.fillStyle = isArdeche ? COLORS.cailletteArdeche : COLORS.cailletteDrome;
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10, 40, 0, Math.PI * 2);
  ctx.fill();

  // Lettre stylisée A ou D géante
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isArdeche ? 'A' : 'D', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);

  // BANNIÈRE TITRE TRÈS LISIBLE EN HAUT
  ctx.fillStyle = isArdeche ? '#2a9d8f' : '#e63946';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.fillRect(15, 12, CANVAS_WIDTH - 30, 32);
  ctx.strokeRect(15, 12, CANVAS_WIDTH - 30, 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (isArdeche) {
    ctx.fillText("CAILLETTE ARDECHE (A) 🥩", CANVAS_WIDTH / 2, 28);
  } else {
    ctx.fillText("CAILLETTE DROME (D) ☣️", CANVAS_WIDTH / 2, 28);
  }
}

// --- GESTION DU FLOU ET DU TEXTE EN HAUT À GAUCHE ---
function drawTopLeftBadge(text) {
  if (!ctx) return;
  ctx.save();
  ctx.filter = 'none'; // Les écritures restent 100% nettes et lisibles
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = Math.max(175, textWidth + 14);

  ctx.fillStyle = 'rgba(11, 11, 20, 0.9)';
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(8, 8, badgeWidth, 24, 6);
  } else {
    ctx.rect(8, 8, badgeWidth, 24);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 14, 20);
  ctx.restore();
}

function applyCanvasBlurFilter() {
  if (!ctx) return;
  if (state.isDrunk || state.drink > 50) {
    const blurPx = state.drink > 90 ? 4 : (state.drink > 70 ? 2.5 : 1.2);
    ctx.filter = `blur(${blurPx}px) contrast(105%)`;
  } else {
    ctx.filter = 'none';
  }
}

function resetCanvasFilter() {
  if (!ctx) return;
  ctx.filter = 'none';
}

// Dessiner le décor défilant
function drawNormalGame() {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  
  applyCanvasBlurFilter();
  drawBackground();
  
  let wx = 140;
  let wy = 135;
  if (state.isDrunk) {
    wx += Math.sin(state.frame * 0.08) * 20;
  }
  drawWilliam(wx, wy, 3, state.frame);

  if (state.isSleeping) {
    resetCanvasFilter();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    const zs = "Z".repeat((Math.floor(state.frame / 8) % 3) + 1);
    ctx.fillText(zs, 210, 130 - (Math.floor(state.frame / 8) % 3) * 4);
  } else if (state.dialogTimer > 0 && (state.dialogText.includes("montagne") || state.dialogText.includes("Banana"))) {
    resetCanvasFilter();
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText("🎵", 200, 110 + Math.sin(state.frame * 0.1) * 4);
    ctx.fillText("🎶", 230, 130 + Math.cos(state.frame * 0.1) * 4);
  }

  drawTopLeftBadge(`${state.distance.toFixed(1)} km restants`);
}

// Dessiner des bulles et le scrolling du décor
function drawBackground() {
  if (!ctx) return;
  // 1. CIEL & NUAGES
  ctx.fillStyle = COLORS.bgSky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const nuageOffset = Math.floor(state.skyScroll) % CANVAS_WIDTH;
  ctx.fillRect(40 - nuageOffset, 15, 60, 10);
  ctx.fillRect(50 - nuageOffset, 10, 40, 20);
  ctx.fillRect(10 - nuageOffset + CANVAS_WIDTH, 15, 60, 10);
  ctx.fillRect(20 - nuageOffset + CANVAS_WIDTH, 10, 40, 20);

  // 2. MONTAGNES
  ctx.fillStyle = '#457b9d';
  const mOffset = Math.floor(state.mountainScroll) % CANVAS_WIDTH;
  for (let copy = 0; copy < 2; copy++) {
    const shift = (copy * CANVAS_WIDTH) - mOffset;
    ctx.beginPath();
    ctx.moveTo(shift + 0, 160);
    ctx.lineTo(shift + 80, 90);  
    ctx.lineTo(shift + 150, 160);
    ctx.lineTo(shift + 220, 80);  
    ctx.lineTo(shift + 290, 160);
    ctx.lineTo(shift + 320, 130);
    ctx.lineTo(shift + 320, 160);
    ctx.fill();
  }

  // 3. SOL HERBEUX
  ctx.fillStyle = COLORS.bgGrass;
  ctx.fillRect(0, 150, CANVAS_WIDTH, 90);

  ctx.fillStyle = '#1e7b65';
  const gOffset = Math.floor(state.groundScroll) % CANVAS_WIDTH;
  for (let i = 0; i < 6; i++) {
    const hx = ((i * 70) - gOffset + CANVAS_WIDTH) % CANVAS_WIDTH;
    ctx.fillRect(hx, 165, 4, 2);
    ctx.fillRect(hx + 10, 172, 3, 2);
    ctx.fillRect((hx + 35) % CANVAS_WIDTH, 220, 5, 2);
  }

  // 4. CHEMIN
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(0, 185, CANVAS_WIDTH, 30);
  
  ctx.fillStyle = '#b58d3d';
  for (let j = 0; j < 8; j++) {
    const cx = ((j * 60) - gOffset + CANVAS_WIDTH) % CANVAS_WIDTH;
    ctx.fillRect(cx, 186, 12, 1);
    ctx.fillRect((cx + 30) % CANVAS_WIDTH, 214, 15, 1);
  }
}

// Mettre à jour les jauges et les filtres d'ivresse basés sur l'hydratation
function updateDashboardAndEffects() {
  const fFood = safeGet('fill-food');
  const fDrink = safeGet('fill-drink');
  const fMoral = safeGet('fill-moral');
  const fHealth = safeGet('fill-health');

  if (fFood) fFood.style.width = `${state.food}%`;
  if (fDrink) fDrink.style.width = `${state.drink}%`;
  if (fMoral) fMoral.style.width = `${state.ferrat}%`;
  if (fHealth) fHealth.style.width = `${state.health}%`;

  if (powerLight) {
    if (state.health < 30 || state.isPoisoned) {
      powerLight.style.backgroundColor = '#ff0000';
      powerLight.style.boxShadow = '0 0 10px #ff0000';
    } else {
      powerLight.style.backgroundColor = '#00ff66';
      powerLight.style.boxShadow = '0 0 10px #00ff66';
    }
  }

  // LE FLOU TIENT COMPTE DU POURCENTAGE D'HYDRATATION (state.drink)
  const screenEl = safeGet('game-canvas');
  if (screenEl) {
    screenEl.classList.remove('drunk-50', 'drunk-70', 'drunk-90');
    
    // Si l'hydratation (state.drink) dépasse les seuils critiques (grâce à la Marquisette)
    if (state.drink > 90) {
      screenEl.classList.add('drunk-90');
      state.isDrunk = true;
    } else if (state.drink > 70) {
      screenEl.classList.add('drunk-70');
      state.isDrunk = true;
    } else if (state.drink > 50) {
      screenEl.classList.add('drunk-50');
      state.isDrunk = true;
    } else {
      state.isDrunk = false;
    }
  }
}

// --- LOGIQUE DE SÉQUENCE D'ÉVÉNEMENT ANIMÉE ---
function initAnimatedEvent(text, icon = "🐗") {
  state.eventActive = true;
  state.eventText = text;
  state.eventTypedText = "";
  state.eventCharIndex = 0;
  state.eventIcon = icon;
  state.eventFlash = 10; 
  state.eventFrame = 0;
  sound.beep(800, 0.25, 'sawtooth', 0.12);
  hideDialog();
}

function updateAnimatedEvent() {
  state.eventFrame++;
  if (state.eventFlash > 0) {
    state.eventFlash--;
  } else if (state.eventCharIndex < state.eventText.length) {
    if (state.eventFrame % 2 === 0) {
      state.eventTypedText += state.eventText[state.eventCharIndex];
      state.eventCharIndex++;
      sound.playTextLetter();
    }
  }
}

function drawAnimatedEvent() {
  if (!ctx) return;
  resetCanvasFilter();
  if (state.eventFlash > 0 && state.eventFlash % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    return;
  }

  ctx.fillStyle = '#2b2d42';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, 70);
  const scale = 2.5 + Math.sin(state.eventFrame * 0.1) * 0.4;
  ctx.scale(scale, scale);
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.eventIcon, 0, 0);
  ctx.restore();

  ctx.fillStyle = '#1d3557';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.fillRect(15, 140, 290, 85);
  ctx.strokeRect(15, 140, 290, 85);

  ctx.fillStyle = '#ffffff';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const words = state.eventTypedText.split(" ");
  let line = "";
  let y = 148; // Commence plus haut
  words.forEach(word => {
    if ((line + word).length * 8 > 250) {
      ctx.fillText(line, 25, y);
      line = word + " ";
      y += 12; // interligne plus compact
    } else {
      line += word + " ";
    }
  });
  ctx.fillText(line, 25, y);

  if (state.eventCharIndex >= state.eventText.length) {
    if (Math.floor(state.eventFrame / 15) % 2 === 0) {
      ctx.save();
      ctx.fillStyle = '#e9c46a';
      ctx.font = '7px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText("PRESSEZ A POUR CONTINUER", CANVAS_WIDTH / 2, 221);
      ctx.restore();
    }
  }
}

// --- RENDER CLASSIQUE ---
function drawStatusScreen() {
  if (!ctx) return;
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#ffffff';
  ctx.font = '9px "Press Start 2P"';

  if (state.statusPageIndex === 0) {
    ctx.fillText("=== STATS (1/2) ===", 30, 30);
    ctx.fillText(`FAIM      : ${Math.floor(state.food)}/100`, 30, 70);
    ctx.fillText(`HYDRAT.   : ${Math.floor(state.drink)}/100`, 30, 100);
    ctx.fillText(`MORAL     : ${Math.floor(state.ferrat)}/100`, 30, 130);
    ctx.fillText(`SANTE     : ${Math.floor(state.health)}/100`, 30, 160);
  } else {
    ctx.fillText("=== STATS (2/2) ===", 30, 30);
    ctx.fillText(`COUCOURON :`, 30, 70);
    ctx.fillText(`${state.distance.toFixed(1)} KM RESTANTS`, 40, 95);
    ctx.fillText(`SANTE :`, 30, 135);
    ctx.fillText(state.isPoisoned ? "EMPOISONNE (DROME)" : "SAIN (ARDECHOIS)", 40, 160);
  }
  ctx.fillText("SELECT: Retour", 30, 210);
}

// Animation Cure Thermale ⛲
function drawHealScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#457b9d';
  for (let i = 0; i < 4; i++) {
    const waveY = 120 + Math.sin(frame * 0.15 + i) * 6;
    ctx.fillRect(i * 80, waveY, 85, 120);
  }

  const wBob = Math.floor(Math.sin(frame * 0.1) * 3);
  drawWilliam(140, 95 + wBob, 2.5, frame);

  ctx.fillStyle = '#f1faee';
  for (let j = 0; j < 8; j++) {
    const bx = (j * 40 + Math.sin(frame * 0.05 + j) * 10) % CANVAS_WIDTH;
    const by = (240 - (frame * 1.5 + j * 30) % 240);
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let k = 0; k < 5; k++) {
    const sx = (k * 60 + Math.cos(frame * 0.04 + k) * 15) % CANVAS_WIDTH;
    const sy = (200 - (frame * 2 + k * 40) % 200);
    ctx.fillRect(sx, sy, 8, 4);
  }

  drawTopLeftBadge("Cure a Vals... ⛲");
}

// Animation Sieste 💤
function drawSleepScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#ffd1a9';
  for (let i = 0; i < 6; i++) {
    if ((Math.floor(frame / 10) + i) % 2 === 0) {
      ctx.fillRect(30 + i * 50, 40 + (i % 3) * 20, 2, 2);
    }
  }

  ctx.fillStyle = '#e63946'; 
  ctx.fillRect(100, 150, 120, 40);
  ctx.fillStyle = '#ffd1a9'; 
  ctx.fillRect(90, 130, 10, 60);
  ctx.fillRect(220, 145, 10, 45);
  ctx.fillStyle = '#ffffff'; 
  ctx.fillRect(110, 138, 25, 12);

  ctx.save();
  ctx.translate(160, 138);
  ctx.rotate(-Math.PI / 2); 
  drawWilliam(-30, -30, 2.5, frame);
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  const zs = "Z".repeat((Math.floor(frame / 15) % 3) + 1);
  ctx.fillText(zs, 170, 100);

  drawTopLeftBadge("Sieste... 💤");
}

// Animation Café ☕
function drawCoffeeScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = '#f4a261';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#e63946'; 
  ctx.fillRect(110, 110, 100, 70);
  ctx.fillStyle = '#ffffff'; 
  ctx.fillRect(210, 125, 15, 40);
  ctx.fillStyle = '#f4a261';
  ctx.fillRect(210, 135, 5, 20);
  ctx.fillStyle = '#457b9d'; 
  ctx.fillRect(90, 180, 140, 10);

  ctx.fillStyle = '#3a2218';
  ctx.fillRect(115, 115, 90, 10);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let y = 50; y < 110; y++) {
    const x1 = 155 + Math.sin(y * 0.1 - frame * 0.2) * 5;
    if (y === 50) {
      ctx.moveTo(x1, y);
    } else {
      ctx.lineTo(x1, y);
    }
  }
  ctx.stroke();

  drawWilliam(45, 115, 2.5, frame);

  drawTopLeftBadge("Bon cafe... ☕");
}

// Animation Jean Ferrat ⛰️
function drawFerratScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#457b9d'; 
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.lineTo(100, 80);
  ctx.lineTo(200, 180);
  ctx.lineTo(320, 100);
  ctx.lineTo(320, 180);
  ctx.fill();

  ctx.fillStyle = '#2a9d8f'; 
  ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

  const wBob = Math.floor(Math.sin(frame * 0.2) * 3);
  drawWilliam(120, 95 + wBob, 3, frame);

  ctx.fillStyle = '#8d99ae';
  ctx.fillRect(165, 130 + wBob, 3, 40); 
  ctx.fillStyle = '#2b2d42';
  ctx.fillRect(162, 120 + wBob, 9, 10); 

  const colors = ['#e63946', '#ffb703', '#2a9d8f', '#e76f51', '#ffffff'];
  ctx.font = '16px sans-serif';
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = colors[(i + Math.floor(frame / 10)) % colors.length];
    const nx = (40 + i * 50 + Math.sin(frame * 0.05 + i) * 15) % CANVAS_WIDTH;
    const ny = (130 - (frame * 1.2 + i * 25) % 120);
    ctx.fillText(i % 2 === 0 ? "🎵" : "🎶", nx, ny);
  }

  drawTopLeftBadge("Jean Ferrat... 🎵");
}

// Animation Manger Caillette 🥩
function drawEatScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = state.eatAnimationType === 'A' ? '#f4a261' : '#4f5d75';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const cSize = Math.max(8, 30 - (90 - state.eatAnimationTimer) * 0.3);
  ctx.fillStyle = state.eatAnimationType === 'A' ? COLORS.cailletteArdeche : COLORS.cailletteDrome;
  ctx.beginPath();
  ctx.arc(160, 120, cSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  const mouthOpen = Math.floor(frame / 6) % 2 === 0;
  ctx.save();
  ctx.translate(40, 110);
  drawWilliam(0, 0, 2.5, frame);
  if (mouthOpen) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(15, 20, 4, 3); 
  }
  ctx.restore();

  if (state.eatAnimationType === 'A') {
    ctx.fillStyle = '#e63946';
    ctx.font = '14px sans-serif';
    for (let i = 0; i < 4; i++) {
      const hx = (150 + i * 30 + Math.sin(frame * 0.1 + i) * 10) % CANVAS_WIDTH;
      const hy = (180 - (frame * 1.5 + i * 20) % 150);
      ctx.fillText("❤️", hx, hy);
    }
  } else {
    ctx.fillStyle = '#55a630';
    for (let i = 0; i < 6; i++) {
      const px = (140 + i * 25 + Math.sin(frame * 0.1 + i) * 8) % CANVAS_WIDTH;
      const py = (180 - (frame * 1.5 + i * 20) % 150);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.eatAnimationType === 'A') {
    drawTopLeftBadge("Miam ! Caillette 🥩");
  } else {
    drawTopLeftBadge("Intox dromoise... 🤮");
  }
}

// Animation Boire Marquisette 🍾
function drawDrinkScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#ffffff'; 
  ctx.fillRect(180, 90, 60, 90);
  ctx.fillStyle = '#e9c46a'; 
  ctx.fillRect(240, 110, 15, 50);
  ctx.fillStyle = '#a8dadc';
  ctx.fillRect(240, 120, 5, 30);
  
  const liquidHeight = Math.max(0, 70 - (90 - state.drinkAnimationTimer) * 0.7);
  ctx.fillStyle = 'rgba(230, 57, 70, 0.75)'; 
  ctx.fillRect(185, 175 - liquidHeight, 50, liquidHeight);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const bx = 190 + (i * 10 + frame) % 40;
    const by = 175 - (frame + i * 15) % Math.max(1, liquidHeight);
    ctx.fillRect(bx, by, 2, 2);
  }

  drawWilliam(60, 100, 2.5, frame);

  drawTopLeftBadge("Boit Marquisette... 🍾");
}

// Animation Caca en Forêt 💩
function drawPoopForestScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();

  // Fond de forêt verdoyante et sombre
  ctx.fillStyle = '#1b4332';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Arbres géants en pixel art
  for (let i = 0; i < 5; i++) {
    const tx = i * 70 - 10;
    // Tronc
    ctx.fillStyle = '#4a3000';
    ctx.fillRect(tx + 25, 100, 20, 100);
    // Feuillage
    ctx.fillStyle = i % 2 === 0 ? '#2d6a4f' : '#40916c';
    ctx.beginPath();
    ctx.arc(tx + 35, 90, 35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sol de forêt
  ctx.fillStyle = '#081c15';
  ctx.fillRect(0, 180, CANVAS_WIDTH, 60);

  if (frame < 80) {
    // William marche en se tenant le ventre
    const walkX = Math.min(145, frame * 2);
    const bob = Math.floor(Math.sin(frame * 0.3) * 3);
    ctx.save();
    drawWilliam(walkX - 20, 132 + bob, 2.2, frame);
    // Mains sur le ventre
    ctx.fillStyle = '#e63946'; // mains rouges de douleur
    ctx.fillRect(walkX - 10, 154 + bob, 6, 4);
    ctx.restore();

    ctx.fillStyle = '#ff85a1';
    ctx.font = 'bold 6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("Vite... 🚽", walkX - 10, 122 + bob);
  } else if (frame < 185) {
    // William accroupi en train de pousser (tremble)
    const shake = Math.sin(frame * 0.9) * 2;
    ctx.save();
    ctx.translate(145 + shake, 145);
    ctx.rotate(0.25);
    drawWilliam(-20, -15, 2.2, frame);
    ctx.restore();

    // Effet d'effort (rougeur / sueur)
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 7px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("POUSSE ! 😤", 145, 110);
    
    // Goutte de sueur
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(150 + shake, 125, 2, 4);
  } else {
    // Il a fini ! Soulagement
    ctx.save();
    ctx.translate(145, 145);
    ctx.rotate(0.2);
    drawWilliam(-20, -15, 2.2, frame);
    ctx.restore();

    // Ouf
    ctx.fillStyle = '#4cc9f0';
    ctx.font = 'bold 8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("OUF... 😌", 145, 110);

    // Émoji caca apparaît
    ctx.fillStyle = '#7f5539';
    ctx.font = '16px serif';
    ctx.fillText("💩", 185, 175);

    // Mouches
    ctx.fillStyle = '#b08968';
    for (let m = 0; m < 4; m++) {
      const fx = 180 + Math.sin(frame * 0.3 + m) * 12;
      const fy = 150 - ((frame - 185) * 1.5 + m * 20) % 60;
      ctx.fillRect(fx, fy, 2, 2);
    }
  }

  drawTopLeftBadge("Caca en forêt... 💩");
}

function render() {
  if (!ctx) return;
  state.frame++;

  // Si caca en forêt actif
  if (state.poopForestActive) {
    drawPoopForestScene(state.frame);
    return;
  }

  // Si cure thermale active
  if (state.healAnimationActive) {
    drawHealScene(state.frame);
    return;
  }

  // Si sieste active
  if (state.sleepAnimationActive) {
    drawSleepScene(state.frame);
    return;
  }

  // Si café actif
  if (state.coffeeAnimationActive) {
    drawCoffeeScene(state.frame);
    return;
  }

  // Si chant Jean Ferrat actif
  if (state.ferratAnimationActive) {
    drawFerratScene(state.frame);
    return;
  }

  // Si manger caillette active
  if (state.eatAnimationActive) {
    drawEatScene(state.frame);
    return;
  }

  // Si boire marquisette active
  if (state.drinkAnimationActive) {
    drawDrinkScene(state.frame);
    return;
  }

  // Si William vomit 🤢
  if (state.vomitActive) {
    drawVomitingScene(state.frame);
    return;
  }

  // Si cinématique flash de nourriture active
  if (state.foodFlashActive) {
    drawCailletteFlash(state.frame);
    return;
  }

  // Si événement personnalisé actif
  if (state.customEventAnimation) {
    drawCustomEventScene(state.frame);
    return;
  }

  // Si événement animé
  if (state.eventActive) {
    drawAnimatedEvent();
    return;
  }

  // Écran de victoire avec le Bal de Coucouron
  if (state.gameWon) {
    drawBalDeCoucouron(state.frame);
    return;
  }

  // Écran des statistiques
  if (state.showStatusScreen) {
    drawStatusScreen();
    return;
  }

  // Écran de défaite
  if (state.gameOver) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let titleText = "EXILE DANS LA DROME !";
    let descText1 = "William a succombe...";
    let descText2 = "Pressez START pour reessayer";
    let bgCol = '#5c0d12';

    if (state.deathCause === 'food') {
      bgCol = '#3a0ca3';
      titleText = "MORT DE FAMINE ! 🥩";
      descText1 = "Pas assez de caillettes.";
      descText2 = "William a manque de forces.";
    } else if (state.deathCause === 'drink') {
      bgCol = '#e07a5f';
      titleText = "MORT DE SOIF ! 🍾";
      descText1 = "Pas assez de Marquisette.";
      descText2 = "William s'est desseche.";
    } else if (state.deathCause === 'ferrat') {
      bgCol = '#4a4e69';
      titleText = "MORT DE CHAGRIN ! ⛰️";
      descText1 = "Le moral etait a zero.";
      descText2 = "Il manquait de Jean Ferrat.";
    } else if (state.deathCause === 'poison') {
      bgCol = '#132a13';
      titleText = "INTOXICATION ! 🤮";
      descText1 = "La caillette dromoise";
      descText2 = "a empoisonne William.";
    } else {
      bgCol = '#2b2d42';
      titleText = "MORT D'EPUISEMENT !";
      descText1 = "Sante critique a zero.";
      descText2 = "Le chemin etait trop rude.";
    }

    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (state.deathCause === 'food') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(160, 145, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = '10px serif';
      ctx.fillText("🦴", 153, 138);
    } else if (state.deathCause === 'drink') {
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(160, 145, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if (state.deathCause === 'ferrat') {
      ctx.fillStyle = '#98c1d9';
      ctx.fillRect(130, 125, 60, 15);
      ctx.fillStyle = '#3d5a80';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(140 + i * 12, 145 + (frame % 15) * 2, 2, 6);
      }
    } else if (state.deathCause === 'poison') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px serif';
      ctx.fillText("💀", 145, 130);
    } else {
      ctx.fillStyle = '#8d99ae';
      ctx.fillRect(140, 125, 40, 35);
      ctx.fillStyle = '#2b2d42';
      ctx.font = '6px "Press Start 2P"';
      ctx.fillText("R.I.P", 148, 135);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText(titleText, 25, 20);
    
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText(descText1, 25, 75);
    ctx.fillText(descText2, 25, 95);
    
    ctx.fillStyle = '#e9c46a';
    ctx.fillText("START pour recommencer", 45, 195);
    return;
  }

  // Écran d'accueil résumé humoristique du jeu
  if (!state.gameActive) {
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffb703';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    
    if (state.introPage === 0) {
      ctx.fillText("=== PRINCIPE DU JEU (1/2) ===", CANVAS_WIDTH / 2, 30);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText("Aide William a rejoindre", CANVAS_WIDTH / 2, 60);
      ctx.fillText("Coucouron pour assister au bal !", CANVAS_WIDTH / 2, 75);
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#a8dadc';
      ctx.fillText("🥩 FAIM : Mange des caillettes", 15, 115);
      ctx.fillStyle = '#f4a261';
      ctx.fillText("   (Attention aux dromoises !)", 15, 130);
      
      ctx.fillStyle = '#a8dadc';
      ctx.fillText("🍾 SOIF : Bois la marquisette", 15, 165);
      ctx.fillStyle = '#f4a261';
      ctx.fillText("   (Attention a l'ivresse !)", 15, 180);
      
      ctx.fillStyle = '#e9c46a';
      ctx.textAlign = 'center';
      ctx.font = '7.5px "Press Start 2P"';
      ctx.fillText("BOUTON A / START : SUIVANT", CANVAS_WIDTH / 2, 220);
    } else {
      ctx.fillText("=== PRINCIPE DU JEU (2/2) ===", CANVAS_WIDTH / 2, 30);
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#a8dadc';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillText("🎵 MORAL : Ecoute Jean Ferrat", 15, 65);
      ctx.fillStyle = '#ffffff';
      ctx.fillText("   (Remonte le moral de William)", 15, 80);
      
      ctx.fillStyle = '#a8dadc';
      ctx.fillText("⛲ SANTE : Cure Thermes de Vals", 15, 115);
      ctx.fillStyle = '#ffffff';
      ctx.fillText("   (Remonte sa sante physique)", 15, 130);
      
      ctx.fillStyle = '#f4a261';
      ctx.fillText("💤 Sieste / ☕ Cafe corsé", 15, 165);
      ctx.fillStyle = '#ffffff';
      ctx.fillText("   (Pour recuperer de la fete)", 15, 180);
      
      ctx.fillStyle = '#e9c46a';
      ctx.textAlign = 'center';
      ctx.font = '7.5px "Press Start 2P"';
      ctx.fillText("BOUTON A / START : JOUER", CANVAS_WIDTH / 2, 220);
    }
    return;
  }

  // Parallaxe
  const currentSpeed = getWalkSpeed();
  if (currentSpeed !== 0) {
    const speedMult = Math.abs(currentSpeed) / 0.8;
    state.skyScroll += 0.05 * speedMult;
    state.mountainScroll += 0.25 * speedMult;
    state.groundScroll += 1.2 * speedMult;
  }

  drawNormalGame();
}

// --- BANQUE DE PHRASES HUMORISTIQUES POUR LA CAILLETTE ---
const CAILLETTE_ARDECHE_PROMPTS = [
  "Une sublime caillette de Coucouron aux herbes sauvages !",
  "Un chef-d'œuvre charcutier fume au bois de chataignier !",
  "Une vraie caillette ardechoise pure souche du plateau !",
  "Une caillette dorees au four avec epinards et pignons !"
];

const CAILLETTE_DROME_PROMPTS = [
  "Pouah, ca sent le pneu brûle et le plastique de Valence...",
  "Une caillette dromoise douteuse importee en contrebande !",
  "Alerte ! Une caillette molle de la rive gauche du Rhône...",
  "Une caillette dromoise suspecte sans passeport ardechois !"
];

const CAILLETTE_REFUSAL_QUOTES = [
  "William recache sa fierte ardechoise et passe son tour !",
  "Pas question ! Ma grand-mere se retournerait dans sa tombe !",
  "William renifle la chose et prefere s'en passer.",
  "William repousse l'assiette avec un dedain souverain !"
];

// --- ACTIONS DES BOISSONS & ALIMENTS ---
function triggerFeed() {
  if (state.isSleeping) {
    sound.playError();
    showDialog("William dort paisiblement !", 2000);
    return;
  }
  // Déclenche le mini-jeu flash furtif des caillettes avec probabilité 50/50 stricte
  state.foodFlashActive = true;
  state.foodFlashTimer = 18; // ~0.3s flash furtif
  state.foodFlashType = Math.random() < 0.5 ? 'A' : 'D';
  sound.beep(600, 0.15, 'triangle', 0.1);
  showDialog("Attrape la caillette d'Ardeche (A) ! Evite celle de la Drome (B) !", 2500);
}

function updateFoodFlash() {
  if (state.foodFlashActive) {
    state.foodFlashTimer--;
    if (state.foodFlashTimer <= 0) {
      state.foodFlashActive = false;
      state.cailletteActive = true;
      state.cailletteType = state.foodFlashType;
      
      if (choiceOverlay) {
        choiceOverlay.classList.remove('hidden');
      }
      const cLabel = safeGet('choice-label');
      if (cLabel) {
        if (state.foodFlashType === 'A') {
          const prompt = CAILLETTE_ARDECHE_PROMPTS[Math.floor(Math.random() * CAILLETTE_ARDECHE_PROMPTS.length)];
          cLabel.innerText = `${prompt} Manger (A) / Refuser (B) ?`;
        } else {
          const prompt = CAILLETTE_DROME_PROMPTS[Math.floor(Math.random() * CAILLETTE_DROME_PROMPTS.length)];
          cLabel.innerText = `${prompt} Manger (A) / Refuser (B) ?`;
        }
      }
    }
  }
}

function handleCailletteChoice(accept) {
  state.cailletteActive = false;
  if (choiceOverlay) {
    choiceOverlay.classList.add('hidden');
  }

  if (accept) {
    if (state.cailletteType === 'A') {
      state.food = Math.min(100, state.food + 35);
      
      // SI FAIM 100% -> CACA EN FORÊT
      if (state.food >= 100) {
        state.food = 40; // Estomac vidé
        state.distance += 5.0; // Détour
        state.needsThermesClean = true;
        state.poopForestActive = true;
        state.poopForestTimer = 300; // ~5s (coordonné avec le dialogue)
        state.frame = 0; // Reset frame
        sound.playVomitSound();
        showDialog("Faim 100% ! William s'enfuit faire caca en forêt (+5 km) et doit aller aux Thermes !", 5000);
      } else {
        state.eatAnimationActive = true;
        state.eatAnimationTimer = 180; // ~3s
        state.eatAnimationType = 'A';
        state.frame = 0; // Reset frame
        state.health = Math.min(100, state.health + 15);
        sound.playSuccess();
        showDialog("Miam ! Delicieuse caillette ardechoise ! 🥩", 3500);
      }
    } else {
      state.isPoisoned = true;
      state.eatAnimationActive = true;
      state.eatAnimationTimer = 180; // ~3s
      state.eatAnimationType = 'D';
      state.frame = 0; // Reset frame
      state.health = Math.max(10, state.health - 25);
      sound.playError();
      showDialog("Aïe ! Intoxique par le plastique dromois ! 🤮", 4000);
    }
  } else {
    sound.beep(300, 0.15);
    const quote = CAILLETTE_REFUSAL_QUOTES[Math.floor(Math.random() * CAILLETTE_REFUSAL_QUOTES.length)];
    showDialog(quote, 3000);
  }
}

function triggerMarquisette() {
  if (state.isSleeping) {
    sound.playError();
    return;
  }
  state.drink = Math.min(100, state.drink + 35);
  sound.beep(900, 0.3, 'sawtooth', 0.08);

  if (state.drink >= 100) {
    state.vomitActive = true;
    state.vomitTimer = 180; // ~3s
    state.frame = 0; // Reset frame
    state.drink = 30; // Chute après vomi
    state.health = Math.max(10, state.health - 15);
    sound.playVomitSound();
    showDialog("Hydratation 100% ! William a trop bu et VOMIT ! 🤢", 4500);
  } else {
    state.drinkAnimationActive = true;
    state.drinkAnimationTimer = 180; // ~3s
    state.frame = 0; // Reset frame
    showDialog("La Marquisette coule a flot !", 3500);
  }
}

function triggerMusic() {
  if (state.isSleeping) {
    sound.playError();
    return;
  }
  state.ferrat = Math.min(100, state.ferrat + 30);
  state.ferratAnimationActive = true;
  state.ferratAnimationTimer = 330; // ~5.5s (durée complète de la mélodie)
  state.frame = 0; // Reset frame
  sound.playFerrat(); // Musique Jean Ferrat
  showDialog("Pourtant que la montagne est belle... 🎵", 5000);
}

function triggerHeal() {
  if (state.isSleeping) {
    sound.playError();
    return;
  }
  state.healAnimationActive = true;
  state.healAnimationTimer = 180; // ~3s
  state.frame = 0; // Reset frame
  state.isPoisoned = false;
  state.health = Math.min(100, state.health + 40);
  
  if (state.needsThermesClean) {
    state.needsThermesClean = false;
    sound.playSuccess();
    showDialog("Thermes de Vals : William est lave et débarrassé du caca de la forêt ! ⛲", 4500);
  } else {
    state.distance += 5.0;
    sound.playSuccess();
    showDialog("Vals-les-Bains soigne William, mais detour de +5 km !", 4000);
  }
}

function triggerSleep() {
  state.isSleeping = true;
  state.sleepAnimationActive = true;
  state.sleepAnimationTimer = 180; // ~3s (directement l'animation dans le lit !)
  state.frame = 0; // Reset frame
  state.health = Math.min(100, state.health + 10);
  sound.beep(400, 0.3);
  showDialog("William se met au lit pour une sieste recuperatrice ! Sante +10 ! 💤", 3500);
}

function triggerClean() {
  if (state.isDrunk || state.drink > 50) {
    state.drink = 30;
    state.isDrunk = false;
    state.coffeeAnimationActive = true;
    state.coffeeAnimationTimer = 180; // ~3s (animation rallongée)
    state.frame = 0; // Reset frame
    sound.beep(600, 0.15);
    showDialog("Un grand cafe noir fait dessouler William !", 3500);
  } else {
    sound.beep(300, 0.1);
    showDialog("Pas besoin de cafe pour l'instant.", 2000);
  }
}

// --- ALÉAS HUMORISTIQUES V5 ---
// --- ALÉAS HUMORISTIQUES V5 ---
const humorEvents = [
  { id: "cyclistes", text: "William double des cyclistes de l'Ardechoise en marchant sans forcer.", icon: "🚴", type: "moral", value: 20, effectText: " Fierte ardechoise ! Moral +20 !" },
  { id: "sirop", text: "William trouve une bouteille de sirop de chataigne artisanale et la boit cul-sec.", icon: "🌰", type: "food_moral", value: { food: 20, moral: 10 }, effectText: " Faim +20, Moral +10 !" },
  { id: "drome_tong", text: "Un Dromois en tongue tente d'expliquer comment faire de la caillette.", icon: "🐐", type: "moral", value: -15, effectText: " William retient ses coups. Moral -15 !" },
  { id: "burle", text: "Le brouillard d'Ardeche (la Burle) se leve. William avance a l'aveugle.", icon: "🌾", type: "burle", value: -15, effectText: " Il tombe dans le fosse ! Sante -15, Detour +3 km !" },
  { id: "cochon", text: "William gagne le concours de cri de cochon a la foire de Coucouron.", icon: "🐖", type: "moral", value: 25, effectText: " Le public l'acclame ! Moral +25 !" },
  { id: "sanglier", text: "William croise un sanglier egare et partage sa Marquisette. Il grimpe sur son dos !", icon: "🐗", type: "sanglier", value: { moral: 15, distance: -4.0 }, effectText: " Raccourci ! Moral +15, Distance -4 km !" },
  { id: "gps", text: "Un GPS dromois essaie de guider William vers Valence. Il le jette de rage !", icon: "📡", type: "gps", value: { moral: -20, distance: 5.0 }, effectText: " Colere ! Moral -20, Detour +5 km !" },
  { id: "picodon", text: "William tente de manger un vieux Picodon dur comme de la pierre.", icon: "🧀", type: "picodon", value: { food: 15, health: -10 }, effectText: " Aïe la dent ! Faim +15, Sante -10 !" },
  { id: "bogue", text: "Pendant sa sieste, une bogue de chataigne piquante tombe sur le nez de William.", icon: "🌳", type: "bogue", value: { health: -5, moral: -10 }, effectText: " Sursaut ! Sante -5, Moral -10 !" },
  { id: "source", text: "William boit l'eau pure du Mont Gerbier-de-Jonc a la source de la Loire.", icon: "🌋", type: "source", value: { health: 25, drink: 20, distance: 2.0 }, effectText: " Purete ! Sante +25, Soif +20, Detour +2 km !" },
  { id: "licorne", text: "William croise la mythique licorne ardechoise ! Elle le transporte dans les airs.", icon: "🦄", type: "licorne", value: { food: 15, drink: 15, moral: 15, health: 15, distance: -15.0 }, effectText: " Miracle ! Tous les niveaux +15, Raccourci -15 km !" },
  { id: "facteur", text: "William emprunte le sentier escarpe du facteur historique.", icon: "🏃", type: "facteur", value: { distance: -4.0 }, effectText: " Raccourci ! Distance -4 km !" },
  { id: "bouse", text: "William glisse accidentellement sur une bouse de vache fraiche.", icon: "🐄", type: "bouse", value: { health: -5, distance: -1.0 }, effectText: " Oups ! Sante -5, Raccourci -1 km !" },
  { id: "montgolfiere", text: "William grimpe dans la nacelle d'une montgolfiere a Annonay.", icon: "🎈", type: "montgolfiere", value: { distance: -4.0 }, effectText: " Raccourci ! Distance -4 km !" },
  { id: "sonic", text: "Sonic, le chien de William, est parti courir la gueuse. En courant apres lui, William trouve un raccourci.", icon: "🐕", type: "sonic", value: { distance: -3.0 }, effectText: " Raccourci ! Distance -3 km !" },
  { id: "cles", text: "William a perdu ses cles ! Il doit faire demi-tour pour les retrouver au bistrot d'Annonay.", icon: "🔑", type: "cles", value: { moral: -15, distance: 3.0 }, effectText: " Tete en l'air ! Moral -15, Detour +3 km !" }
];

function fillEventPool() {
  state.eventPool = Array.from({length: humorEvents.length}, (_, i) => i);
  // Algorithme de mélange de Fisher-Yates
  for (let i = state.eventPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.eventPool[i], state.eventPool[j]] = [state.eventPool[j], state.eventPool[i]];
  }
}

function triggerRandomEvent() {
  // Réinitialiser le compteur de temps sans action
  state.secondsSinceLastAction = 0;

  if (!state.eventPool || state.eventPool.length === 0) {
    fillEventPool();
  }
  let eventIndex = state.eventPool.shift();
  let ev = humorEvents[eventIndex];

  // Si c'est la licorne mais qu'on est à <= 50 km restants, on la remet à la fin et on en prend un autre
  if (ev.id === "licorne" && parseFloat(state.distance) <= 50.0) {
    state.eventPool.push(eventIndex);
    for (let i = 0; i < state.eventPool.length; i++) {
      if (humorEvents[state.eventPool[i]].id !== "licorne") {
        eventIndex = state.eventPool.splice(i, 1)[0];
        ev = humorEvents[eventIndex];
        break;
      }
    }
  }
  
  if (ev.type === "moral") {
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value));
  } else if (ev.type === "distance") {
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value));
  } else if (ev.type === "health") {
    state.health = Math.max(0, Math.min(100, state.health + ev.value));
  } else if (ev.type === "drink") {
    state.drink = Math.max(0, Math.min(100, state.drink + ev.value));
  } else if (ev.type === "food_moral") {
    state.food = Math.max(0, Math.min(100, state.food + ev.value.food));
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value.moral));
  } else if (ev.type === "burle") {
    state.health = Math.max(0, Math.min(100, state.health + ev.value));
    state.distance = Math.max(0, parseFloat(state.distance) + 3.0);
  } else if (ev.type === "sanglier") {
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value.moral));
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "gps") {
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value.moral));
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "picodon") {
    state.food = Math.max(0, Math.min(100, state.food + ev.value.food));
    state.health = Math.max(0, Math.min(100, state.health + ev.value.health));
  } else if (ev.type === "bogue") {
    state.health = Math.max(0, Math.min(100, state.health + ev.value.health));
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value.moral));
  } else if (ev.type === "source") {
    state.health = Math.max(0, Math.min(100, state.health + ev.value.health));
    state.drink = Math.max(0, Math.min(100, state.drink + ev.value.drink));
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "licorne") {
    state.food = Math.min(100, state.food + ev.value.food);
    state.drink = Math.min(100, state.drink + ev.value.drink);
    // Capping faim et soif pour éviter de déclencher les deux catastrophes en même temps
    if (state.food >= 100 && state.drink >= 100) {
      state.drink = 95;
    }
    state.ferrat = Math.min(100, state.ferrat + ev.value.moral);
    state.health = Math.min(100, state.health + ev.value.health);
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "facteur") {
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "bouse") {
    state.health = Math.max(0, Math.min(100, state.health + ev.value.health));
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "montgolfiere") {
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "sonic") {
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  } else if (ev.type === "cles") {
    state.ferrat = Math.max(0, Math.min(100, state.ferrat + ev.value.moral));
    state.distance = Math.max(0, parseFloat(state.distance) + parseFloat(ev.value.distance));
  }

  const fullText = ev.text + ev.effectText;
  
  if (["sanglier", "gps", "picodon", "bogue", "source", "cyclistes", "sirop", "drome_tong", "burle", "cochon", "licorne", "facteur", "bouse", "montgolfiere", "sonic", "cles"].includes(ev.id)) {
    state.pendingCustomEvent = ev.id;
    initAnimatedEvent(fullText, ev.icon);
  } else {
    state.pendingCustomEvent = null;
    initAnimatedEvent(fullText, ev.icon);
  }
}

function drawCustomEventScene(frame) {
  if (!ctx) return;
  resetCanvasFilter();

  const type = state.customEventAnimation;

  if (type === 'sanglier') {
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#081c15';
    ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

    ctx.fillStyle = '#2d6a4f';
    for (let i = 0; i < 3; i++) {
      const tx = ((i * 120) - (frame * 5) + CANVAS_WIDTH) % (CANVAS_WIDTH + 60) - 30;
      ctx.fillRect(tx, 90, 15, 70);
      ctx.beginPath();
      ctx.arc(tx + 7, 85, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    const sx = 120;
    const sy = 125;
    const bob = Math.floor(Math.sin(frame * 0.4) * 3);

    ctx.fillStyle = '#4a2c00';
    ctx.fillRect(sx, sy + bob, 45, 25);
    ctx.fillRect(sx - 5, sy + 3 + bob, 8, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 7, sy + 10 + bob, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(sx - 3, sy + 5 + bob, 2, 2);

    ctx.fillStyle = '#221200';
    if (Math.floor(frame / 4) % 2 === 0) {
      ctx.fillRect(sx + 5, sy + 25 + bob, 5, 6);
      ctx.fillRect(sx + 35, sy + 25 + bob, 5, 6);
    } else {
      ctx.fillRect(sx + 10, sy + 25 + bob, 5, 6);
      ctx.fillRect(sx + 30, sy + 25 + bob, 5, 6);
    }

    drawWilliam(sx + 15, sy - 17 + bob, 2.2, frame);

    ctx.fillStyle = '#e63946';
    ctx.font = '8px sans-serif';
    for (let c = 0; c < 3; c++) {
      const cx = sx + 15 + Math.sin(frame * 0.1 + c) * 12;
      const cy = sy - 25 - ((frame + c * 25) % 40);
      ctx.fillText("❤️", cx, cy);
    }

    drawTopLeftBadge("Chevauche un sanglier ! 🐗");

  } else if (type === 'gps') {
    drawBackground();
    
    const wx = 100;
    const wy = 135;
    drawWilliam(wx, wy, 3, frame);

    // Boîte de dialogue plus large pour éviter que le texte dépasse
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 1.5;
    ctx.fillRect(wx - 35, wy - 32, 66, 15);
    ctx.strokeRect(wx - 35, wy - 32, 66, 15);
    
    ctx.fillStyle = '#e63946';
    ctx.font = 'bold 6px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("VALENCE?!", wx - 2, wy - 24);

    const startFrame = 60;
    const throwProgress = Math.max(0, frame - startFrame);
    if (throwProgress > 0 && throwProgress < 120) {
      const gpsX = wx + 30 + throwProgress * 1.5;
      const gpsY = wy + 10 - (throwProgress * 1.8) + (0.015 * throwProgress * throwProgress);

      if (gpsY < 190) {
        ctx.fillStyle = Math.floor(frame / 4) % 2 === 0 ? '#e63946' : '#8d99ae';
        ctx.fillRect(gpsX, gpsY, 6, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gpsX + 1, gpsY + 1, 4, 3);
      } else {
        ctx.fillStyle = '#a8dadc';
        for (let d = 0; d < 8; d++) {
          const dx = gpsX + Math.sin(d) * (throwProgress % 15);
          const dy = 190 - (throwProgress % 8) + (d % 3);
          ctx.fillRect(dx, dy, 2, 2);
        }
      }
    }

    drawTopLeftBadge("GPS jete dans le ravin ! 📡");

  } else if (type === 'picodon') {
    // 🧀 Nouvelle animation Picodon - Table en bois et fromage réaliste
    // Arrière-plan table en bois
    ctx.fillStyle = '#d08c50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#b07038'; // Rainures du bois
    for(let r = 0; r < 5; r++) {
      ctx.fillRect(0, 30 + r * 45, CANVAS_WIDTH, 2);
    }

    // Planche à découper en bois sombre
    ctx.fillStyle = '#8c5225';
    ctx.fillRect(80, 110, 160, 80);
    ctx.fillStyle = '#6f3d16'; // Épaisseur de la planche
    ctx.fillRect(80, 190, 160, 8);

    // Le Fromage Picodon (Artisanal, forme cylindrique plate, couleur crème)
    const px = 160;
    const py = 145;
    
    ctx.fillStyle = '#e9d8a6'; // Rind / croûte
    ctx.beginPath();
    ctx.ellipse(px, py + 10, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fefae0'; // Pâte / intérieur
    ctx.beginPath();
    ctx.ellipse(px, py, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cca43b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Côtés du fromage
    ctx.fillStyle = '#e9d8a6';
    ctx.fillRect(px - 24, py, 48, 10);

    // Petites moisissures bleues/blanches typiques du Picodon
    ctx.fillStyle = '#9bba98';
    ctx.fillRect(px - 10, py - 4, 3, 2);
    ctx.fillRect(px + 8, py + 2, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 2, py + 1, 3, 2);

    // William s'approche de la table pour croquer
    // Il marche vers la droite
    const approach = Math.min(60, frame * 1.5);
    const wx = 15 + approach;
    const wy = 95;
    
    // Si l'impact a eu lieu, William a une bulle de douleur et recule un peu
    const biteTime = 55;
    const isImpact = frame > biteTime;
    const finalWx = isImpact ? wx - Math.min(15, (frame - biteTime) * 1.2) : wx;

    drawWilliam(finalWx, wy, 2.5, frame);

    if (isImpact) {
      // Clignotement de douleur
      if (Math.floor(frame / 4) % 2 === 0) {
        ctx.fillStyle = 'rgba(230, 57, 70, 0.35)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Éclat de dent
      const progress = frame - biteTime;
      const dentX = finalWx + 35 + progress * 2;
      const dentY = wy + 20 - (progress * 0.8) + (0.04 * progress * progress);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dentX, dentY, 3, 3); // Bout de dent volant

      // Texte d'impact
      ctx.fillStyle = '#e63946';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.font = 'bold 9px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText("CRAC ! 💥", px, py - 35);
      ctx.fillText("CRAC ! 💥", px, py - 35);

      // Petite bulle de douleur de William
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(finalWx - 20, wy - 25, 45, 12);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 5.5px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("MA DENT !", finalWx + 2.5, wy - 19);
    }

    drawTopLeftBadge("Picodon dur comme de la pierre ! 🧀");

  } else if (type === 'bogue') {
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#4a3000';
    ctx.fillRect(200, 40, 25, 200);
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(200, 30, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(110, 185);
    ctx.rotate(-Math.PI / 2);
    drawWilliam(-30, -30, 2.5, frame);
    ctx.restore();

    const bogueX = 110;
    const impactFrame = 75;
    let bogueY = 10 + frame * 2.2;
    if (bogueY >= 148) {
      bogueY = 148;
    }

    ctx.fillStyle = '#55a630';
    ctx.beginPath();
    ctx.arc(bogueX, bogueY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    for (let e = 0; e < 8; e++) {
      const ex = bogueX + Math.cos(e * Math.PI / 4) * 9;
      const ey = bogueY + Math.sin(e * Math.PI / 4) * 9;
      ctx.fillRect(ex - 1, ey - 1, 2, 2);
    }

    if (frame >= impactFrame) {
      ctx.fillStyle = '#ffb703';
      ctx.font = 'bold 9px "Press Start 2P"';
      ctx.fillText("AÏE ! 💥", bogueX - 20, bogueY - 20);

      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 1.5;
      for (let s = 0; s < 4; s++) {
        const sx1 = bogueX + Math.cos(s) * 12;
        const sy1 = bogueY + Math.sin(s) * 12;
        const sx2 = bogueX + Math.cos(s) * 22;
        const sy2 = bogueY + Math.sin(s) * 22;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
    }

    drawTopLeftBadge("Aïe ! Une bogue piquante ! 🌳");

  } else if (type === 'source') {
    ctx.fillStyle = '#a8dadc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#457b9d';
    ctx.beginPath();
    ctx.moveTo(130, 180);
    ctx.lineTo(220, 50);
    ctx.lineTo(310, 180);
    ctx.fill();

    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(215, 75, 10, 105);
    ctx.fillStyle = '#ffffff';
    for (let w = 0; w < 4; w++) {
      const wy = 75 + ((frame * 2 + w * 25) % 105);
      ctx.fillRect(215 + (w % 3) * 3, wy, 2, 8);
    }

    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(0, 170, CANVAS_WIDTH, 70);

    const wx = 120;
    const wy = 115;
    drawWilliam(wx, wy, 2.8, frame);

    ctx.fillStyle = '#ffd166';
    for (let e = 0; e < 8; e++) {
      const ex = wx + 15 + Math.sin(frame * 0.08 + e) * 25;
      const ey = wy + 10 - ((frame * 1.5 + e * 20) % 70);
      ctx.fillRect(ex, ey, 3, 3);
      ctx.fillRect(ex - 1, ey + 1, 5, 1);
      ctx.fillRect(ex + 1, ey - 1, 1, 5);
    }

    drawTopLeftBadge("Gerbier-de-Jonc : Source pure ! 🌋");
  } else if (type === 'cyclistes') {
    drawBackground();
    
    // Cycliste en galère à droite
    ctx.save();
    const cycX = 175 + Math.sin(frame * 0.1) * 3;
    const cycY = 120 + Math.floor(Math.sin(frame * 0.3) * 1.5);
    
    // Roues vélo
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cycX - 12, cycY + 22, 7, 0, Math.PI*2);
    ctx.arc(cycX + 12, cycY + 22, 7, 0, Math.PI*2);
    ctx.stroke();
    
    // Cadre vélo
    ctx.strokeStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(cycX - 12, cycY + 22);
    ctx.lineTo(cycX, cycY + 22);
    ctx.lineTo(cycX - 4, cycY + 10);
    ctx.lineTo(cycX - 12, cycY + 22);
    ctx.moveTo(cycX + 12, cycY + 22);
    ctx.lineTo(cycX - 4, cycY + 10);
    ctx.stroke();
    
    // Cycliste (Maillot jaune et noir Ardéchoise)
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(cycX - 8, cycY + 2, 12, 10);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cycX - 8, cycY + 6, 12, 3);
    
    // Tête et casque
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(cycX - 4, cycY - 6, 8, 8);
    ctx.fillStyle = '#457b9d';
    ctx.fillRect(cycX - 5, cycY - 10, 10, 4);
    ctx.restore();

    // Bulle fatigue
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.fillRect(cycX + 12, cycY - 22, 38, 12);
    ctx.strokeRect(cycX + 12, cycY - 22, 38, 12);
    ctx.fillStyle = '#000000';
    ctx.font = '5px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("Ouf...", cycX + 16, cycY - 18);

    // William qui double en marchant tranquillement
    const approach = Math.min(100, frame * 1.5);
    drawWilliam(15 + approach, 110, 2.5, frame);

    drawTopLeftBadge("L'Ardéchoise : Ouste les cyclistes ! 🚴");

  } else if (type === 'sirop') {
    // Forêt de châtaigniers
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#081c15';
    ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

    // Souche d'arbre
    ctx.fillStyle = '#5c3d2e';
    ctx.fillRect(150, 140, 24, 30);
    ctx.fillStyle = '#8b5e3c';
    ctx.beginPath();
    ctx.ellipse(162, 140, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const isGrabbed = frame > 50;
    const isDrinking = frame > 80;

    if (!isGrabbed) {
      // Bouteille de sirop ambrée
      ctx.fillStyle = '#9b2226';
      ctx.fillRect(159, 125, 6, 12);
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(160, 122, 4, 3);
    }

    const wx_s = Math.min(105, frame * 1.6);
    const wy_s = 95;

    if (isDrinking) {
      ctx.save();
      ctx.translate(wx_s + 30, wy_s + 25);
      ctx.rotate(-0.4);
      drawWilliam(-20, -25, 2.5, frame);
      // Bouteille à la bouche
      ctx.fillStyle = '#9b2226';
      ctx.fillRect(3, -15, 6, 12);
      ctx.restore();

      // Bulle de texte horizontale (dessinée en dehors du bloc de rotation pour éviter les décalages)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.fillRect(wx_s - 30, wy_s + 5, 42, 12);
      ctx.strokeRect(wx_s - 30, wy_s + 5, 42, 12);
      ctx.fillStyle = '#000000';
      ctx.font = '5px "Press Start 2P"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText("GLOU !", wx_s - 25, wy_s + 8);

      // Gouttes
      ctx.fillStyle = '#ffd166';
      for(let g = 0; g < 3; g++) {
        const gx = wx_s + 38 + Math.sin(frame * 0.4 + g) * 4;
        const gy = wy_s + 25 + ((frame + g * 10) % 20);
        ctx.fillRect(gx, gy, 2, 2);
      }
    } else if (isGrabbed) {
      drawWilliam(wx_s, wy_s, 2.5, frame);
      ctx.fillStyle = '#9b2226';
      ctx.fillRect(wx_s + 28, wy_s + 16, 5, 10);
    } else {
      drawWilliam(wx_s, wy_s, 2.5, frame);
    }

    drawTopLeftBadge("Bouteille de Sirop de Châtaigne ! 🌰");

  } else if (type === 'drome_tong') {
    drawBackground();
    
    // Fleuve Rhône
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(0, 140, CANVAS_WIDTH, 20);

    // Le Drômois à droite
    const dx = 210;
    const wy_dt = 110;
    const dBob = Math.floor(Math.sin(frame * 0.2) * 3);
    
    // Tongs jaunes
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(dx + 2, wy_dt + 42 + dBob, 8, 3);
    ctx.fillRect(dx + 12, wy_dt + 42 + dBob, 8, 3);
    
    // Chaussettes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx + 4, wy_dt + 32 + dBob, 4, 10);
    ctx.fillRect(dx + 14, wy_dt + 32 + dBob, 4, 10);
    
    // Corps
    ctx.fillStyle = '#4f772d';
    ctx.fillRect(dx + 2, wy_dt + 15 + dBob, 16, 18);
    
    // Tête
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(dx + 5, wy_dt - 2 + dBob, 10, 17);
    ctx.fillStyle = '#e63946';
    ctx.fillRect(dx + 2, wy_dt - 6 + dBob, 16, 4);

    // Dialogue (Bulle agrandie et décalée à gauche pour contenir le texte plus grand)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.fillRect(dx - 82, wy_dt - 38, 92, 28);
    ctx.strokeRect(dx - 82, wy_dt - 38, 92, 28);
    ctx.fillStyle = '#000';
    ctx.font = '6px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("LA CAILLETTE", dx - 77, wy_dt - 33);
    ctx.fillText("C'EST DROMOIS!", dx - 77, wy_dt - 22);

    // William à gauche énervé
    const wx_dt = 70;
    const wy_dt_w = 110;
    drawWilliam(wx_dt, wy_dt_w, 2.5, frame);
    
    ctx.fillStyle = '#e63946';
    ctx.font = '10px sans-serif';
    ctx.fillText("💢", wx_dt + 10, wy_dt_w - 10);

    drawTopLeftBadge("Le Drômois en tongs ! 🐐");

  } else if (type === 'burle') {
    ctx.fillStyle = '#cad2c5';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ravin
    ctx.fillStyle = '#354f52';
    ctx.beginPath();
    ctx.moveTo(170, 240);
    ctx.lineTo(250, 170);
    ctx.lineTo(320, 170);
    ctx.lineTo(320, 240);
    ctx.fill();

    ctx.fillStyle = '#2f3e46';
    ctx.fillRect(0, 170, 190, 70);

    const wProgress = frame * 1.3;
    const wx_b = 10 + wProgress;
    const wy_b = 120;

    if (wx_b > 175) {
      ctx.save();
      ctx.translate(wx_b, wy_b + (wx_b - 175) * 1.6);
      ctx.rotate(frame * 0.15);
      drawWilliam(-15, -15, 2.5, frame, true);
      ctx.restore();

      ctx.fillStyle = '#ffb703';
      ctx.font = '10px sans-serif';
      ctx.fillText("💥 CRASH !", wx_b - 20, wy_b + (wx_b - 175) * 1.6 - 20);
    } else {
      drawWilliam(wx_b, wy_b, 2.5, frame);
    }

    // Brume / Burle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 4; i++) {
      const bx = ((i * 100) - (frame * 3) + CANVAS_WIDTH) % (CANVAS_WIDTH + 100) - 50;
      ctx.fillRect(bx, 40 + i * 35, 120, 25);
    }

    drawTopLeftBadge("La Burle : Chute dans le fossé ! 🌾");

  } else if (type === 'cochon') {
    ctx.fillStyle = '#3a0ca3';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Lumières guirlande
    const garlandColors = ['#f72585', '#7209b7', '#3f37c9', '#4cc9f0', '#ffd166'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = garlandColors[(i + Math.floor(frame / 8)) % garlandColors.length];
      ctx.beginPath();
      ctx.arc(20 + i * 40, 25, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scène
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(40, 150, 240, 60);
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(40, 210, 240, 30);

    // William
    const wx_c = 80;
    const wy_c = 100;
    drawWilliam(wx_c, wy_c, 2.2, frame);

    const screamEndFrame = 70;
    const isScreaming = frame < screamEndFrame;

    // Cri de William
    if (isScreaming) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#f72585';
      ctx.lineWidth = 1.5;
      ctx.fillRect(wx_c + 25, wy_c - 30, 80, 22);
      ctx.strokeRect(wx_c + 25, wy_c - 30, 80, 22);
      ctx.fillStyle = '#000000';
      ctx.font = '6.5px "Press Start 2P"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText("GROUIIIC!🐖", wx_c + 30, wy_c - 23);
    }

    // Gros Cochon qui arrive de la droite de l'estrade UNIQUEMENT après le cri
    if (!isScreaming) {
      const walkProgress = frame - screamEndFrame;
      const pigX = Math.max(160, 290 - walkProgress * 2.2);
      const pigBob = Math.floor(Math.sin(frame * 0.35) * 2);
      
      ctx.save();
      ctx.translate(pigX, 120 + pigBob);
      
      // Gros corps rose
      ctx.fillStyle = '#ffc0cb';
      ctx.fillRect(0, 0, 26, 18);
      
      // Grosse Tête
      ctx.fillRect(-8, 3, 8, 12);
      
      // Groin
      ctx.fillStyle = '#ff85a1';
      ctx.fillRect(-11, 7, 3, 5);
      
      // Œil
      ctx.fillStyle = '#000000';
      ctx.fillRect(-6, 6, 1.5, 1.5);
      
      // Oreille
      ctx.fillStyle = '#ff85a1';
      ctx.fillRect(-4, 0, 3, 4);
      
      // Pattes épaisses
      ctx.fillStyle = '#ffc0cb';
      const legOffset = Math.floor(frame / 5) % 2 === 0 ? 3 : 0;
      ctx.fillRect(3, 18, 3, 6 - legOffset);
      ctx.fillRect(9, 18, 3, 6 + legOffset - 3);
      ctx.fillRect(15, 18, 3, 6 - legOffset);
      ctx.fillRect(21, 18, 3, 6 + legOffset - 3);
      
      // Queue en tire-bouchon plus visible
      ctx.strokeStyle = '#ff85a1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(26, 6);
      ctx.lineTo(30, 3);
      ctx.lineTo(29, 9);
      ctx.stroke();
      
      ctx.restore();
    }

    // Juge
    const jx = 240;
    const jy = 100;
    ctx.fillStyle = COLORS.pants;
    ctx.fillRect(jx, jy + 20, 15, 30);
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(jx + 2, jy + 5, 11, 15);
    
    // Trophée
    ctx.fillStyle = Math.floor(frame/6)%2===0 ? '#ffb703' : '#ffd166';
    ctx.fillRect(jx - 15, jy + 15, 10, 12);
    ctx.fillRect(jx - 13, jy + 27, 6, 4);

    // Confettis
    for (let c = 0; c < 12; c++) {
      ctx.fillStyle = garlandColors[(c + frame) % garlandColors.length];
      const cx = (c * 26 + frame) % CANVAS_WIDTH;
      const cy = (c * 19 + frame * 1.5) % 180;
      ctx.fillRect(cx, cy, 3, 3);
    }

    drawTopLeftBadge("Foire : Cri de cochon ! 🐖");
  } else if (type === 'licorne') {
    // Fond magique avec étoiles et teintes violettes/roses
    ctx.fillStyle = '#240046';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Étoiles scintillantes
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      if ((frame + i * 20) % 30 < 15) {
        const starX = (i * 45 + frame * 0.5) % CANVAS_WIDTH;
        const starY = (i * 25 + Math.sin(frame * 0.1 + i) * 10) % 150;
        ctx.fillRect(starX, starY, 2, 2);
      }
    }

    // Montagnes magiques sombres en bas
    ctx.fillStyle = '#10002b';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(80, 130);
    ctx.lineTo(160, 180);
    ctx.lineTo(240, 120);
    ctx.lineTo(320, 180);
    ctx.fill();

    ctx.fillStyle = '#3c096c';
    ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

    // Licorne qui galope
    const lx = 110;
    const ly = 100;
    const lBob = Math.floor(Math.sin(frame * 0.3) * 3);

    // Arc-en-ciel émis par le derrière de la licorne 🌈
    const colors = ['#ff2a6d', '#ffb703', '#05d9e8', '#01012b', '#ffd166'];
    ctx.save();
    for (let r = 0; r < 20; r++) {
      ctx.fillStyle = colors[(r + Math.floor(frame / 4)) % colors.length];
      const rx = lx + 45 + r * 3 + Math.sin(frame * 0.2 + r) * 4;
      const ry = ly + 15 + lBob + Math.cos(frame * 0.15 + r) * 3;
      if (rx < CANVAS_WIDTH) {
        ctx.fillRect(rx, ry, 6, 4);
      }
    }
    ctx.restore();

    // Dessin de la licorne blanche
    ctx.save();
    ctx.translate(lx, ly + lBob);
    
    // Corps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 5, 45, 20);
    // Pattes (galop)
    const legCycle = Math.floor(frame / 5) % 2;
    ctx.fillStyle = '#ffffff';
    if (legCycle === 0) {
      ctx.fillRect(4, 25, 4, 8);
      ctx.fillRect(12, 25, 4, 6);
      ctx.fillRect(30, 25, 4, 8);
      ctx.fillRect(38, 25, 4, 6);
    } else {
      ctx.fillRect(4, 25, 4, 6);
      ctx.fillRect(12, 25, 4, 8);
      ctx.fillRect(30, 25, 4, 6);
      ctx.fillRect(38, 25, 4, 8);
    }
    // Sabots dorés
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(4, 31 + (legCycle === 0 ? 2 : 0), 4, 2);
    ctx.fillRect(12, 31 + (legCycle === 0 ? 0 : 2), 4, 2);
    ctx.fillRect(30, 31 + (legCycle === 0 ? 2 : 0), 4, 2);
    ctx.fillRect(38, 31 + (legCycle === 0 ? 0 : 2), 4, 2);

    // Encolure & Tête
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-10, 0, 15, 12); // Cou
    ctx.fillRect(-18, -8, 14, 10); // Tête
    // Museau
    ctx.fillStyle = '#ffccd5';
    ctx.fillRect(-22, -6, 4, 6);
    // Œil bleu magique
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(-12, -5, 2, 2);
    // Corne dorée scintillante
    ctx.fillStyle = '#ffb703';
    ctx.fill();

    // Crinière et queue rose fuchsia
    ctx.fillStyle = '#ff2a6d';
    ctx.fillRect(2, -2, 10, 8);
    ctx.fillRect(43, 2, 8, 12);
    ctx.restore();

    // William chevauche la licorne et lui tient la corne !
    ctx.save();
    // William est penché en avant sur l'encolure
    drawWilliam(lx + 8, ly - 22 + lBob, 2.3, frame);
    // Main de William tenant la corne
    ctx.fillStyle = COLORS.shirt;
    ctx.fillRect(lx + 2, ly - 4 + lBob, 8, 3);
    ctx.restore();

    drawTopLeftBadge("Licorne mythique de l'Ardèche ! 🦄");
  } else if (type === 'facteur') {
    // Fond vert sombre très touffu
    ctx.fillStyle = '#0f201b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Plein d'arbres touffus superposés
    ctx.fillStyle = '#1b4332';
    for (let i = 0; i < 8; i++) {
      const ax = i * 45 - 10;
      ctx.fillRect(ax, 100, 15, 120);
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.arc(ax + 7, 90, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // William avance lentement avec difficulté (frame * 0.75)
    const progress = Math.min(180, frame * 0.75);
    const wx_f = 20 + progress;
    const wy_f = 110;
    const bob = Math.floor(Math.sin(frame * 0.25) * 2);
    drawWilliam(wx_f, wy_f + bob, 2.5, frame);

    // Dessiner des branches et feuillages devant William
    ctx.fillStyle = 'rgba(8, 28, 21, 0.9)';
    // Branches horizontales
    ctx.fillRect(0, 130, CANVAS_WIDTH, 10);
    ctx.fillRect(0, 155, CANVAS_WIDTH, 8);
    
    // Petits carrés de feuilles volantes
    ctx.fillStyle = '#40916c';
    for(let f=0; f<15; f++) {
      const fx = (f * 25 + frame * 0.4) % CANVAS_WIDTH;
      const fy = 110 + (f * 7) % 70;
      ctx.fillRect(fx, fy, 4, 4);
    }

    // Sueur de William pour montrer la difficulté
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(wx_f + 14, wy_f - 10 + bob, 2, 3);

    drawTopLeftBadge("William traverse un bois très touffu ! 🌳");
  } else if (type === 'bouse') {
    drawBackground();
    
    // Bouse de vache au sol
    ctx.fillStyle = '#7f5539';
    ctx.beginPath();
    ctx.ellipse(140, 192, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#582f0e';
    ctx.beginPath();
    ctx.ellipse(140, 190, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glissage de William (wy = 145 pour être directement sur le sol)
    const startSlipFrame = 40;
    if (frame < startSlipFrame) {
      const approach = frame * 2.2;
      drawWilliam(10 + approach, 145, 2.5, frame);
    } else {
      const slipProgress = frame - startSlipFrame;
      const slideX = 10 + startSlipFrame * 2.2 + slipProgress * 4.5;
      ctx.save();
      ctx.translate(slideX, 145);
      ctx.rotate(-0.8); // Jambes en l'air
      drawWilliam(-15, -15, 2.5, frame, true);
      ctx.restore();

      // Traits de vitesse
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(slideX - 30, 200);
      ctx.lineTo(slideX - 10, 200);
      ctx.moveTo(slideX - 45, 195);
      ctx.lineTo(slideX - 25, 195);
      ctx.stroke();

      ctx.fillStyle = '#ffb703';
      ctx.font = 'bold 7px "Press Start 2P"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText("OUPS!💩", slideX - 35, 100);
    }

    drawTopLeftBadge("Glissade sur bouse ! 🐄");
  } else if (type === 'montgolfiere') {
    // Ciel avec quelques nuages blancs
    ctx.fillStyle = '#a8dadc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = '#ffffff';
    // Nuages
    ctx.beginPath();
    ctx.arc(60, 50, 15, 0, Math.PI * 2);
    ctx.arc(80, 50, 20, 0, Math.PI * 2);
    ctx.arc(100, 50, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(220, 80, 12, 0, Math.PI * 2);
    ctx.arc(235, 80, 16, 0, Math.PI * 2);
    ctx.arc(250, 80, 12, 0, Math.PI * 2);
    ctx.fill();

    // Collines verdoyantes en bas
    ctx.fillStyle = '#2a9d8f';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.quadraticCurveTo(80, 180, 160, 240);
    ctx.quadraticCurveTo(240, 160, 320, 240);
    ctx.lineTo(320, 240);
    ctx.lineTo(0, 240);
    ctx.fill();

    // Calcul de la trajectoire de la montgolfière
    const progress = Math.min(180, frame * 1.3);
    const mx = 40 + progress * 1.1;
    const my = 150 - progress * 0.6;

    // Ballon de la montgolfière (rayé rouge et jaune)
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(mx, my - 25, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Rayures jaunes
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.ellipse(mx, my - 25, 8, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cordes
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx - 10, my - 8);
    ctx.lineTo(mx - 6, my + 5);
    ctx.moveTo(mx + 10, my - 8);
    ctx.lineTo(mx + 6, my + 5);
    ctx.stroke();

    // Nacelle (Panier en bois)
    ctx.fillStyle = '#8c5225';
    ctx.fillRect(mx - 8, my + 5, 16, 12);

    // William qui fait coucou depuis la nacelle !
    ctx.save();
    drawWilliam(mx - 15, my - 13, 1.5, frame);
    ctx.restore();

    drawTopLeftBadge("Montgolfière d'Annonay ! 🎈");
  } else if (type === 'sonic') {
    // Décor forêt
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#081c15';
    ctx.fillRect(0, 160, CANVAS_WIDTH, 80);

    // Arbres d'arrière-plan
    ctx.fillStyle = '#2d6a4f';
    for (let i = 0; i < 6; i++) {
      const ax = i * 60 + 15;
      ctx.beginPath();
      ctx.moveTo(ax, 160);
      ctx.lineTo(ax - 20, 90);
      ctx.lineTo(ax + 20, 90);
      ctx.closePath();
      ctx.fill();
    }

    // William court derrière Sonic
    const progress = frame * 2.2;
    const wx = Math.min(100, progress);
    const wy = 110;
    drawWilliam(wx, wy, 2.5, frame);

    // Bulle William "Sonic au pied !"
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.fillRect(wx - 25, wy - 30, 95, 14);
    ctx.strokeRect(wx - 25, wy - 30, 95, 14);
    ctx.fillStyle = '#000000';
    ctx.font = '5px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("Sonic au pied !", wx - 20, wy - 26);

    // Sonic, le fidèle chien (court devant) - PLUS GROS !
    const sx = wx + 55;
    const sy = wy + 20; // abaissé un peu car plus gros
    const sBob = Math.floor(Math.sin(frame * 0.4) * 2);

    ctx.save();
    ctx.translate(sx, sy + sBob);

    // Corps de Sonic (plus gros !)
    ctx.fillStyle = '#d3a37a';
    ctx.fillRect(0, 0, 24, 15);

    // Tête
    ctx.fillRect(16, -9, 12, 12);
    
    // Oreilles pointues
    ctx.fillStyle = '#a37a5c';
    ctx.beginPath();
    ctx.moveTo(18, -9);
    ctx.lineTo(21, -15);
    ctx.lineTo(24, -9);
    ctx.fill();

    // Museau et Truffe
    ctx.fillStyle = '#d3a37a';
    ctx.fillRect(28, -6, 5, 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(31, -6, 2, 2);

    // Œil
    ctx.fillRect(20, -6, 2, 2);

    // Queue qui frétille
    ctx.strokeStyle = '#a37a5c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(-6, -Math.floor(Math.sin(frame * 0.6) * 5));
    ctx.stroke();

    // Pattes en mouvement
    ctx.fillStyle = '#a37a5c';
    const sLegOffset = Math.floor(frame / 4) % 2 === 0 ? 4 : 0;
    ctx.fillRect(3, 15, 3, 6 - sLegOffset);
    ctx.fillRect(9, 15, 3, sLegOffset + 2);
    ctx.fillRect(15, 15, 3, 6 - sLegOffset);
    ctx.fillRect(21, 15, 3, sLegOffset + 2);

    ctx.restore();

    drawTopLeftBadge("Sonic au pied ! 🐕");
  } else if (type === 'cles') {
    drawBackground();

    // Clé perdue dessinée au sol
    ctx.fillStyle = '#ffb703';
    ctx.font = '12px serif';
    ctx.fillText("🔑", 30, 185);

    if (frame < 45) {
      // William avance tranquillement
      const wx = 30 + frame * 2.0;
      drawWilliam(wx, 110, 2.5, frame);
    } else if (frame < 90) {
      // Il s'arrête et cherche dans ses poches (secouement)
      const shake = Math.sin(frame * 1.2) * 2;
      drawWilliam(120 + shake, 110, 2.5, frame);

      // Points d'interrogation et croix
      ctx.fillStyle = '#ff3333';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("❌", 125 + shake, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Press Start 2P"';
      ctx.fillText("?", 145 + shake, 85);
    } else if (frame < 150) {
      // Il reste complètement statique pendant exactement 60 frames (1 seconde à 60fps)
      drawWilliam(120, 110, 2.5, 0); // frame = 0 pour ne pas s'animer (statique)

      // Le message apparaît !
      ctx.fillStyle = '#ff3333';
      ctx.font = 'bold 5px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillText("Nom de bleu", 130, 88);
      ctx.fillText("mes cles !!!", 130, 96);
    } else {
      // Il repart en arrière (court vers la gauche paniqué)
      const runBack = (frame - 150) * 4.5;
      const wx = Math.max(30, 120 - runBack);
      ctx.save();
      ctx.translate(wx + 15, 110);
      ctx.scale(-1, 1);
      drawWilliam(-15, 0, 2.5, frame);
      ctx.restore();

      // Gouttes de panique
      ctx.fillStyle = '#4cc9f0';
      ctx.fillRect(wx - 5, 105, 2, 3);
      ctx.fillRect(wx + 25, 108, 2, 3);
    }

    drawTopLeftBadge("Où sont passées les clés ?! 🔑");
  }
}

// Dessiner William en train de vomir 🤢
function drawVomitingScene(frame) {
  if (!ctx) return;
  applyCanvasBlurFilter();
  drawBackground();
  
  // Dessine William penché en avant qui secoue la tête
  ctx.save();
  ctx.translate(125, 140);
  const headWobble = Math.sin(frame * 0.4) * 0.1;
  ctx.rotate(0.35 + headWobble); // Penché en avant
  drawWilliam(-30, -30, 3, frame);
  ctx.restore();

  // Jet de vomi vert pixel art spectaculaire
  ctx.fillStyle = '#55a630';
  for (let i = 0; i < 20; i++) {
    const vx = 165 + (i * 6) + Math.sin(frame * 0.4 + i) * 8;
    const vy = 145 + (i * i * 0.25) + Math.cos(frame * 0.3 + i) * 5;
    if (vy < 205) {
      ctx.fillRect(vx, vy, 6, 6);
    }
  }
  // Flaque de vomi au sol
  ctx.fillStyle = '#38b000';
  ctx.beginPath();
  ctx.ellipse(220, 205, 30 + Math.sin(frame * 0.1) * 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bulles de haut-le-cœur
  ctx.fillStyle = '#70e000';
  for (let b = 0; b < 5; b++) {
    const bx = 160 + (b * 15 + frame * 2) % 60;
    const by = 130 - (frame * 1.5 + b * 20) % 50;
    ctx.fillRect(bx, by, 4, 4);
  }

  drawTopLeftBadge("William vomit... 🤢");
}

// --- GAME LOGIC TICK ---
function gameTick() {
  if (!state.gameActive || state.gameOver || state.gameWon) return;

  if (state.eventActive) {
    updateAnimatedEvent();
  }

  if (state.foodFlashActive) {
    updateFoodFlash();
  }

  const isAnyAnimationActive = state.eventActive || state.foodFlashActive || state.vomitActive || state.poopForestActive || state.healAnimationActive || state.sleepAnimationActive || state.coffeeAnimationActive || state.ferratAnimationActive || state.eatAnimationActive || state.drinkAnimationActive || state.customEventAnimation;

  // Gestion de l'inactivité (maximum 10s sans action ni animation)
  if (isAnyAnimationActive) {
    state.secondsSinceLastAction = 0;
  } else {
    state.secondsSinceLastAction++;
    if (state.secondsSinceLastAction >= 10) {
      state.secondsSinceLastAction = 0;
      triggerRandomEvent();
    }
  }

  // La baisse des niveaux est complètement bloquée pendant les animations ou si du texte s'affiche
  const isTextDecayPaused = isAnyAnimationActive || (state.dialogTimer > 0);

  if (!isTextDecayPaused) {
    if (state.isSleeping) {
      state.health = Math.min(100, state.health + 2.5);
      state.food = Math.max(0, state.food - 0.4);
      state.drink = Math.max(0, state.drink - 0.4);
      state.ferrat = Math.max(0, state.ferrat - 0.2);
    } else {
      state.food = Math.max(0, state.food - 0.8);
      state.drink = Math.max(0, state.drink - 1.0); 
      state.ferrat = Math.max(0, state.ferrat - 0.8);

      if (state.food < 15 || state.drink < 15 || state.ferrat < 15) {
        state.health = Math.max(0, state.health - 2.5);
      }

      // L'IVRESSE ET L'INDIGESTION FONT BAISSER LA JAUGE DE SANTÉ 🩺
      if (state.isDrunk || state.drink > 50) {
        state.health = Math.max(0, state.health - 1.5); // Baisser la santé en cas d'ivresse (Marquisette)
      }

      if (state.needsThermesClean || state.food >= 85 || state.vomitActive) {
        state.health = Math.max(0, state.health - 2.0); // Baisser la santé en cas d'indigestion ou vomissement
      }

      if (state.isPoisoned) {
        state.health = Math.max(0, state.health - 4.5);
      }

      // VOMISSEMENT DÉCLENCHÉ À 100% D'HYDRATATION
      if (state.drink >= 100 && !state.vomitActive) {
        state.vomitActive = true;
        state.vomitTimer = 180; // ~3 secondes
        state.drink = 30; // Hydratation chute (estomac vide)
        state.health = Math.max(10, state.health - 15);
        sound.playVomitSound();
        showDialog("Hydratation 100% ! William a trop bu et VOMIT ! 🤢", 4500);
      }

      // Déplacement vers Coucouron
      const currentSpeed = getWalkSpeed();
      if (currentSpeed !== 0) {
        state.distance = Math.max(0, state.distance - currentSpeed);
      }
    }
  }

  if (state.health <= 0) {
    state.gameOver = true;
    if (state.food <= 1) {
      state.deathCause = 'food';
    } else if (state.drink <= 1) {
      state.deathCause = 'drink';
    } else if (state.ferrat <= 1) {
      state.deathCause = 'ferrat';
    } else if (state.isPoisoned) {
      state.deathCause = 'poison';
    } else {
      state.deathCause = 'exhaustion';
    }
    sound.playError();
  }

  if (state.distance <= 0) {
    state.gameWon = true;
    sound.playSuccess();
  }

  // Aléas (ne se déclenchent qu'après au moins 3 secondes de marche ininterrompue)
  const canTriggerAléas = !state.isSleeping && state.dialogTimer <= 0 && !state.cailletteActive && !isAnyAnimationActive && state.walkCooldownTimer <= 0;
  if (Math.random() < 0.15 && canTriggerAléas) {
    triggerRandomEvent();
  }

  updateDashboardAndEffects();
}

// --- BOUTONS ACTIONS ---
function handleAction(action) {
  state.secondsSinceLastAction = 0; // réinitialise le compteur d'inactivité
  if (!state.gameActive || state.gameOver || state.gameWon) {
    resetGame();
  }
  const isAnyAnimationActive = state.eventActive || state.foodFlashActive || state.vomitActive || state.poopForestActive || state.healAnimationActive || state.sleepAnimationActive || state.coffeeAnimationActive || state.ferratAnimationActive || state.eatAnimationActive || state.drinkAnimationActive;
  if (isAnyAnimationActive) return;
  hideDialog();

  switch(action) {
    case 'feed': triggerFeed(); break;
    case 'marquisette': triggerMarquisette(); break;
    case 'music': triggerMusic(); break;
    case 'heal': triggerHeal(); break;
    case 'sleep': triggerSleep(); break;
    case 'clean': triggerClean(); break;
    case 'status':
      state.showStatusScreen = !state.showStatusScreen;
      state.statusPageIndex = 0;
      sound.beep(500, 0.08);
      break;
  }
  updateDashboardAndEffects();
}

function advanceIntroOrReset() {
  if (state.gameOver || state.gameWon) {
    resetGame();
    return;
  }
  if (!state.gameActive) {
    if (state.introPage === 0) {
      state.introPage = 1;
      sound.beep(600, 0.08);
    } else {
      resetGame();
    }
  }
}

// Événements boutons physiques robustes
safeAddListener('btn-a', 'click', () => {
  sound.beep(800, 0.05);
  if (state.eventActive) {
    if (state.eventCharIndex >= state.eventText.length) {
      state.eventActive = false;
      sound.beep(600, 0.08, 'square', 0.08);
      if (state.pendingCustomEvent) {
        state.customEventAnimation = state.pendingCustomEvent;
        state.customEventTimer = 180;
        state.pendingCustomEvent = null;
        state.frame = 0;
      }
    }
  } else if (state.cailletteActive) {
    handleCailletteChoice(true);
  } else if (!state.gameActive || state.gameOver || state.gameWon) {
    advanceIntroOrReset();
  }
});

safeAddListener('btn-b', 'click', () => {
  sound.beep(600, 0.05);
  if (state.eventActive) return;
  
  if (state.cailletteActive) {
    handleCailletteChoice(false);
  }
});

safeAddListener('btn-start', 'click', () => {
  sound.beep(900, 0.08);
  if (state.eventActive) return;
  if (!state.gameActive || state.gameOver || state.gameWon) {
    advanceIntroOrReset();
  }
});

safeAddListener('btn-select', 'click', () => {
  sound.beep(500, 0.08);
  if (state.eventActive) return;
  if (state.gameActive && !state.gameOver && !state.gameWon) {
    state.showStatusScreen = !state.showStatusScreen;
    state.statusPageIndex = (state.statusPageIndex + 1) % 2;
  }
});

// Clic sur l'écran LCD pour démarrer
safeAddListener('lcd-screen', 'click', () => {
  if (!state.gameActive || state.gameOver || state.gameWon) {
    advanceIntroOrReset();
  }
});

// Overlays directs
safeAddListener('choice-accept', 'click', () => handleCailletteChoice(true));
safeAddListener('choice-decline', 'click', () => handleCailletteChoice(false));

// D-Pad
safeAddListener('dpad-left', 'click', () => {
  sound.beep(400, 0.05);
});
safeAddListener('dpad-right', 'click', () => {
  sound.beep(400, 0.05);
});

// Dashboard Action Cards
document.querySelectorAll('.action-card').forEach(card => {
  card.addEventListener('click', () => {
    handleAction(card.getAttribute('data-action'));
  });
});

// Clavier
window.addEventListener('keydown', (e) => {
  sound.init();
  state.secondsSinceLastAction = 0; // réinitialise le compteur d'inactivité
  if (e.key === 'Enter' && (!state.gameActive || state.gameOver || state.gameWon)) {
    advanceIntroOrReset();
  }
  if (state.eventActive && (e.key === 'a' || e.key === 'A' || e.key === 'Enter' || e.key === ' ')) {
    if (state.eventCharIndex >= state.eventText.length) {
      state.eventActive = false;
      sound.beep(600, 0.08, 'square', 0.08);
      if (state.pendingCustomEvent) {
        state.customEventAnimation = state.pendingCustomEvent;
        state.customEventTimer = 180;
        state.pendingCustomEvent = null;
        state.frame = 0;
      }
    }
  }
  if (state.cailletteActive) {
    if (e.key === 'a' || e.key === 'A' || e.key === 'y') handleCailletteChoice(true);
    if (e.key === 'b' || e.key === 'B' || e.key === 'n') handleCailletteChoice(false);
  }
});

function showDialog(text, duration = 3000) {
  state.dialogText = text;
  state.dialogTimer = duration;
  if (lcdDialog) {
    lcdDialog.innerText = text;
    lcdDialog.classList.remove('hidden');
  }
}

function hideDialog() {
  state.dialogText = "";
  state.dialogTimer = 0;
  if (lcdDialog) {
    lcdDialog.classList.add('hidden');
  }
}

function resetGame() {
  // Tout commence à 40% (exigence client)
  state.food = 40;
  state.drink = 40;
  state.ferrat = 40;
  state.health = 40;
  
  state.distance = 100.0;
  state.isPoisoned = false;
  state.isDrunk = false;
  state.isSleeping = false;
  state.gameOver = false;
  state.gameWon = false;
  state.deathCause = '';
  state.gameActive = true;
  state.introPage = 0;
  state.customEventAnimation = null;
  state.customEventTimer = 0;
  state.customEventText = "";
  state.cailletteActive = false;
  state.foodFlashActive = false;
  state.vomitActive = false;
  state.poopForestActive = false;
  state.needsThermesClean = false;
  state.walkCooldownTimer = 180; // au moins 3s avant un événement après démarrage ou action
  state.eventPool = [];
  state.secondsSinceLastAction = 0;
  state.pendingCustomEvent = null;
  state.eatAnimationActive = false;
  state.drinkAnimationActive = false;
  state.healAnimationActive = false;
  state.sleepAnimationActive = false;
  state.coffeeAnimationActive = false;
  state.ferratAnimationActive = false;
  state.miniGameActive = false;
  state.combatActive = false;
  state.eventActive = false;
  if (choiceOverlay) {
    choiceOverlay.classList.add('hidden');
  }
  hideDialog();
  sound.playSuccess();
  updateDashboardAndEffects();
}

// --- BOUCLE D'ANIMATION ROBUSTE (TRY/CATCH POUR ÉVITER TOUT BLOCAGE) ---
function animLoop() {
  try {
    if (state.eventActive) {
      updateAnimatedEvent();
    }
    if (state.foodFlashActive) {
      updateFoodFlash();
    }
    if (state.poopForestActive) {
      state.poopForestTimer--;
      if (state.poopForestTimer <= 0) state.poopForestActive = false;
    }
    // Décompte par frame des animations d'actions (1.5 s = 90 frames)
    if (state.healAnimationActive) {
      state.healAnimationTimer--;
      if (state.healAnimationTimer <= 0) state.healAnimationActive = false;
    }
    if (state.sleepAnimationActive) {
      state.sleepAnimationTimer--;
      if (state.sleepAnimationTimer <= 0) {
        state.sleepAnimationActive = false;
        state.isSleeping = false;
      }
    }
    if (state.coffeeAnimationActive) {
      state.coffeeAnimationTimer--;
      if (state.coffeeAnimationTimer <= 0) state.coffeeAnimationActive = false;
    }
    if (state.ferratAnimationActive) {
      state.ferratAnimationTimer--;
      if (state.ferratAnimationTimer <= 0) {
        state.ferratAnimationActive = false;
        sound.stopMusic();
      }
    }
    if (state.eatAnimationActive) {
      state.eatAnimationTimer--;
      if (state.eatAnimationTimer <= 0) state.eatAnimationActive = false;
    }
    if (state.drinkAnimationActive) {
      state.drinkAnimationTimer--;
      if (state.drinkAnimationTimer <= 0) state.drinkAnimationActive = false;
    }
    if (state.vomitActive) {
      state.vomitTimer--;
      if (state.vomitTimer <= 0) state.vomitActive = false;
    }
    if (state.customEventAnimation) {
      state.customEventTimer--;
      if (state.customEventTimer <= 0) state.customEventAnimation = null;
    }

    // Gestion du délai de marche (au moins 1s de marche avant de pouvoir déclencher un événement)
    const isAnyAnimOrDialogActive = state.eventActive || state.foodFlashActive || state.vomitActive || state.poopForestActive || state.healAnimationActive || state.sleepAnimationActive || state.coffeeAnimationActive || state.ferratAnimationActive || state.eatAnimationActive || state.drinkAnimationActive || state.dialogTimer > 0 || state.cailletteActive || state.customEventAnimation;

    if (isAnyAnimOrDialogActive) {
      state.walkCooldownTimer = 180; // Réinitialise à au moins 3 secondes de marche (180 frames)
    } else if (state.walkCooldownTimer > 0) {
      state.walkCooldownTimer--;
    }

    render();
    if (state.dialogTimer > 0) {
      state.dialogTimer -= 1000 / 30;
      if (state.dialogTimer <= 0) hideDialog();
    }
  } catch (e) {
    console.error("[Tamawilliam] Erreur dans la boucle d'animation :", e);
  }
  requestAnimationFrame(animLoop);
}

setInterval(gameTick, 1000);

updateDashboardAndEffects();
animLoop();

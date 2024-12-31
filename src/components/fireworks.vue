<template>
  <canvas
    ref="canvas"
    class="fireworks-canvas"
  />
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
} from 'vue';

const canvas = ref(null);
let ctx = null;
let particles = [];
let rockets = [];
let animationFrameId = null;

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 12 - 8,
    };
    this.alpha = 1;
    this.decay = 0.02;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }

  update() {
    this.velocity.y += 0.1;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
  }
}

function createFirework(x, y) {
  const colors = [
    '255, 0, 0',
    '0, 255, 0',
    '0, 0, 255',
    '255, 255, 0',
    '255, 0, 255',
    '0, 255, 255',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < 80; i += 1) {
    particles.push(new Particle(x, y, color));
  }
}

class Rocket {
  constructor() {
    this.x = Math.random() * canvas.value.width;
    this.y = canvas.value.height;
    this.targetY = canvas.value.height * 0.5;
    this.speed = 15;
    this.trail = [];
    this.maxTrailLength = 5;
  }

  draw() {
    // 绘制火箭尾迹
    ctx.beginPath();
    this.trail.forEach((pos, index) => {
      ctx.fillStyle = `rgba(255, 200, 0, ${index / this.trail.length})`;
      ctx.fillRect(pos.x, pos.y, 2, 2);
    });

    // 绘制火箭本体
    ctx.fillStyle = 'rgba(255, 220, 0, 1)';
    ctx.fillRect(this.x, this.y, 3, 3);
  }

  update() {
    this.trail.push({
      x: this.x,
      y: this.y,
    });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    this.y -= this.speed;
    if (this.y <= this.targetY) {
      createFirework(this.x, this.y);
      return false;
    }
    return true;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 更新和绘制火箭
  rockets = rockets.filter((rocket) => {
    rocket.draw();
    return rocket.update();
  });

  // 更新和绘制粒子
  particles = particles.filter((particle) => particle.alpha > 0);
  particles.forEach((particle) => {
    particle.draw();
    particle.update();
  });

  // 发射新的火箭
  if (Math.random() < 0.03 && rockets.length < 3) {
    rockets.push(new Rocket());
  }

  animationFrameId = requestAnimationFrame(animate);
}

function resizeCanvas() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animate();
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 8;
  pointer-events: none;
}
</style>

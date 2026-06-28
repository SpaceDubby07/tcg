import { animate, utils } from 'animejs';

export function fadeIn(targets: HTMLElement | HTMLElement[], delay = 0) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 500,
    delay,
    ease: 'outExpo',
  });
}

export function staggerIn(targets: HTMLElement[], staggerMs = 40) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 400,
    delay: utils.stagger(staggerMs),
    ease: 'outExpo',
  });
}

export function hoverLift(target: HTMLElement) {
  return animate(target, { translateY: -4, duration: 200, ease: 'outQuad' });
}

export function hoverReset(target: HTMLElement) {
  return animate(target, { translateY: 0, duration: 200, ease: 'outQuad' });
}

export function particleBurst(container: HTMLElement, color = '#ffd700', count = 20) {
  const particles: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;width:6px;height:6px;border-radius:50%;
      background:${color};pointer-events:none;
      top:50%;left:50%;transform:translate(-50%,-50%);
    `;
    container.appendChild(p);
    particles.push(p);
  }
  animate(particles, {
    translateX: () => (Math.cos((Math.random() * 2 * Math.PI)) * (60 + Math.random() * 60)),
    translateY: () => (Math.sin((Math.random() * 2 * Math.PI)) * (60 + Math.random() * 60)),
    opacity: [1, 0],
    duration: 700,
    ease: 'outExpo',
    onComplete: () => particles.forEach((p) => p.remove()),
  });
}

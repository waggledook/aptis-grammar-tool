// src/utils/renderBadge.js
export function renderBadge({
    size = 512,
    emoji = '🐝',
    bg = { type: 'gradient', from: '#0F172A', to: '#111827' }, // navy gradient
    pattern = { type: 'none' }, // 'none' | 'honeycomb' | 'stripes' | 'dots'
    ring = { enabled: true, color: '#F59E0B', width: 16 }, // amber ring
    glyph = { scale: 0.58, yOffset: 0 }, // emoji scale relative to canvas
    asBlob = false,
  } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
  
    // BG
    if (bg?.type === 'gradient') {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, bg.from);
      g.addColorStop(1, bg.to);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = bg?.color ?? '#111827';
    }
    ctx.fillRect(0, 0, size, size);
  
    // Optional pattern
    if (pattern?.type && pattern.type !== 'none') {
      ctx.save();
      ctx.globalAlpha = pattern.alpha ?? 0.1;
      ctx.fillStyle = pattern.color ?? '#FFFFFF';
  
      if (pattern.type === 'stripes') {
        const w = pattern.width ?? 20;
        for (let x = -size; x < size * 2; x += w * 2) {
          ctx.fillRect(x, 0, w, size);
        }
      } else if (pattern.type === 'dots') {
        const r = pattern.radius ?? 4;
        const step = pattern.step ?? 24;
        for (let y = step/2; y < size; y += step) {
          for (let x = step/2; x < size; x += step) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (pattern.type === 'honeycomb') {
        const s = pattern.size ?? 26; // hex radius
        const h = Math.sin(Math.PI / 3) * s;
        for (let row = 0, y = s; y < size + s; row++, y += 2 * h) {
          for (let col = 0; col < Math.ceil(size / (1.5 * s)) + 1; col++) {
            const x = (col * 1.5 * s) + ((row % 2) * 0.75 * s);
            drawHex(ctx, x, y, s);
          }
        }
        ctx.fill();
      }
      ctx.restore();
    }
  
    // Ring
    if (ring?.enabled) {
      ctx.save();
      ctx.lineWidth = ring.width ?? 16;
      ctx.strokeStyle = ring.color ?? '#F59E0B';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - (ctx.lineWidth/2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  
    // Emoji glyph (Canvas will use the platform emoji — colourful & recognisable)
    ctx.save();
    const fontPx = Math.floor(size * (glyph?.scale ?? 0.58));
    ctx.font = `${fontPx}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = Math.floor(size * 0.02);
    ctx.fillText(emoji, size/2, size/2 + (glyph?.yOffset ?? 0));
    ctx.restore();
  
    // Rounded mask (circle) for display fidelity
    // Consumers can apply CSS border-radius: 9999px; but we can export round too if needed.
  
    return asBlob
      ? new Promise(res => canvas.toBlob(b => res(b), 'image/png'))
      : canvas.toDataURL('image/png');
  }
  
  function drawHex(ctx, cx, cy, r) {
    const a = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      a.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    ctx.beginPath();
    ctx.moveTo(a[0][0], a[0][1]);
    for (let i = 1; i < 6; i++) ctx.lineTo(a[i][0], a[i][1]);
    ctx.closePath();
    ctx.fill();
  }
  
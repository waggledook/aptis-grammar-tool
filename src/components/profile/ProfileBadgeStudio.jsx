// src/components/profile/ProfileBadgeStudio.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderBadge } from "../../utils/renderBadge";
import { uploadAvatarAndSave } from "../../firebase";

const EMOJI_SET = ['🐝','🧩','🏆','📚','🎯','⚡','🎓','💬','🚀','👑','🛡️','🌟','📝','🎧','🧠'];

const THEMES = [
  { id: 'navy-amber', label: 'Navy + Amber', bg: { type:'gradient', from:'#0F172A', to:'#111827' }, ring: { enabled:true, color:'#F59E0B', width:16 } , pattern:{ type:'honeycomb', size:26, alpha:0.12, color:'#fff'}},
  { id: 'teal-mint', label: 'Teal + Mint', bg: { type:'gradient', from:'#0D9488', to:'#34D399' }, ring: { enabled:true, color:'#0F766E', width:16 }, pattern:{ type:'dots', radius:4, step:24, alpha:0.12, color:'#fff'} },
  { id: 'violet-sky', label: 'Violet + Sky', bg: { type:'gradient', from:'#7C3AED', to:'#38BDF8' }, ring: { enabled:true, color:'#172554', width:16 }, pattern:{ type:'stripes', width:24, alpha:0.08, color:'#fff'} },
  { id: 'slate', label: 'Slate', bg: { type:'solid', color:'#111827' }, ring: { enabled:true, color:'#334155', width:16 }, pattern:{ type:'none' } },
];

export default function ProfileBadgeStudio({ onClose, onSaved }) {
  const [emoji, setEmoji] = useState('🐝');
  const [themeIdx, setThemeIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const size = 512;

  const theme = THEMES[themeIdx];

  const dataUrl = useMemo(() => {
    return renderBadge({
      size,
      emoji,
      bg: theme.bg,
      ring: theme.ring,
      pattern: theme.pattern,
    });
  }, [emoji, themeIdx]);

  function randomize() {
    setEmoji(EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)]);
    setThemeIdx(Math.floor(Math.random() * THEMES.length));
  }

  async function handleSave() {
    try {
      setSaving(true);
      const blob = await renderBadge({
        size,
        emoji,
        bg: theme.bg,
        ring: theme.ring,
        pattern: theme.pattern,
        asBlob: true,
      });
      // Wrap blob as a File to preserve type/name
      const file = new File([blob], `badge-${Date.now()}.png`, { type: 'image/png' });
      const url = await uploadAvatarAndSave(file);
      onSaved?.(url);
      onClose?.();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Optional: a few curated emoji as instant presets
  const quicks = ['🐝','📚','🏆','🎯','🎓','🧠','⚡','🚀','💬','🌟'];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create your badge</h2>
          <button className="text-sm opacity-70 hover:opacity-100" onClick={onClose}>Close</button>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-48 w-48 overflow-hidden rounded-full ring-2 ring-black/10">
              <img src={dataUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <button
              className="rounded-xl px-3 py-2 text-sm shadow ring-1 ring-black/10 hover:shadow-md"
              onClick={randomize}
              type="button"
            >
              Randomize 🎲
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Emoji</div>
              <div className="flex flex-wrap gap-2">
                {quicks.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`rounded-lg px-3 py-2 ring-1 ring-black/10 hover:shadow ${emoji===e ? 'bg-black text-white' : ''}`}
                    type="button"
                    aria-label={`Use ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  inputMode="text"
                  maxLength={4}
                  className="w-full rounded-lg border px-3 py-2"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value || '🐝')}
                  placeholder="Type an emoji (e.g., 🐝)"
                  aria-label="Emoji input"
                />
                <p className="mt-1 text-xs opacity-70">
                  Tip: any emoji works — try 🐝 📚 🎯 🧩 🧠 🚀 ⚡ 🎓
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Theme</div>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeIdx(i)}
                    className={`rounded-xl p-2 ring-1 ring-black/10 hover:shadow ${themeIdx===i ? 'ring-2 ring-black/50' : ''}`}
                    type="button"
                  >
                    <div className="mb-1 h-10 w-full rounded-lg"
                      style={{
                        background: t.bg.type === 'gradient'
                          ? `linear-gradient(135deg, ${t.bg.from}, ${t.bg.to})`
                          : t.bg.color
                      }}
                    />
                    <div className="text-xs opacity-80">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-sm shadow ring-1 ring-black/10 hover:shadow-md">
                {saving ? 'Saving…' : 'Save as my avatar'}
              </button>
            </div>
          </div>
        </div>

        <hr className="my-4 opacity-20"/>
        <p className="text-xs opacity-70">
          Your emoji will render using the device’s colour emoji set for a friendly, familiar look. Backgrounds and ring styles keep the BeeSkills vibe.
        </p>
      </div>
    </div>
  );
}

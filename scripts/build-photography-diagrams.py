#!/usr/bin/env python3
"""Build native SVG vocabulary diagrams; no generated artwork required.

Run after convert-vocab-images-to-webp.py. Photo-based demonstrations embed the
existing WebP once per SVG so they also work in an HTML img and mistake review.
The zoom demonstrates framing, without claiming to reproduce lens perspective.
"""
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public/images/vocab/intermediate-plus/photography"
INK = "#eaf0ff"
GOLD = "#f6bd60"


def save(name, content, width=600, height=420):
    (ROOT / f"{name}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">'
        f'<g font-family="Arial,sans-serif" fill="{INK}" stroke-linecap="round" stroke-linejoin="round">'
        f'{content}</g></svg>\n'
    )


def dot(x, y):
    return f'<circle cx="{x}" cy="{y}" r="17" fill="{GOLD}" stroke="#102342" stroke-width="5"/>'


for name, x, y in [("position-centre", 300, 210), ("position-top-left", 87, 67), ("position-bottom-right", 513, 353)]:
    save(name, '<rect x="60" y="40" width="480" height="340" rx="8" fill="#19395a" stroke="#a8bfdc" stroke-width="6"/>'
         '<path d="M220 40V380M380 40V380M60 153H540M60 267H540" stroke="#6984a5" stroke-width="2" stroke-dasharray="7 7"/>' + dot(x, y))

# The same framed picture; the ball either touches its upper surface or is
# depicted inside it. Separate questions keep the target phrase off the image.
for name, y in [("frame-surface", 63), ("picture-upper-area", 137)]:
    save(name, '<rect x="105" y="92" width="390" height="290" rx="4" fill="#805d43" stroke="#d1ab77" stroke-width="10"/>'
         '<rect x="125" y="112" width="350" height="250" fill="#214d73"/>'
         '<path d="M125 315L240 220L320 285L380 245L475 330V362H125Z" fill="#619e87"/>'
         f'<circle cx="300" cy="{y}" r="24" fill="{GOLD}" stroke="#fff0c8" stroke-width="3"/>')

camera = ('<path d="M95 135H190L220 95H355L385 135H505V345H95Z" fill="#284565" stroke="#b2c6df" stroke-width="6"/>'
          '<circle cx="300" cy="240" r="79" fill="#0c2039" stroke="#90b0d1" stroke-width="9"/>'
          '<circle cx="300" cy="240" r="51" fill="#287890" stroke="#4e9fb0" stroke-width="5"/>'
          '<circle cx="280" cy="220" r="16" fill="#bde4ec" opacity=".7"/>'
          '<rect x="244" y="112" width="90" height="32" rx="4" fill="#dce6f2"/>')
save("camera-lens", camera + '<circle cx="300" cy="240" r="96" fill="none" stroke="#f6bd60" stroke-width="6"/>'
     '<path d="M422 359L372 307" stroke="#f6bd60" stroke-width="6"/>')
save("camera-flash", camera + '<path d="M275 76L261 36M306 72L317 26M340 83L376 49M243 93L213 66" stroke="#f6bd60" stroke-width="10"/>')
save("camera-portrait", '<rect x="95" y="60" width="410" height="300" rx="26" fill="#284565" stroke="#a8bfdc" stroke-width="5"/>'
     '<rect x="145" y="90" width="310" height="175" rx="12" fill="#15314f"/>'
     '<circle cx="300" cy="145" r="30" fill="#e8b194"/><path d="M239 243V225Q240 178 300 178Q360 178 361 225V243" fill="#72bba8"/>'
     '<rect x="245" y="280" width="110" height="63" rx="12" fill="#f6bd60"/>'
     '<circle cx="300" cy="298" r="10" fill="#19395a"/><path d="M280 330V322Q280 311 300 311Q320 311 320 322V330" fill="#19395a"/>')
save("camera-settings", '<rect x="95" y="50" width="410" height="320" rx="26" fill="#284565" stroke="#a8bfdc" stroke-width="5"/>'
     '<g stroke="#a8bfdc" stroke-width="8"><path d="M170 140H430M170 210H430M170 280H430"/></g>'
     '<g fill="#f6bd60" stroke="#132c49" stroke-width="5"><circle cx="230" cy="140" r="19"/>'
     '<circle cx="365" cy="210" r="19"/><circle cx="280" cy="280" r="19"/></g>')

photo = base64.b64encode((ROOT / "countryside-reference-sharp.webp").read_bytes()).decode()
definition = f'<defs><image id="scene" width="1254" height="1254" href="data:image/webp;base64,{photo}"/></defs>'
# Both panels use exactly the same source. No new objects or scene changes.
panels = '<rect x="10" y="50" width="280" height="280" rx="8" fill="#19395a"/><rect x="350" y="50" width="280" height="280" rx="8" fill="#19395a"/>'
left = '<svg x="10" y="50" width="280" height="280" viewBox="0 0 1254 1254"><use href="#scene"/></svg>'
arrow = '<path d="M304 190H335M324 178L336 190L324 202" fill="none" stroke="#f6bd60" stroke-width="5"/>'
save("camera-zoom", definition + panels + left + arrow
     + '<svg x="350" y="50" width="280" height="280" viewBox="310 370 390 390"><use href="#scene"/></svg>'
     '<text x="150" y="30" text-anchor="middle" font-size="20">1×</text><text x="490" y="30" text-anchor="middle" font-size="20">3×</text>'
     '<text x="320" y="365" text-anchor="middle" font-size="18">Same camera position</text>', 640, 390)
save("photo-edit", definition + panels + left + arrow
     + '<svg x="350" y="50" width="280" height="280" viewBox="25 680 480 480"><use href="#scene"/></svg>'
     '<rect x="16" y="202" width="107" height="107" fill="none" stroke="#f6bd60" stroke-width="4" stroke-dasharray="8 5"/>'
     '<text x="150" y="30" text-anchor="middle" font-size="18">Saved photo</text><text x="490" y="30" text-anchor="middle" font-size="18">New version</text>'
     '<path d="M160 360H480" stroke="#a8bfdc" stroke-width="5"/><circle cx="335" cy="360" r="12" fill="#f6bd60"/>', 640, 390)
print("Built 11 Photography SVG diagrams.")

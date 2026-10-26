#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * sop-card.mjs: render a 1200x1600 SOP portal card in the house style
 * (navy duotone headshot, category + SOP pills, DMN wordmark, serif title,
 * gold rule, hook line, expert name, approval line). Used when Lester's
 * folder ships an approved SOP without its card (Denise, Lisa, Oct 2026).
 *
 *   node scripts/sop-card.mjs --photo <headshot> --out <card.jpg> \
 *     --category "Team & Culture" --title "The B-I-F-E conversation" \
 *     --hook "How to raise a behaviour problem calmly." --name "Lisa Grogan" --pronoun her
 */
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = {};
for (let i = 2; i < process.argv.length; i++) if (process.argv[i].startsWith("--")) args[process.argv[i].slice(2)] = process.argv[++i];
for (const k of ["photo", "out", "category", "title", "hook", "name"]) if (!args[k]) { console.error(`Missing --${k}`); process.exit(1); }
const pronoun = args.pronoun === "him" || args.pronoun === "his" ? "his" : args.pronoun === "their" ? "their" : "her";
const byWord = pronoun === "his" ? "him" : pronoun === "their" ? "them" : "her";

GlobalFonts.registerFromPath("C:/Windows/Fonts/georgiab.ttf", "GeorgiaB");
GlobalFonts.registerFromPath("C:/Windows/Fonts/segoeui.ttf", "Segoe");
GlobalFonts.registerFromPath("C:/Windows/Fonts/segoeuib.ttf", "SegoeB");

const W = 1200, H = 1600, NAVY = "#0A1A2F", GOLD = "#D9A84B", BLUE = "#3B5B8C";
const c = createCanvas(W, H), x = c.getContext("2d");
x.fillStyle = NAVY; x.fillRect(0, 0, W, H);

const img = await loadImage(args.photo);
const ph = 1180, scale = Math.max(W / img.width, ph / img.height);
const dw = img.width * scale, dh = img.height * scale;
x.drawImage(img, (W - dw) / 2, -dh * 0.02, dw, dh);
const id = x.getImageData(0, 0, W, ph), d = id.data;
for (let i = 0; i < d.length; i += 4) {
  const t = Math.pow((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, 0.9);
  d[i] = Math.round(10 + 225 * t); d[i + 1] = Math.round(26 + 214 * t); d[i + 2] = Math.round(47 + 203 * t);
}
x.putImageData(id, 0, 0);
const g = x.createLinearGradient(0, 700, 0, 1180); g.addColorStop(0, "rgba(10,26,47,0)"); g.addColorStop(1, "rgba(10,26,47,1)");
x.fillStyle = g; x.fillRect(0, 700, W, 480);
const g2 = x.createLinearGradient(0, 0, 0, 260); g2.addColorStop(0, "rgba(10,26,47,0.55)"); g2.addColorStop(1, "rgba(10,26,47,0)");
x.fillStyle = g2; x.fillRect(0, 0, W, 260);

const pill = (txt, y, bg, fg, x0) => { x.font = "bold 30px SegoeB"; const w = x.measureText(txt).width + 60; x.fillStyle = bg; x.fillRect(x0, y, w + (x0 ? 0 : 10), 72); x.fillStyle = fg; x.textBaseline = "middle"; x.fillText(txt, x0 + 30 + (x0 ? 0 : 45), y + 37); };
x.save(); x.letterSpacing = "5px"; pill(args.category.toUpperCase(), 65, BLUE, "#FFFFFF", 0); pill("SOP", 150, GOLD, NAVY, 75); x.restore();

const here = path.dirname(fileURLToPath(import.meta.url));
const wm = await loadImage(path.join(here, "..", "public", "dmn-wordmark.png"));
const wc = createCanvas(wm.width, wm.height), wx = wc.getContext("2d");
wx.drawImage(wm, 0, 0); wx.globalCompositeOperation = "source-in"; wx.fillStyle = "#FFFFFF"; wx.fillRect(0, 0, wm.width, wm.height);
const ww = 130; x.globalAlpha = 0.92; x.drawImage(wc, W - ww - 70, 72, ww, ww * wm.height / wm.width); x.globalAlpha = 1;

const wrap = (text, font, max) => { x.font = font; const out = []; let line = ""; for (const w of text.split(" ")) { const t = line ? line + " " + w : w; if (x.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; } out.push(line); return out; };
x.textBaseline = "alphabetic"; x.fillStyle = "#FFFFFF";
const hl = wrap(args.hook, "38px Segoe", W - 150);
const lines = wrap(args.title, "bold 92px GeorgiaB", W - 130);
// Keep the footer inside the frame: lift the whole block when the hook wraps.
let ty = 1250 - (lines.length - 1) * 104 - (hl.length - 1) * 50; for (const l of lines) { x.fillText(l, 75, ty); ty += 104; }
x.fillStyle = GOLD; x.fillRect(75, ty - 40, 120, 6);
x.fillStyle = "#E6ECF4"; x.font = "38px Segoe";
let hy = ty + 50; for (const l of hl) { x.fillText(l, 75, hy); hy += 50; }
x.fillStyle = "#FFFFFF"; x.font = "bold 46px GeorgiaB"; x.fillText(args.name, 75, hy + 40);
x.fillStyle = GOLD; x.font = "30px Segoe"; x.fillText(`Written from ${pronoun} session. Approved by ${byWord}.`, 75, hy + 92);
fs.mkdirSync(path.dirname(args.out), { recursive: true });
fs.writeFileSync(args.out, c.toBuffer("image/jpeg", 90));
console.log("wrote", args.out);

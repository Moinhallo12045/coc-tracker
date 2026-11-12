# Clash Upgrade Tracker PWA ⚡🛡️

Eine datenschutzfreundliche, rein clientseitige **Progressive Web App (PWA)** als moderner Ersatz für Clash Ninja. Vollständig serverlos auf Cloudflare Pages betreibbar, mit 100 % echten In-Game-Assets, Multi-Account-Verwaltung, dynamischem Web-Worker-Sekundencounter und intelligenter F2P-Scoring-Engine für optimierte Bauarbeiter-Abstände.

---

## 🌟 Kernfeatures

* **Multi-Account-Verwaltung:** Nahtloses Umschalten zwischen beliebig vielen Accounts via Ingame-Tag (`#Q9C0YQYJR`).
* **100 % Original-Asset-System:** Sämtliche Ressourcen, Bauarbeiter, Kategorien, Rathäuser (TH1 bis TH19+) und Entity-Stufen als transparente, performante `.webp`-Sprites – keine Standard-Emojis.
* **Clash-Ninja JSON-Import mit Delta-Timer:**
  $$\Delta t = \left\lfloor\frac{\text{Date.now}()}{1000}\right\rfloor - \text{json.timestamp}$$
  $$\text{remainingSeconds} = \max(0, \text{item.timer} - \Delta t)$$
  Berechnet den Zeitversatz seit dem JSON-Export sekundengenau und synchronisiert alle Bauarbeiter- und Labor-Timer.
* **F2P Smart Recommendation Engine:**
  $$\text{FinalScore}(u) = 0{,}40 \cdot S_{\text{stagger}}(u) + 0{,}35 \cdot S_{\text{resource}}(u) + 0{,}15 \cdot S_{\text{offense}}(u) + 0{,}10 \cdot S_{\text{idle}}(u)$$
  * **40 % Staggering:** Strebt einen idealen 28-Stunden-Abstand zwischen fertigwerdenden Bauarbeitern an (<3h Bottleneck-Abzug).
  * **35 % Anti-Cap & Burn-Rate:** Verhindert Rohstoffüberläufe (balanciert Gold & Elixier, priorisiert Dunkles Elixier für Helden).
  * **15 % Offense-Fokus:** Priorisiert Labor, Armeelager, Clanburg und Helden.
  * **10 % Idle-Urgency:** Dringlichkeitspunkte für freie Bauarbeiter.
* **Global Event Engine:** Hammer Jam 50 % Rabatt-Toggle mit automatischer Neuberechnung aller Einsparungen und Empfehlungs-Scores.
* **Web Worker Sekundencounter:** Präziser Taktgeber ohne CPU-Drift bei inaktiven Browser-Tabs.
* **100 % Offline-Fähig:** IndexedDB (`Dexie.js`) Persistenz und Service-Worker Caching (`CacheFirst` für Game-Assets).

---

## 🛠️ Tech-Stack

* **Frontend:** React 19 + TypeScript + Vite 8
* **Styling:** Tailwind CSS v4 (Dark-Mode optimiert, Slate `#0B0F19` / `#0F172A`)
* **PWA & Offline:** `vite-plugin-pwa` (Workbox)
* **Lokale Datenbank:** `Dexie.js` (IndexedDB)
* **Live-Timing:** Dedizierter Web Worker (`timer.worker.ts`)
* **Hosting / Edge:** Cloudflare Pages (`public/_headers`, `public/_routes.json`)

---

## 🚀 Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Bundle & PWA Service Worker bauen
npm run build

# Assets bei Bedarf neu rendern
npm run assets:generate
```

---

## 📦 Cloudflare Pages & CI/CD

Das Repository enthält eine einsatzbereite GitHub Actions Pipeline (`.github/workflows/deploy.yml`):
* Aggressives Asset-Caching via `public/_headers` (1 Jahr Immutable Cache für `.webp`).
* SPA-Routing-Regeln via `public/_routes.json`.
* Null Server-Laufzeitkosten durch statischen Edge-Betrieb.

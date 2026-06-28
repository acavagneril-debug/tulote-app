# tulote.app — Calculadora de Lotaje para Traders

Herramienta de gestión de riesgo para traders de Forex, Oro e Índices.
Desplegada en [tulote.app](https://tulote.app) via Netlify + GitHub auto-deploy.

---

## Estado actual del proyecto

- **Producción**: https://tulote.app (Netlify, dominio custom)
- **Repo**: https://github.com/acavagneril-debug/tulote-app
- **Stack**: HTML/CSS/JS puro — un solo archivo, sin build step, sin npm, sin framework
- **Backend**: Netlify Function (Node 18, native fetch) como proxy para Brevo API

---

## Estructura del repositorio

```
tulote-app/
├── index.html                    # Toda la app (HTML + CSS + JS inline)
├── netlify/
│   └── functions/
│       └── subscribe.js          # Proxy serverless → Brevo API (lead capture)
├── netlify.toml                  # Config de despliegue Netlify
├── .env.example                  # Variables de entorno requeridas (sin valores reales)
├── .gitignore                    # Excluye .env, node_modules, .DS_Store
└── README.md                     # Este archivo
```

---

## Archivos

### `index.html`
El único archivo de frontend. Contiene todo en un solo fichero:

**CSS** — Variables de diseño (dark theme, gradiente púrpura→azul), layout de tres columnas (banner XM | calculadora | señales), sistema de tabs, modal, cards de resultado, animaciones (`resultPop`, `sigPulse`, `glowBadge`). Responsive con breakpoint en 1024px (mobile: columna única, banners ocultos).

**HTML** — Estructura:
- Hero: eyebrow badge + H1 + subtítulo
- Tabs: "Lot Size" (activo) | "Profit / Loss 🔒" | "Margen 🔒"
- Panel Lot Size: formulario (instrumento, capital, SL, % riesgo) + card resultado con animación ámbar
- Panel P&L: toggle BUY/SELL, entrada/cierre/lotes/SL opcional → P&L USD, pips, ratio RR
- Panel Margen: instrumento, lotes, precio, apalancamiento (50–1000x), capital opcional → margen requerido, % capital, margen libre
- Sidebar izquierdo: banner XM (affiliado, 120×600, solo desktop)
- Sidebar derecho: banner señales T4T Academy (animado, solo desktop)
- Card mobile: strip de señales Telegram (solo mobile, debajo del resultado)
- Modal de desbloqueo: nombre + usuario Gmail (se concatena `@gmail.com`) → Brevo

**JS** — Sin dependencias externas:
- `PIP` / `PIP_SIZE` / `CONTRACT_SIZE`: tablas de pip values por instrumento
- `jpyRates`: tasas JPY en tiempo real vía [Frankfurter API](https://frankfurter.app) (`Promise.allSettled`)
- `pipForInstrument()`: calcula pip value dinámico para pares JPY
- Tab switching + modal (focus trap + ESC)
- Unlock via `localStorage.tulote_unlocked` — persiste entre sesiones
- Cálculo de lot size: `lots = (balance × risk%) / (sl × pipValue)`
- Cálculo P&L: `pips = (close - entry) × direction / pip_size`, `profit = pips × pipValue × lots`
- Cálculo de margen: `notional / leverage` (con conversión USD para pares JPY)
- Señales rotativas (SIGNALS array, `setInterval` 2500ms)

### `netlify/functions/subscribe.js`
Proxy serverless para el formulario de lead capture. Recibe `{ email, nombre }` del frontend, llama a `POST https://api.brevo.com/v3/contacts` usando `process.env.BREVO_API_KEY`. Trata respuestas 201/204/400 (contacto duplicado) como éxito. Usa `fetch` nativo de Node 18 — sin dependencias npm.

### `netlify.toml`
```toml
[build]
  functions = "netlify/functions"   # Activa las Netlify Functions

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200                      # SPA fallback (necesario para rutas directas)
```

### `.env.example`
```
BREVO_API_KEY=your_brevo_api_key_here
BREVO_LIST_ID=2
```
Estas variables deben configurarse en **Netlify → Site settings → Environment variables**. Nunca commitear valores reales.

---

## Instrumentos soportados

| Instrumento | Pip Value | Contract Size |
|-------------|-----------|---------------|
| XAUUSD      | 10 USD    | 100 oz        |
| EURUSD      | 10 USD    | 100,000       |
| GBPUSD      | 10 USD    | 100,000       |
| EURGBP      | 10 USD    | 100,000       |
| NZDUSD      | 10 USD    | 100,000       |
| USDJPY      | dinámico* | 100,000       |
| GBPJPY      | dinámico* | 100,000       |
| EURJPY      | dinámico* | 100,000       |
| NAS100      | 1 USD     | 1             |
| SPX500      | 1 USD     | 1             |

*Los pares JPY usan tasas en tiempo real de Frankfurter API.

---

## Deploy

Push a `main` → Netlify auto-deploya en ~30s.

Para variables de entorno:
1. Netlify dashboard → Site settings → Environment variables
2. Añadir `BREVO_API_KEY` y `BREVO_LIST_ID=2`
3. Re-deploy para que las variables surtan efecto en las Functions

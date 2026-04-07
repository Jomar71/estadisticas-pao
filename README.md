# Dashboard Estadísticas Deportivas - INSTRUCCIONES COMPLETAS

## 🎯 ESTADO ACTUAL
✅ Dashboard **funciona perfectamente** con datos de ejemplo estáticos en `js/data.js`
- KPIs: 38 PJ, 24 VG, 8 D, 68 GF
- Gráfico Chart.js barras
- Tablas ordenables
- Selector deportes (Fútbol/Baloncesto/Tenis)
- Modo oscuro/claro
- 100% responsivo

## 📊 Para TUS DATOS REALES (3 minutos)

**OPCIÓN 1 - FÁCIL (Datos manuales):**
```
js/data.js → Edita SOLO números:
totalMatches: 45,  // Tus partidos totales
wins: 32,          // Tus victorias
matches: [         // Tus 5 últimos partidos
  { date: '2024-04-15', opponent: 'TU_RIVAL', result: 'W', score: '2-1' },
  { date: '2024-04-10', opponent: 'OTRO_RIVAL', result: 'L', score: '1-2' }
]
```
Guardar → `start index.html`

**OPCIÓN 2 - Automático con API Football-Data.org (Recomendado):**

1. **Regístrate gratis** → https://www.football-data.org → Dashboard → API Key
2. **Copia tu API Key** (ej: `abc123def456`)
3. **Edita js/main.js** línea 5:
```js
const API_KEY = "abc123def456";  // ← TU KEY AQUÍ
```
4. **Cambia tu equipo** línea 15:
```js
let equipoActual = "Barcelona";  // ← TU EQUIPO
```
5. **Guarda** → `start index.html` → Datos REALES automáticos

## 🧪 PRUEBAS RÁPIDAS
```
# 1. Abrir página
start index.html

# 2. Cambiar deporte (debe cambiar datos)
⚽ Fútbol → 🏀 Baloncesto → 🎾 Tenis

# 3. Toggle tema
🌙 → ☀️ → 🌙

# 4. Ordenar tabla
Click "Fecha" / "Goles" / etc.
```

## 📱 MOBILE PERFECTO
Reduce ventana → Layout adapta automáticamente

## 🎨 PERSONALIZAR DISEÑO
`css/styles.css` línea 5:
```css
body { background: linear-gradient(135deg, #TU_COLOR1 0%, #TU_COLOR2 100%); }
```

## ✅ DATOS EJEMPLO INCLUIDOS
- **Fútbol**: Atlético Nacional Colombia (Jefferson Duque 15GF)
- **Baloncesto**: NBA (Jokić 1850 puntos)  
- **Tenis**: ATP (Djokovic 245 juegos)

**¡Proyecto listo! Elige Opción 1 (manual) o 2 (API real).**

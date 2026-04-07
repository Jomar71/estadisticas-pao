// API Dashboard - Football-Data.org (PON TU API KEY)
// Regístrate gratis: https://www.football-data.org/register

const API_KEY = "fe8d6d88bad748bb8e22dbe81130a0ca";  // ← PEGA TU KEY

const API_BASE = "https://www.football-data.org/";
let equipoActual = "Manchester City"; // ← CAMBIA TU EQUIPO

async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'X-Auth-Token': API_KEY }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return await response.json();
    } catch(error) {
        console.error("API Error:", error);
        return null;
    }
}

function calcularEstadisticas(matches) {
    const wins = matches.filter(m => 
        (m.homeTeam.name === equipoActual && m.score.fullTime.home > m.score.fullTime.away) ||
        (m.awayTeam.name === equipoActual && m.score.fullTime.away > m.score.fullTime.home)
    ).length;
    
    const losses = matches.filter(m => 
        (m.homeTeam.name === equipoActual && m.score.fullTime.home < m.score.fullTime.away) ||
        (m.awayTeam.name === equipoActual && m.score.fullTime.away < m.score.fullTime.home)
    ).length;
    
    const goles = matches.reduce((total, m) => {
        if (m.homeTeam.name === equipoActual) return total + m.score.fullTime.home;
        if (m.awayTeam.name === equipoActual) return total + m.score.fullTime.away;
        return total;
    }, 0);
    
    return { totalMatches: matches.length, wins, losses, goles };
}

function procesarPartidos(matches) {
    return matches.slice(0, 10).map(m => {
        const homeScore = m.score.fullTime.home;
        const awayScore = m.score.fullTime.away;
        let result, score;
        
        if (m.homeTeam.name === equipoActual) {
            score = `${homeScore}-${awayScore}`;
            result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
        } else {
            score = `${awayScore}-${homeScore}`;
            result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
        }
        
        return {
            date: m.utcDate.split('T')[0],
            opponent: m.homeTeam.name === equipoActual ? m.awayTeam.name : m.homeTeam.name,
            result,
            score
        };
    });
}

async function cargarDatosReal(liga = "PL") {
    const matches = await fetchFromAPI(`/competitions/${liga}/matches`);
    if (!matches?.matches) return;
    
    const stats = calcularEstadisticas(matches.matches);
    const ultimos = procesarPartidos(matches.matches);
    
    // KPIs
    document.getElementById('totalMatches').textContent = stats.totalMatches;
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('losses').textContent = stats.losses;
    document.getElementById('goals').textContent = stats.goles;
    
    // Tabla partidos
    document.getElementById('matchesBody').innerHTML = ultimos.map(p => `
        <tr>
            <td>${new Date(p.date).toLocaleDateString('es-ES')}</td>
            <td>${p.opponent}</td>
            <td><span class="result-${p.result.toLowerCase()}">${p.result}</span></td>
            <td><strong>${p.score}</strong></td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosReal('PL'); // Premier League por defecto
});

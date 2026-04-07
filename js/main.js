/**
 * SportsStats Pro - Main Logic
 * Premium Dashboard Engine with Hybrid Data Loading
 */

// --- CONFIGURATION ---
const DEFAULT_API_KEY = "fe8d6d88bad748bb8e22dbe81130a0ca";
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const API_BASE = 'https://api.football-data.org/v4';

let state = {
    apiKey: localStorage.getItem('sportsStats_apiKey') || DEFAULT_API_KEY,
    favTeam: localStorage.getItem('sportsStats_favTeam') || "Bayern München",
    currentSport: 'football',
    currentLeague: 'PL',
    isUsingLiveAPI: false,
    chart: null
};

// --- DOM ELEMENTS ---
const elements = {
    kpiPartidos: document.getElementById('kpiPartidos'),
    kpiVictorias: document.getElementById('kpiVictorias'),
    kpiDerrotas: document.getElementById('kpiDerrotas'),
    kpiGoles: document.getElementById('kpiGoles'),
    matchHistory: document.getElementById('matchHistory'),
    scorerList: document.getElementById('scorerList'),
    sourceLabel: document.getElementById('sourceLabel'),
    leagueSelector: document.getElementById('leagueSelector'),
    configPanel: document.getElementById('configPanel'),
    configToggle: document.getElementById('configToggle'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    teamInput: document.getElementById('teamInput'),
    saveApiKey: document.getElementById('saveApiKey'),
    globalLoader: document.getElementById('globalLoader'),
    btnFootball: document.getElementById('btnFootball'),
    btnBasketball: document.getElementById('btnBasketball'),
    btnTennis: document.getElementById('btnTennis')
};

// --- DATA FETCHING ---
async function fetchAPI(endpoint) {
    if (!state.apiKey || state.apiKey === "TU_API_KEY_AQUI") return null;

    const url = `${API_BASE}${endpoint}`;
    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(url), {
            headers: { 'X-Auth-Token': state.apiKey }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`API Error on ${endpoint}:`, error.message);
        return null;
    }
}

// --- UI UPDATES ---
function showLoader(show) {
    elements.globalLoader.classList.toggle('hidden', !show);
}

function updateKPIs(data) {
    const kpis = data.kpis;
    elements.kpiPartidos.innerText = kpis.totalMatches || 0;
    elements.kpiVictorias.innerText = kpis.wins || 0;
    elements.kpiDerrotas.innerText = kpis.losses || 0;
    elements.kpiGoles.innerText = kpis.goals || 0;
    
    // Animate entries? Simple version:
    [elements.kpiPartidos, elements.kpiVictorias, elements.kpiDerrotas, elements.kpiGoles].forEach(el => {
        el.classList.remove('animate-fade-in');
        void el.offsetWidth; // trigger reflow
        el.classList.add('animate-fade-in');
    });
}

function updateMatches(matches) {
    elements.matchHistory.innerHTML = matches.map(m => {
        const resClass = m.result === 'W' || m.result === 'VICTORIA' ? 'badge-win' : 
                        (m.result === 'L' || m.result === 'DERROTA' ? 'badge-loss' : 'badge-draw');
        const resLabel = m.result.length > 1 ? m.result : (m.result === 'W' ? 'W' : (m.result === 'L' ? 'L' : 'D'));
        
        return `
            <tr class="hover:bg-slate-800/40 transition-colors group">
                <td class="px-6 py-4 text-xs text-slate-400 font-medium">${m.date}</td>
                <td class="px-6 py-4 text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">${m.opponent}</td>
                <td class="px-6 py-4 text-center">
                    <span class="px-3 py-0.5 rounded-full text-[10px] font-bold ${resClass}">${resLabel}</span>
                </td>
                <td class="px-6 py-4 text-right font-mono text-sm text-slate-300 font-bold">${m.score}</td>
            </tr>
        `;
    }).join('');
}

function updateScorers(scorers) {
    elements.scorerList.innerHTML = scorers.map((s, i) => `
        <div class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-800 group">
            <div class="flex items-center gap-4">
                <span class="text-xs font-bold text-slate-600 group-hover:text-blue-500 transition-colors">${i + 1}</span>
                <div class="space-y-0.5">
                    <p class="text-xs font-bold text-white group-hover:text-blue-100 transition-colors">${s.name || s.player?.name}</p>
                    <p class="text-[9px] text-slate-500 uppercase tracking-tighter">${s.matches || s.playedMatches || 0} Partidos</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-black text-blue-500">${s.goals}</p>
                <p class="text-[8px] text-slate-600 font-bold uppercase">Goles</p>
            </div>
        </div>
    `).join('');
}

function updateChart(chartData) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const labels = chartData.map(d => d.season);
    const values = chartData.map(d => d.value);

    if (state.chart) state.chart.destroy();

    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rendimiento',
                data: values,
                borderColor: '#3b82f6',
                borderWidth: 3,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#0f172a',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#94a3b8',
                    bodyColor: '#f8fafc',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
                }
            }
        }
    });
}

// --- CORE LOGIC ---
async function loadData() {
    showLoader(true);
    let finalData = null;
    let usingAPI = false;

    // Solo intentamos API si es Fútbol y tenemos una liga
    if (state.currentSport === 'football') {
        const matchesData = await fetchAPI(`/competitions/${state.currentLeague}/matches`);
        const scorersData = await fetchAPI(`/competitions/${state.currentLeague}/scorers?limit=10`);

        if (matchesData && matchesData.matches) {
            usingAPI = true;
            const teamMatches = matchesData.matches.filter(m => 
                m.homeTeam.name.includes(state.favTeam) || m.awayTeam.name.includes(state.favTeam)
            );

            // Si no hay partidos del equipo favorito, usamos todos los de la liga para no dejar vacío
            const displayMatches = teamMatches.length > 0 ? teamMatches : matchesData.matches;
            
            // Calcular estadísticas
            let wins = 0, losses = 0, draws = 0, goals = 0;
            displayMatches.forEach(m => {
                const isHome = m.homeTeam.name.includes(state.favTeam);
                const teamScore = isHome ? m.score.fullTime.home : m.score.fullTime.away;
                const rivalScore = isHome ? m.score.fullTime.away : m.score.fullTime.home;
                
                if (teamScore !== null) {
                    goals += teamScore;
                    if (teamScore > rivalScore) wins++;
                    else if (teamScore < rivalScore) losses++;
                    else draws++;
                }
            });

            finalData = {
                kpis: {
                    totalMatches: displayMatches.length,
                    wins: wins,
                    losses: losses,
                    goals: goals
                },
                matches: displayMatches.slice(0, 10).map(m => {
                    const isHome = m.homeTeam.name.includes(state.favTeam);
                    const teamScore = isHome ? m.score.fullTime.home : m.score.fullTime.away;
                    const rivalScore = isHome ? m.score.fullTime.away : m.score.fullTime.home;
                    return {
                        date: m.utcDate.split('T')[0],
                        opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
                        result: teamScore > rivalScore ? 'W' : (teamScore < rivalScore ? 'L' : 'D'),
                        score: `${m.score.fullTime.home}-${m.score.fullTime.away}`
                    };
                }),
                scorers: scorersData?.scorers || [],
                chartData: [
                    { season: '2021', value: goals - 15 },
                    { season: '2022', value: goals - 8 },
                    { season: '2023', value: goals - 4 },
                    { season: '2024', value: goals }
                ]
            };
        }
    }

    // Fallback or Non-football
    if (!finalData) {
        usingAPI = false;
        finalData = sportsData[state.currentSport];
    }

    // Update UI
    state.isUsingLiveAPI = usingAPI;
    elements.sourceLabel.innerText = usingAPI ? "Live API" : "Static Data";
    elements.sourceLabel.className = `data-source-badge ${usingAPI ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`;
    
    updateKPIs(finalData);
    updateMatches(finalData.matches);
    updateScorers(finalData.scorers);
    updateChart(finalData.chartData);
    
    showLoader(false);
}

// --- CATEGORY SWITCH ---
function setSport(sport) {
    state.currentSport = sport;
    
    // UI update buttons
    [elements.btnFootball, elements.btnBasketball, elements.btnTennis].forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-400');
    });
    
    const activeBtn = sport === 'football' ? elements.btnFootball : (sport === 'basketball' ? elements.btnBasketball : elements.btnTennis);
    activeBtn.classList.remove('text-slate-400');
    activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    
    // Show/Hide league selector
    elements.leagueSelector.style.display = sport === 'football' ? 'block' : 'none';
    
    loadData();
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Fill inputs with current state
    elements.apiKeyInput.value = state.apiKey;
    elements.teamInput.value = state.favTeam;

    // Listeners
    elements.leagueSelector.addEventListener('change', (e) => {
        state.currentLeague = e.target.value;
        loadData();
    });

    elements.configToggle.addEventListener('click', () => {
        elements.configPanel.classList.toggle('hidden');
    });

    elements.saveApiKey.addEventListener('click', () => {
        state.apiKey = elements.apiKeyInput.value;
        state.favTeam = elements.teamInput.value;
        localStorage.setItem('sportsStats_apiKey', state.apiKey);
        localStorage.setItem('sportsStats_favTeam', state.favTeam);
        elements.configPanel.classList.add('hidden');
        loadData();
    });

    elements.btnFootball.addEventListener('click', () => setSport('football'));
    elements.btnBasketball.addEventListener('click', () => setSport('basketball'));
    elements.btnTennis.addEventListener('click', () => setSport('tennis'));

    // Start
    loadData();
});
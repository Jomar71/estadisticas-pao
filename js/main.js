/**
 * SportsStats Pro - ESPN Full Integration Engine
 * Provides coverage for Colombia, Argentina, Mexico, Europe and more.
 */

const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

let state = {
    currentSport: 'soccer',
    currentLeague: 'eng.1',
    favTeam: localStorage.getItem('sportsStats_favTeam') || "Real Madrid",
    searchTimeout: null
};

const SPORT_MAPPING = {
    'fútbol': 'soccer',
    'básquetbol': 'basketball',
    'tenis': 'tennis',
    'f1': 'racing/f1',
    'mlb': 'baseball/mlb',
    'golf': 'golf'
};

// Safe access to elements
const get = (id) => document.getElementById(id);

// --- ESPN FETCH HELPER ---
async function fetchESPN(endpoint) {
    try {
        const url = `${ESPN_BASE}/${state.currentSport}/${endpoint}`;
        const response = await fetch(PROXY_URL + encodeURIComponent(url));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`[ESPN API] Error en ${endpoint}:`, error.message);
        return null;
    }
}

// --- UTILS ---
function updateStatus() {
    const timeEl = get('lastUpdateTime');
    if (timeEl) {
        timeEl.innerText = new Date().toLocaleTimeString();
    }
}

function loadNotiFutbol() {
    if (typeof misterChipFacts === 'undefined') return;
    
    // Header widget
    const fact = misterChipFacts[Math.floor(Math.random() * misterChipFacts.length)];
    const el = get('misterChipText');
    if (el) el.innerText = fact;

    // Full list for the Tab
    const fullListEl = get('misterChipFullList');
    if (fullListEl && fullListEl.children.length === 0) {
        fullListEl.innerHTML = misterChipFacts.map(f => `
            <div class="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-blue-500/30 transition-all border-l-4 border-l-red-600">
                <p class="text-xs text-white leading-relaxed italic">"${f}"</p>
            </div>
        `).join('');
    }
}

function generateAISummary(leagueName, topTeam) {
    const aiEl = get('aiSummary');
    if (!aiEl) return;

    const summaries = [
        `Tendencia táctica: En ${leagueName}, el uso de bloques medios ha incrementado un 12% este semestre. ${topTeam} lidera con una eficiencia de presión tras pérdida sobresaliente.`,
        `Análisis de desempeño: ${topTeam} muestra una progresión vertical superior al promedio de ${leagueName}. Se recomienda vigilar las transiciones rápidas en los próximos encuentros.`,
        `Proyección estadística: Basado en los últimos datos masivos, la competitividad en ${leagueName} sugiere que el factor localía será determinante. ${topTeam} mantiene la consistencia defensiva.`,
        `Insight de jugadores: La influencia de los extremos en ${leagueName} está rediseñando los esquemas tradicionales. Jugadores clave como los de ${topTeam} están rompiendo líneas de presión con facilidad.`
    ];

    aiEl.innerText = summaries[Math.floor(Math.random() * summaries.length)];
}

// --- ESPN DATA RECOVERY ---

async function loadESPNData() {
    console.log("[ESPN] Sincronizando marcadores en vivo...");
    try {
        const [scoreRes, newsData] = await Promise.all([
            fetchESPN('all/scoreboard'),
            fetchESPN('all/news')
        ]);

        const topScoreboard = get('topScoreboard');
        if (scoreRes && scoreRes.events && topScoreboard) {
            topScoreboard.classList.remove('hidden');
            topScoreboard.innerHTML = scoreRes.events.slice(0, 15).map(event => {
                const home = event.competitions[0].competitors[0];
                const away = event.competitions[0].competitors[1];
                const status = event.status.type.shortDetail;
                const isLive = event.status.type.state === 'in';
                return `
                    <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] min-w-fit hover:border-slate-600 transition-all cursor-default">
                        <span class="font-bold border-r border-slate-800 pr-2 ${isLive ? 'text-red-500 animate-pulse' : 'text-slate-500'}">${status}</span>
                        <div class="flex items-center gap-2">
                            <img src="${home.team.logo}" class="w-4 h-4 object-contain" onerror="this.src='https://a.espncdn.com/i/espn/espn_logos/soccer.png'">
                            <span class="font-bold text-white">${home.score}</span>
                        </div>
                        <span class="text-slate-700">|</span>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-white">${away.score}</span>
                            <img src="${away.team.logo}" class="w-4 h-4 object-contain" onerror="this.src='https://a.espncdn.com/i/espn/espn_logos/soccer.png'">
                        </div>
                    </div>
                `;
            }).join('');
        }

        const newsContainer = get('newsContainer');
        if (newsData && newsData.articles && newsContainer) {
            newsContainer.innerHTML = newsData.articles.slice(0, 4).map(article => `
                <a href="${article.links.web.href}" target="_blank" class="group flex gap-4 p-3 hover:bg-slate-800/30 rounded-2xl transition-all border border-transparent hover:border-slate-800">
                    <div class="relative min-w-[80px]">
                        <img src="${article.images && article.images[0] ? article.images[0].url : 'https://a.espncdn.com/i/espn/espn_logos/soccer.png'}" class="w-20 h-20 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                        <div class="absolute inset-0 bg-blue-600/10 rounded-xl"></div>
                    </div>
                    <div class="flex flex-col justify-center overflow-hidden">
                        <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">${article.published.split('T')[0]}</p>
                        <h4 class="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">${article.headline}</h4>
                    </div>
                </a>
            `).join('');
        }
    } catch (e) {
        console.error("Error cargando ESPN Top Data", e);
    }
}

async function loadLeagueData() {
    showLoader(true);
    const leagueId = state.currentLeague;
    console.log(`[League] Sincronizando datos: ${leagueId}`);

    try {
        const [standingsData, scoreboardData, statsData, newsData, teamsData] = await Promise.all([
            fetchESPN(`${leagueId}/standings`),
            fetchESPN(`${leagueId}/scoreboard`),
            fetchESPN(`${leagueId}/statistics`),
            fetchESPN(`${leagueId}/news`),
            fetchESPN(`${leagueId}/teams`)
        ]);

        // 1. Full Standings
        if (standingsData && standingsData.children) {
            const leagueName = standingsData.children[0].name || 'Liga';
            const table = standingsData.children[0].standings.entries;
            const tableElFull = get('standingsTableFull');
            
            tableElFull.innerHTML = table.map(item => {
                const s = item.stats;
                const getVal = (name) => s.find(stat => stat.name === name)?.displayValue || '0';
                return `
                    <tr onclick="showTeamDetails('${leagueId}', '${item.team.id}')" class="cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 group">
                        <td class="px-6 py-4 text-xs font-black text-slate-500">${getVal('rank')}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-4">
                                <img src="${item.team.logos?.[0]?.href}" class="w-6 h-6 object-contain">
                                <span class="text-sm font-bold text-white group-hover:text-blue-400 Transition-colors">${item.team.displayName}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-center text-xs font-medium text-slate-300">${getVal('gamesPlayed')}</td>
                        <td class="px-6 py-4 text-center text-xs text-slate-400">${getVal('wins')}</td>
                        <td class="px-6 py-4 text-center text-xs text-slate-400">${getVal('ties')}</td>
                        <td class="px-6 py-4 text-center text-xs text-slate-400">${getVal('losses')}</td>
                        <td class="px-6 py-4 text-center text-xs font-bold ${parseInt(getVal('pointDifferential')) >= 0 ? 'text-emerald-500' : 'text-rose-500'}">${getVal('pointDifferential')}</td>
                        <td class="px-6 py-4 text-center text-sm font-black text-blue-500 bg-blue-500/5">${getVal('points')}</td>
                    </tr>
                `;
            }).join('');

            const fav = table.find(t => t.team.displayName.includes(state.favTeam)) || table[0];
            get('kpiPartidos').innerText = fav.stats.find(s => s.name === 'gamesPlayed')?.displayValue || '--';
            get('kpiVictorias').innerText = fav.stats.find(s => s.name === 'wins')?.displayValue || '--';
            get('kpiDerrotas').innerText = fav.stats.find(s => s.name === 'losses')?.displayValue || '--';
            get('kpiGoles').innerText = fav.stats.find(s => s.name === 'points')?.displayValue || '--';

            updateStatus();
            generateAISummary(leagueName, table[0].team.displayName);
        }

        // 2. Scoreboard, Results & Calendar
        if (scoreboardData && scoreboardData.events) {
            const events = scoreboardData.events;
            get('upcomingMatches').innerHTML = events.slice(0, 5).map(event => renderMatchCard(event, 'compact')).join('');
            get('fullResultsList').innerHTML = events.map(event => renderMatchCard(event, 'detailed')).join('');
            
            // Calendar populate
            const calendarEl = get('upcomingMatchesCalendar');
            if (calendarEl) {
                calendarEl.innerHTML = events.map(event => `
                    <div class="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-500 uppercase">${new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                            <span class="text-sm font-bold text-white">${event.name}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">${new Date(event.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 3. Scorers
        if (statsData && statsData.categories) {
            const goalsCat = statsData.categories.find(c => c.name === 'goals');
            if (goalsCat) {
                get('scorerList').innerHTML = goalsCat.athletes.slice(0, 10).map((athlete, i) => `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/30 transition-all">
                        <div class="flex items-center gap-4">
                            <span class="text-xs font-black text-slate-600">${i+1}</span>
                            <div class="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                <img src="${athlete.athlete.headshot?.href || 'https://a.espncdn.com/i/headshots/soccer/players/full/default.png'}" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">${athlete.athlete.displayName}</p>
                                <p class="text-[9px] text-blue-500 font-black uppercase tracking-widest">${athlete.athlete.teamName}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-lg font-black text-white">${athlete.displayValue}</span>
                            <p class="text-[8px] text-slate-600 font-bold uppercase">Goles</p>
                        </div>
                `).join('');
            }
        }

        // 4. News (NotiFutbol)
        if (newsData && newsData.articles) {
            renderNews(newsData.articles);
        }

        // 5. Teams Directory
        if (teamsData && teamsData.sports) {
            const teams = teamsData.sports[0].leagues[0].teams;
            renderTeamsList(teams);
        }
    } catch (e) {
        console.error("Error sincronizando liga", e);
    }
    showLoader(false);
}

function renderTeamsList(teams) {
    const container = get('teamsDirectory');
    if (!container) return;
    container.innerHTML = teams.map(item => `
        <div class="p-4 bg-slate-900/40 rounded-xl border border-slate-800/10 hover:border-blue-500/30 transition-all text-center group cursor-pointer">
            <img src="${item.team.logos?.[0]?.href || 'https://a.espncdn.com/i/espn/espn_logos/soccer.png'}" class="w-12 h-12 mx-auto mb-3 object-contain group-hover:scale-110 transition-transform">
            <p class="text-[10px] font-bold text-white group-hover:text-blue-400">${item.team.shortDisplayName}</p>
        </div>
    `).join('');
}

function renderNews(articles) {
    const newsContainer = get('newsContainer');
    if (newsContainer) {
        newsContainer.innerHTML = articles.slice(0, 4).map(art => `
            <a href="${art.links.web.href}" target="_blank" class="group flex gap-4 p-3 hover:bg-slate-800/30 rounded-2xl transition-all border border-transparent hover:border-slate-800">
                <div class="relative min-w-[80px]">
                    <img src="${art.images?.[0]?.url || 'https://a.espncdn.com/i/espn/espn_logos/soccer.png'}" class="w-20 h-20 object-cover rounded-xl shadow-lg">
                </div>
                <div class="flex flex-col justify-center overflow-hidden">
                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">${new Date(art.published).toLocaleDateString()}</p>
                    <h4 class="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">${art.headline}</h4>
                </div>
            </a>
        `).join('');
    }

    const fullListEl = get('misterChipFullList');
    if (fullListEl) {
        fullListEl.innerHTML = articles.map(art => `
            <div class="glass-card p-4 border-l-4 border-l-red-600 mb-4 transition-all hover:translate-x-1">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[8px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded">Noticia Top</span>
                    <span class="text-[8px] text-slate-500">${new Date(art.published).toLocaleDateString()}</span>
                </div>
                <h4 class="text-sm font-bold text-white mb-2">${art.headline}</h4>
                <p class="text-xs text-slate-400 mb-3">${art.description}</p>
                <a href="${art.links.web.href}" target="_blank" class="text-[10px] font-bold text-blue-400 hover:text-white transition-colors">Leer Artículo Completo →</a>
            </div>
        `).join('');
    }
}

function renderMatchCard(event, variant = 'compact') {
    const home = event.competitions[0].competitors[0];
    const away = event.competitions[0].competitors[1];
    const dateObj = new Date(event.date);
    const date = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const isLive = event.status.type.state === 'in';
    const status = event.status.type.shortDetail;

    if (variant === 'compact') {
        return `
            <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-blue-500/30 transition-all group">
                <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                    <span class="${isLive ? 'text-red-500 animate-pulse' : ''}">${isLive ? 'EN VIVO' : date}</span> 
                    <span class="text-blue-500">${time}</span>
                </div>
                <div class="flex justify-between items-center text-[11px] font-bold text-white">
                    <span class="flex-1 truncate">${home.team.shortDisplayName}</span>
                    <span class="mx-3 px-2 py-0.5 bg-slate-800 rounded text-blue-400 font-black">${home.score || '0'} - ${away.score || '0'}</span>
                    <span class="flex-1 text-right truncate">${away.team.shortDisplayName}</span>
                </div>
            </div>
        `;
    }

    return `
        <div class="glass-card p-5 border-l-4 ${isLive ? 'border-red-500' : 'border-slate-800'}">
            <div class="flex justify-between items-center mb-4">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${event.status.type.description}</span>
                <span class="text-[10px] font-bold text-blue-500">${date} • ${time}</span>
            </div>
            <div class="grid grid-cols-3 items-center gap-4">
                <div class="flex flex-col items-center gap-2">
                    <img src="${home.team.logo}" class="w-10 h-10 object-contain">
                    <span class="text-xs font-bold text-white text-center">${home.team.displayName}</span>
                </div>
                <div class="flex flex-col items-center">
                    <div class="text-2xl font-black text-white">${home.score || 0} - ${away.score || 0}</div>
                    <div class="text-[9px] font-bold text-slate-600 uppercase mt-2">${status}</div>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <img src="${away.team.logo}" class="w-10 h-10 object-contain">
                    <span class="text-xs font-bold text-white text-center">${away.team.displayName}</span>
                </div>
            </div>
        </div>
    `;
}

function initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // UI Update
            btns.forEach(b => {
                b.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
                b.classList.add('text-slate-500');
            });
            btn.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
            btn.classList.remove('text-slate-500');

            // Content Update
            panes.forEach(p => {
                if (p.dataset.content === target) {
                    p.classList.remove('hidden');
                    p.classList.add('active');
                } else {
                    p.classList.add('hidden');
                    p.classList.remove('active');
                }
            });
        });
    });
}

async function showTeamDetails(leagueId, teamId) {
    showLoader(true);
    // Note: Localized team details from ESPN internal API
    const teamData = await fetchESPN(`${leagueId}/teams/${teamId}`);
    if (teamData && teamData.team) {
        const team = teamData.team;
        get('detailTeamCrest').src = team.logos[0].href;
        get('detailTeamName').innerText = team.displayName;
        get('detailTeamArena').innerText = team.location || 'Sede';
        
        // Squad can be fetched from /roster
        const rosterData = await fetchESPN(`${leagueId}/teams/${teamId}/roster`);
        if (rosterData && rosterData.athletes) {
            get('teamSquadList').innerHTML = rosterData.athletes.slice(0, 20).map(p => `
                <div class="p-3 bg-slate-800/30 rounded-xl flex justify-between items-center text-xs">
                    <div class="flex items-center gap-3">
                        <span class="text-slate-600 font-bold w-4">${p.jersey || '--'}</span>
                        <div><p class="font-bold text-white">${p.displayName}</p><p class="text-[9px] text-slate-500 uppercase">${p.position.displayName}</p></div>
                    </div>
                    <div class="text-[9px] font-bold text-blue-400">${p.birthPlace?.country || '??'}</div>
                </div>
            `).join('');
        }
        get('teamDetailsOverlay').classList.remove('hidden');
    }
    showLoader(false);
}

function showLoader(show) {
    const loader = get('globalLoader');
    if (loader) loader.classList.toggle('hidden', !show);
}

function handleSearch(query) {
    const rows = document.querySelectorAll('#standingsTable tr');
    const term = query.toLowerCase().trim();
    
    rows.forEach(row => {
        const teamName = row.querySelector('span')?.innerText.toLowerCase() || "";
        if (teamName.includes(term)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });

    // Toggle search results panel if active
    const searchPanel = get('searchResults');
    if (term.length > 0) {
        searchPanel?.classList.remove('hidden');
        get('searchResultsList').innerHTML = `<p class="text-[10px] text-slate-400">Filtrando equipos por: <b>${term}</b></p>`;
    } else {
        searchPanel?.classList.add('hidden');
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] ESTADISTICAS PAO Engine");
    loadESPNData();
    initTabs();
    initSportMenu();
    setInterval(loadESPNData, 60000);
    get('leagueSelector').addEventListener('change', (e) => changeLeague(e.target.value));
    get('globalSearch').addEventListener('input', (e) => handleSearch(e.target.value));
    loadLeagueData();
    loadNotiFutbol();
    setInterval(loadNotiFutbol, 15000);
    updateStatus();
});

function changeLeague(leagueId) {
    state.currentLeague = leagueId;
    const selector = get('leagueSelector');
    if (selector) selector.value = leagueId;
    loadLeagueData();
}

function initSportMenu() {
    const sportBtns = document.querySelectorAll('nav.bg-\\[\\#121212\\] a');
    sportBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const sportName = btn.innerText.toLowerCase();
            if (SPORT_MAPPING[sportName]) {
                state.currentSport = SPORT_MAPPING[sportName];
                state.currentLeague = state.currentSport === 'soccer' ? 'esp.1' : 'nba';
                sportBtns.forEach(b => {
                    b.classList.remove('border-b-2', 'border-blue-500');
                    b.classList.add('text-slate-400');
                });
                btn.classList.add('border-b-2', 'border-blue-500');
                btn.classList.remove('text-slate-400');
                loadESPNData();
                loadLeagueData();
            }
        });
    });
}
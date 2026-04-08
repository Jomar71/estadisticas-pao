/**
 * SportsStats Pro - ESPN Full Integration Engine
 * Provides coverage for Colombia, Argentina, Mexico, Europe and more.
 */

const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

let state = {
    currentLeague: 'eng.1', // Default to Premier League (ESPN ID)
    favTeam: localStorage.getItem('sportsStats_favTeam') || "Real Madrid",
    searchTimeout: null
};

// Safe access to elements
const get = (id) => document.getElementById(id);

// --- ESPN FETCH HELPER ---
async function fetchESPN(endpoint) {
    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(`${ESPN_BASE}/${endpoint}`));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`[ESPN API] Error en ${endpoint}:`, error.message);
        return null;
    }
}

// --- ESPN DATA RECOVERY ---

async function loadESPNData() {
    console.log("[ESPN] Sincronizando marcadores en vivo...");
    try {
        // Marcadores TOP (Globales)
        const scoreRes = await fetchESPN('all/scoreboard');
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

        // Noticias Globales
        const newsData = await fetchESPN('all/news');
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
    console.log(`[League] Cargando datos para: ${leagueId}`);

    try {
        // 1. Standings
        const standingsData = await fetchESPN(`${leagueId}/standings`);
        if (standingsData && standingsData.children) {
            const table = standingsData.children[0].standings.entries;
            const tableEl = get('standingsTable');
            tableEl.innerHTML = table.map(item => {
                const stats = item.stats;
                const getStat = (name) => stats.find(s => s.name === name)?.displayValue || '0';
                return `
                    <tr onclick="showTeamDetails('${leagueId}', '${item.team.id}')" class="cursor-pointer hover:bg-slate-800/40 transition-colors group">
                        <td class="px-6 py-4 text-xs font-bold text-slate-500">${item.stats.find(s => s.name === 'rank')?.value || '--'}</td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <img src="${item.team.logos[0].href}" class="w-5 h-5 object-contain" onerror="this.src='https://a.espncdn.com/i/espn/espn_logos/soccer.png'">
                                <span class="text-xs font-bold text-white group-hover:text-blue-400 truncate max-w-[140px]">${item.team.displayName}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-center text-xs text-slate-400 font-medium">${getStat('gamesPlayed')}</td>
                        <td class="px-6 py-4 text-center text-sm font-bold text-blue-500">${getStat('points')}</td>
                        <td class="px-6 py-4 text-center text-xs text-slate-500">${getStat('pointDifferential')}</td>
                    </tr>
                `;
            }).join('');

            // UPDATE KPIs with leader or favorite
            const fav = table.find(t => t.team.displayName.includes(state.favTeam)) || table[0];
            get('kpiPartidos').innerText = fav.stats.find(s => s.name === 'gamesPlayed')?.displayValue || '--';
            get('kpiVictorias').innerText = fav.stats.find(s => s.name === 'wins')?.displayValue || '--';
            get('kpiDerrotas').innerText = fav.stats.find(s => s.name === 'losses')?.displayValue || '--';
            get('kpiGoles').innerText = fav.stats.find(s => s.name === 'points')?.displayValue || '--';
        }

        // 2. Scoreboard (Matches)
        const scoreboardData = await fetchESPN(`${leagueId}/scoreboard`);
        if (scoreboardData && scoreboardData.events) {
            const upcomingEl = get('upcomingMatches');
            upcomingEl.innerHTML = scoreboardData.events.slice(0, 5).map(event => {
                const home = event.competitions[0].competitors[0];
                const away = event.competitions[0].competitors[1];
                const date = new Date(event.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
                const time = new Date(event.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all">
                        <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                            <span>${date}</span> <span class="text-blue-500">${time}</span>
                        </div>
                        <div class="flex justify-between items-center text-[11px] font-bold text-white">
                            <span class="flex-1 truncate">${home.team.shortDisplayName}</span>
                            <span class="text-[9px] text-slate-700 mx-2">VS</span>
                            <span class="flex-1 text-right truncate">${away.team.shortDisplayName}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 3. Statistics (Scorers)
        const statsData = await fetchESPN(`${leagueId}/statistics`);
        if (statsData && statsData.categories) {
            const goalsCat = statsData.categories.find(c => c.name === 'goals');
            if (goalsCat) {
                get('scorerList').innerHTML = goalsCat.athletes.slice(0, 6).map((athlete, i) => `
                    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all">
                        <span class="text-xs font-bold text-slate-500 w-4">${i+1}</span>
                        <div class="flex-1 ml-4 overflow-hidden">
                            <p class="text-xs font-bold text-white truncate">${athlete.athlete.displayName}</p>
                            <p class="text-[8px] text-slate-600 font-bold uppercase">${athlete.athlete.teamName}</p>
                        </div>
                        <span class="text-sm font-black text-blue-500">${athlete.displayValue}</span>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error("Error cargando liga", e);
    }
    showLoader(false);
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] SportsStats Pro - ESPN Edition");
    
    // Initial ESPNSync
    loadESPNData();
    setInterval(loadESPNData, 60000);

    // Dynamic Selectors
    get('leagueSelector').addEventListener('change', (e) => { 
        state.currentLeague = e.target.value; 
        loadLeagueData(); 
    });

    get('closeTeamDetails').addEventListener('click', () => { 
        get('teamDetailsOverlay').classList.add('hidden'); 
    });

    get('btnFootball').addEventListener('click', () => { 
        loadLeagueData(); 
    });

    get('configToggle').addEventListener('click', () => { 
        get('configPanel').classList.toggle('hidden'); 
    });

    get('saveApiKey').addEventListener('click', () => {
        state.favTeam = get('teamInput').value || state.favTeam;
        localStorage.setItem('sportsStats_favTeam', state.favTeam);
        get('configPanel').classList.add('hidden');
        loadLeagueData();
    });

    // Start
    loadLeagueData();
});
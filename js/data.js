/**
 * SportsStats Pro - Datos de Respaldo (Fallback)
 * Estos datos se mostrarán en caso de que la API real no esté disponible.
 */

const sportsData = {
    football: {
        kpis: {
            totalMatches: 38,
            wins: 24,
            losses: 8,
            goals: 68
        },
        chartData: [
            { season: '2020/21', value: 65 },
            { season: '2021/22', value: 72 },
            { season: '2022/23', value: 78 },
            { season: '2023/24', value: 85 }
        ],
        matches: [
            { date: '2024-04-01', opponent: 'Real Madrid', result: 'W', score: '2-1' },
            { date: '2024-03-25', opponent: 'FC Barcelona', result: 'D', score: '1-1' },
            { date: '2024-03-18', opponent: 'Borussia Dortmund', result: 'W', score: '3-0' },
            { date: '2024-03-10', opponent: 'Atletico Madrid', result: 'L', score: '0-2' },
            { date: '2024-03-05', opponent: 'Manchester City', result: 'W', score: '2-0' }
        ],
        scorers: [
            { name: 'Harry Kane', goals: 32, matches: 30 },
            { name: 'Jamal Musiala', goals: 12, matches: 28 },
            { name: 'Leroy Sané', goals: 10, matches: 28 },
            { name: 'Thomas Müller', goals: 7, matches: 25 }
        ]
    },
    basketball: {
        kpis: {
            totalMatches: 82,
            wins: 58,
            losses: 24,
            goals: 6245 // Puntos en basket
        },
        chartData: [
            { season: '2021', value: 5820 },
            { season: '2022', value: 5980 },
            { season: '2023', value: 6105 },
            { season: '2024', value: 6245 }
        ],
        matches: [
            { date: '2024-03-15', opponent: 'LA Lakers', result: 'W', score: '112-98' },
            { date: '2024-03-12', opponent: 'Boston Celtics', result: 'W', score: '105-99' },
            { date: '2024-03-09', opponent: 'Chicago Bulls', result: 'L', score: '92-108' },
            { date: '2024-03-06', opponent: 'Brooklyn Nets', result: 'W', score: '118-95' },
            { date: '2024-03-03', opponent: 'NY Knicks', result: 'W', score: '104-101' }
        ],
        scorers: [
            { name: 'Nikola Jokić', goals: 1850, matches: 72 },
            { name: 'Luka Dončić', goals: 1720, matches: 68 },
            { name: 'Giannis Antetokounmpo', goals: 1680, matches: 70 },
            { name: 'Joel Embiid', goals: 1650, matches: 65 }
        ]
    },
    tennis: {
        kpis: {
            totalMatches: 56,
            wins: 42,
            losses: 14,
            goals: 89 // Juegos/Sets
        },
        chartData: [
            { season: '2021', value: 68 },
            { season: '2022', value: 75 },
            { season: '2023', value: 82 },
            { season: '2024', value: 89 }
        ],
        matches: [
            { date: '2024-03-15', opponent: 'Novak Djokovic', result: 'W', score: '6-4 7-5' },
            { date: '2024-03-12', opponent: 'Carlos Alcaraz', result: 'W', score: '6-3 6-2' },
            { date: '2024-03-09', opponent: 'Jannik Sinner', result: 'L', score: '4-6 5-7' },
            { date: '2024-03-06', opponent: 'Daniil Medvedev', result: 'W', score: '7-6 6-4' },
            { date: '2024-03-03', opponent: 'Alexander Zverev', result: 'W', score: '6-2 6-3' }
        ],
        scorers: [
            { name: 'Novak Djokovic', goals: 245, matches: 52 },
            { name: 'Carlos Alcaraz', goals: 238, matches: 50 },
            { name: 'Jannik Sinner', goals: 225, matches: 48 },
            { name: 'Daniil Medvedev', goals: 210, matches: 46 }
        ]
    }
};
// API Client for HoopHub
// Handles ESPN and BallDontLie API calls

import axios from 'axios';

// ===========================================
// ESPN API (Unofficial - Free, No Auth)
// ===========================================

const espnApi = axios.create({
  baseURL: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba',
  timeout: 10000,
});

// Fetch today's scoreboard (games)
export const fetchScoreboard = async (date = null) => {
  try {
    let url = '/scoreboard';
    if (date) {
      // Format: YYYYMMDD - use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      url += `?dates=${dateStr}`;
    }
    const response = await espnApi.get(url);
    return parseESPNGames(response.data);
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    throw error;
  }
};

// Fetch NBA news
export const fetchNews = async () => {
  try {
    const response = await espnApi.get('/news');
    return parseESPNNews(response.data);
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Fetch all teams
export const fetchTeams = async () => {
  try {
    const response = await espnApi.get('/teams');
    return parseESPNTeams(response.data);
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// ===========================================
// BallDontLie API (Free Tier - for player search)
// ===========================================

const BALLDONTLIE_API_KEY = 'f099c5be-289f-4c17-87df-9fe9dbf0d93c';

const bdlApi = axios.create({
  baseURL: 'https://api.balldontlie.io/nba/v1',
  timeout: 10000,
  headers: {
    'Authorization': BALLDONTLIE_API_KEY,
  },
});

// Search players
export const searchPlayers = async (query, page = 1, perPage = 25) => {
  try {
    const response = await bdlApi.get('/players', {
      params: {
        search: query,
        page,
        per_page: perPage,
      },
    });
    return {
      players: response.data.data.map(parsePlayer),
      meta: response.data.meta,
    };
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
};

// Fetch player by ID
export const fetchPlayer = async (playerId) => {
  try {
    const response = await bdlApi.get(`/players/${playerId}`);
    return parsePlayer(response.data.data);
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

// Fetch season averages for a player (legacy function - returns null)
export const fetchSeasonAverages = async (playerId, season = null) => {
  // This endpoint requires paid API - use fetchPlayerStatsByName instead
  return null;
};

// Search for player in ESPN and get their stats (FREE - no API key needed)
export const fetchPlayerStatsByName = async (firstName, lastName) => {
  try {
    // Search ESPN for the player
    const searchResponse = await axios.get(
      `https://site.web.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(firstName + ' ' + lastName)}&limit=5&type=player&sport=basketball&league=nba`
    );

    if (!searchResponse.data?.items || searchResponse.data.items.length === 0) {
      return null;
    }

    // Find the best match
    const playerResult = searchResponse.data.items[0];
    const espnPlayerId = playerResult.id;

    // Fetch player stats from ESPN Core API
    const statsResponse = await axios.get(
      `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${espnPlayerId}/statistics`
    );

    if (statsResponse.data?.splits?.categories) {
      const stats = parseESPNCoreStats(statsResponse.data.splits.categories);
      // Include ESPN player ID for headshot URL
      stats.espnPlayerId = espnPlayerId;
      return stats;
    }

    return null;
  } catch (error) {
    console.error('Error fetching player stats by name:', error);
    return null;
  }
};

// Fetch box score for a game (player stats)
export const fetchBoxScore = async (gameId) => {
  try {
    const response = await axios.get(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`
    );

    const data = response.data;
    if (!data.boxscore?.players) {
      return null;
    }

    // Get homeAway info from teams array (players array doesn't have it)
    const teamsInfo = {};
    data.boxscore.teams?.forEach((team) => {
      teamsInfo[team.team.id] = team.homeAway;
    });

    // Parse both teams' player stats
    const boxScore = {
      homeTeam: null,
      awayTeam: null,
    };

    data.boxscore.players.forEach((teamData) => {
      // Look up homeAway from teams array using team ID
      const teamId = teamData.team?.id;
      const isHome = teamsInfo[teamId] === 'home';

      const teamStats = {
        team: {
          id: teamId,
          name: teamData.team.displayName,
          abbreviation: teamData.team.abbreviation,
          logo: teamData.team.logo,
        },
        players: [],
      };

      // Get the statistics array (usually just one entry for the game)
      const statsGroup = teamData.statistics?.[0];
      if (statsGroup?.athletes) {
        teamStats.players = statsGroup.athletes.map((athlete) => {
          // Map stats array to named values
          const statValues = {};
          statsGroup.labels?.forEach((label, index) => {
            statValues[label] = athlete.stats?.[index] || '0';
          });

          return {
            id: athlete.athlete?.id,
            name: athlete.athlete?.displayName || 'Unknown',
            shortName: athlete.athlete?.shortName || '',
            jersey: athlete.athlete?.jersey || '',
            position: athlete.athlete?.position?.abbreviation || '',
            starter: athlete.starter || false,
            stats: statValues,
            didNotPlay: athlete.didNotPlay || false,
            reason: athlete.reason || '',
          };
        });
      }

      if (isHome) {
        boxScore.homeTeam = teamStats;
      } else {
        boxScore.awayTeam = teamStats;
      }
    });

    return boxScore;
  } catch (error) {
    console.error('Error fetching box score:', error);
    return null;
  }
};

// ===========================================
// Data Parsers
// ===========================================

const parseESPNGames = (data) => {
  if (!data.events) return [];
  
  return data.events.map((event) => {
    const competition = event.competitions?.[0];
    const homeTeam = competition?.competitors?.find((c) => c.homeAway === 'home');
    const awayTeam = competition?.competitors?.find((c) => c.homeAway === 'away');
    const status = event.status?.type;
    
    return {
      id: event.id,
      date: event.date,
      name: event.name,
      shortName: event.shortName,
      status: parseGameStatus(status?.state),
      statusDetail: status?.shortDetail || status?.description || '',
      period: event.status?.period || 0,
      clock: event.status?.displayClock || '',
      venue: competition?.venue?.fullName || '',
      homeTeam: {
        id: homeTeam?.team?.id,
        name: homeTeam?.team?.displayName,
        abbreviation: homeTeam?.team?.abbreviation,
        logo: homeTeam?.team?.logo,
        color: homeTeam?.team?.color,
        score: parseInt(homeTeam?.score || '0', 10),
      },
      awayTeam: {
        id: awayTeam?.team?.id,
        name: awayTeam?.team?.displayName,
        abbreviation: awayTeam?.team?.abbreviation,
        logo: awayTeam?.team?.logo,
        color: awayTeam?.team?.color,
        score: parseInt(awayTeam?.score || '0', 10),
      },
    };
  });
};

const parseGameStatus = (state) => {
  switch (state?.toLowerCase()) {
    case 'pre':
      return 'scheduled';
    case 'in':
      return 'live';
    case 'post':
      return 'final';
    default:
      return 'unknown';
  }
};

const parseESPNNews = (data) => {
  if (!data.articles) return [];
  
  return data.articles.map((article) => ({
    id: article.dataSourceIdentifier || String(Math.random()),
    headline: article.headline,
    description: article.description || '',
    imageUrl: article.images?.[0]?.url || null,
    publishedAt: article.published,
    url: article.links?.web?.href || '',
    source: 'ESPN',
  }));
};

const parseESPNTeams = (data) => {
  const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
  return teams.map((t) => ({
    id: t.team.id,
    name: t.team.displayName,
    abbreviation: t.team.abbreviation,
    logo: t.team.logos?.[0]?.href,
    color: t.team.color,
  }));
};

const parsePlayer = (player) => ({
  id: player.id,
  firstName: player.first_name,
  lastName: player.last_name,
  fullName: `${player.first_name} ${player.last_name}`,
  position: player.position || 'N/A',
  height: player.height || null,
  weight: player.weight || null,
  jerseyNumber: player.jersey_number || null,
  college: player.college || null,
  country: player.country || null,
  draftYear: player.draft_year || null,
  draftRound: player.draft_round || null,
  draftNumber: player.draft_number || null,
  team: player.team ? {
    id: player.team.id,
    name: player.team.full_name,
    abbreviation: player.team.abbreviation,
    city: player.team.city,
    conference: player.team.conference,
    division: player.team.division,
  } : null,
});

// Parse ESPN Core API statistics
const parseESPNCoreStats = (categories) => {
  if (!categories || categories.length === 0) return null;

  // Collect all stats from all categories into one object
  const allStats = {};
  categories.forEach(cat => {
    if (cat.stats) {
      cat.stats.forEach(stat => {
        allStats[stat.name] = stat.value;
        allStats[stat.abbreviation] = stat.value;
      });
    }
  });

  // ESPN Core API returns BOTH totals AND pre-calculated averages (prefixed with 'avg')
  // Use the avg values directly, and percentages are already in percentage form (50.6, not 0.506)
  const gamesPlayed = allStats.gamesPlayed || allStats.GP || 0;

  const formatAvg = (val) => {
    if (val === null || val === undefined) return '0.0';
    return Number(val).toFixed(1);
  };

  const formatPct = (val) => {
    if (val === null || val === undefined) return '0.0';
    // ESPN returns percentages already as percentages (e.g., 50.6 not 0.506)
    return Number(val).toFixed(1);
  };

  return {
    season: new Date().getFullYear(),
    gamesPlayed: gamesPlayed,
    minutes: formatAvg(allStats.avgMinutes),
    points: formatAvg(allStats.avgPoints),
    assists: formatAvg(allStats.avgAssists),
    rebounds: formatAvg(allStats.avgRebounds),
    steals: formatAvg(allStats.avgSteals),
    blocks: formatAvg(allStats.avgBlocks),
    turnovers: formatAvg(allStats.avgTurnovers),
    fieldGoalPct: formatPct(allStats.fieldGoalPct),
    threePointPct: formatPct(allStats.threePointFieldGoalPct),
    freeThrowPct: formatPct(allStats.freeThrowPct),
    fieldGoalsMade: formatAvg(allStats.avgFieldGoalsMade),
    fieldGoalsAttempted: formatAvg(allStats.avgFieldGoalsAttempted),
    threePointersMade: formatAvg(allStats.avgThreePointFieldGoalsMade),
    threePointersAttempted: formatAvg(allStats.avgThreePointFieldGoalsAttempted),
    freeThrowsMade: formatAvg(allStats.avgFreeThrowsMade),
    freeThrowsAttempted: formatAvg(allStats.avgFreeThrowsAttempted),
    offensiveRebounds: formatAvg(allStats.avgOffensiveRebounds),
    defensiveRebounds: formatAvg(allStats.avgDefensiveRebounds),
    personalFouls: formatAvg(allStats.avgFouls),
  };
};

// ===========================================
// Utility Functions
// ===========================================

export const getPlayerHeadshotUrl = (playerId) => {
  // ESPN headshot URL pattern (may not work for all players)
  return `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png&w=350&h=254`;
};

export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default {
  fetchScoreboard,
  fetchNews,
  fetchTeams,
  searchPlayers,
  fetchPlayer,
  fetchSeasonAverages,
  fetchPlayerStatsByName,
  fetchBoxScore,
  getPlayerHeadshotUrl,
  formatTimeAgo,
};

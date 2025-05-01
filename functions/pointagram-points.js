export async function handler(event, context) {
  const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
  const API_USER = "learning@instituteofsustainabilitystudies.com";
  const API_URL = "https://www.pointagram.com/wp-json/proxy-api/v1";

  const headers = {
    "Api-Key": API_KEY,
    "Api-User": API_USER,
    "Content-Type": "application/json"
  };

  try {
    // Step 1: Fetch all competitions
    const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
    const competitionsData = await competitionsRes.json();
    const allCompetitions = competitionsData?.data?.competitions || [];

    if (!allCompetitions.length) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ message: "No competitions found." })
      };
    }

    const competitionId = allCompetitions[0].id;
    const competitionEnd_Date = allCompetitions

    console.log("END-DATE:", competitionEnd_Date)

    // Step 2: Fetch leaderboard players
    const leaderboardRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
    const leaderboardData = await leaderboardRes.json();
    const leaderboardPlayers = leaderboardData?.data?.players || [];

    // Step 3: Fetch all player details
    const allPlayersRes = await fetch(`${API_URL}/players`, { headers });
    const allPlayersData = await allPlayersRes.json();
    const allPlayers = allPlayersData?.data?.players || [];

    // Step 4: Fetch all teams
    const teamsRes = await fetch(`${API_URL}/teams`, { headers });
    const teamsData = await teamsRes.json();
    const teams = teamsData?.data?.teams || [];

    // Step 5: Fetch players in each team
    const teamPlayersMap = {};

    for (const team of teams) {

      const teamId = team.id;

      try {
        const teamPlayersRes = await fetch(`${API_URL}/teams/${teamId}/players`, { headers });
        const teamPlayersData = await teamPlayersRes.json();
        const playersInTeam = teamPlayersData?.data?.players || [];
    
        // FIX: store by profile_id as string
        teamPlayersMap[team.name] = playersInTeam.map(player => String(player.profile_id));
      } catch (teamError) {
        console.error(`Failed to fetch players for team ${team.name}:`, teamError.message);
      }
    }
    

    const enrichedLeaderboard = leaderboardPlayers.map(lbPlayer => {
      const playerInfo = allPlayers.find(p => p.id === lbPlayer.profile_id);
    
      // Fix: Ensure IDs are compared as strings
      let teamName = null;

      for (const [name, playerIds] of Object.entries(teamPlayersMap)) {
        if (playerIds.includes(String(lbPlayer.profile_id))) {
          teamName = name;
          break;
        }
      }
    
      return {
        id: lbPlayer.id,
        name: lbPlayer.Name,
        rank: parseInt(lbPlayer.rank),
        score: parseFloat(lbPlayer.current_score),
        icon: lbPlayer.icon,
        email: playerInfo?.emailaddress || null,
        team: teamName || playerInfo?.team?.name || null
      };
    });
    
    enrichedLeaderboard.sort((a, b) => a.rank - b.rank);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        competition: allCompetitions[0].name,
        leaderboard: enrichedLeaderboard
      })
    };

  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: error.message || "Unknown error" })
    };
  }
}

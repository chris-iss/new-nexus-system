// export async function handler(event, context) {
//     const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
//     const API_URL = "https://www.pointagram.com/wp-json/proxy-api/v1";
//     const API_USER = "learning@instituteofsustainabilitystudies.com";
  
//     const headers = {
//       "Api-Key": API_KEY,
//       "Content-Type": "application/json",
//       "Api-User": API_USER
//     };
  
//     try {
//       // STEP 1: Fetch all competitions
//       const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
//       const competitions = await competitionsRes.json();
  
//       console.log("COMPETITION LOG:", competitions.data);
  
//       const allCompetitions = competitions?.data?.competitions || [];
//       if (!allCompetitions.length) {
//         return {
//           statusCode: 404,
//           headers: {
//             "Access-Control-Allow-Origin": "*",
//             "Access-Control-Allow-Headers": "Content-Type"
//           },
//           body: JSON.stringify({ message: "No competitions found." })
//         };
//       }
  
//       const competitionId = allCompetitions[0].id;
  
//       // STEP 2: Fetch players in that competition
//       const playersRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
//       const playersData = await playersRes.json();
  
//       console.log("PLAYERS RAW:", playersData);
  
//       if (!playersData?.data?.players) {
//         throw new Error("No players returned");
//       }
  
//       // STEP 3: Build leaderboard
//       const leaderboard = playersData.data.players.map((player) => ({
//         rank: parseInt(player.rank),
//         name: player.Name,
//         score: parseFloat(player.current_score),
//         icon: player.icon
//       }));
  
//       // Optional: Sort by rank in case it's unordered
//       leaderboard.sort((a, b) => a.rank - b.rank);
  
//       return {
//         statusCode: 200,
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Headers": "Content-Type"
//         },
//         body: JSON.stringify({
//           competition: allCompetitions[0].name,
//           leaderboard
//         })
//       };
  
//     } catch (error) {
//       console.error("Leaderboard Fetch Error:", error.message);
//       return {
//         statusCode: 500,
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Headers": "Content-Type"
//         },
//         body: JSON.stringify({ error: error.message || "Unknown error" })
//       };
//     }
//   }


// Enriched Leaderboard using /players + /competitions/{id}/players

export async function handler(event, context) {
  const API_URL = "https://www.pointagram.com/wp-json/proxy-api/v1";
  const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
  const API_USER = "learning@instituteofsustainabilitystudies.com";

  const headers = {
    "Api-Key": API_KEY,
    "Api-User": API_USER,
    "Content-Type": "application/json"
  };

  try {
    // 1. Get competitions
    const compsRes = await fetch(`${API_URL}/competitions`, { headers });
    const comps = await compsRes.json();
    const competition = comps?.data?.competitions?.[0];

    if (!competition?.id) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No competition found" }),
      };
    }

    const compId = competition.id;

    // 2. Get scores from /competitions/{id}/players
    const leaderboardRes = await fetch(`${API_URL}/competitions/${compId}/players`, { headers });
    const leaderboardData = await leaderboardRes.json();
    const leaderboardRaw = leaderboardData?.data?.players || [];

    // 3. Get player details from /players
    const playersRes = await fetch(`${API_URL}/players`, { headers });
    const playersData = await playersRes.json();
    const allPlayers = playersData?.data?.players || [];

    // 4. Enrich leaderboard
    const defaultAvatar = "https://devopiss.wpenginepowered.com/wp-content/uploads/2025/04/defualt-user.avif";

    const enrichedLeaderboard = leaderboardRaw.map(lbEntry => {
      const match = allPlayers.find(p => p.id === lbEntry.id);

      return {
        id: lbEntry.id,
        name: lbEntry.Name,
        rank: parseInt(lbEntry.rank),
        score: parseFloat(lbEntry.current_score),
        email: match?.email || null,
        team: match?.team?.name || null,
        avatar: match?.avatar || defaultAvatar
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
        competition: competition.name,
        leaderboard: enrichedLeaderboard
      })
    };

  } catch (err) {
    console.error("Enriched leaderboard error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" })
    };
  }
}

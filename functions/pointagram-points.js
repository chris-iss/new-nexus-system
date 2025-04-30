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
  
//       console.log("COMPETITION LOG:", competitions?.data?.competitions);
  
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
  
//       console.log("PLAYERS IN COMPETITION:", playersData.data.players);
  
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
    console.log("COMPETITIONS", allCompetitions)
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
  

    // Step 2: Fetch leaderboard scores
    const leaderboardRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
    const leaderboardData = await leaderboardRes.json();
    const leaderboardPlayers = leaderboardData?.data?.players || [];

    // Step 3: Fetch all player details (for email and team)
    const allPlayersRes = await fetch(`${API_URL}/players`, { headers });
    const allPlayersData = await allPlayersRes.json();
    const allPlayers = allPlayersData?.data?.players || [];

    console.log("ALL PLAYER", allPlayers)

    // Step 4: Combine leaderboard and player details
    const enrichedLeaderboard = leaderboardPlayers.map(lbPlayer => {
      const playerInfo = allPlayers.find(p => p.id === lbPlayer.profile_id);

      console.log("CONDITION RESULT:", playerInfo)
     
      return {
        id: lbPlayer.id,
        name: lbPlayer.Name,
        rank: parseInt(lbPlayer.rank),
        score: parseFloat(lbPlayer.current_score),
        icon: lbPlayer.icon,
        email: playerInfo?.emailaddress || null,
        team: playerInfo?.team?.name || null
      };
    });

    // Step 5: Sort by rank
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

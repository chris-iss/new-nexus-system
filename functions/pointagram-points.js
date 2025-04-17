export async function handler(event, context) {
    const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
    const API_URL = "https://www.pointagram.com/wp-json/proxy-api/v1";
    const API_USER = "learning@instituteofsustainabilitystudies.com";
  
    const headers = {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Api-User": API_USER
    };
  
    try {
      // STEP 1: Fetch all competitions
      const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
      const competitions = await competitionsRes.json();
  
      console.log("COMPETITION LOG:", competitions.data);
  
      const allCompetitions = competitions?.data?.competitions || [];
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
  
      // STEP 2: Fetch players in that competition
      const playersRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
      const playersData = await playersRes.json();
  
      if (!playersData?.data) {
        throw new Error("No players returned");
      }
  
      const leaderboard = playersData.data.players.map((player, index) => ({
        rank: index + 1,
        name: player.name || player.email,
        score: player.total_points
      }));
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ competition: allCompetitions[0].name, leaderboard })
      };
  
    } catch (error) {
      console.error("Leaderboard Fetch Error:", error.message);
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
  
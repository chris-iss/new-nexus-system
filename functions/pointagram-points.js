export async function handler(event, context) {
    const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
    const API_URL = "https://app.pointagram.com/api/v2";
  
    const headers = {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Api-User": "learning@instituteofsustainabilitystudies.com"
    };
  
    try {
      const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
      const competitions = await competitionsRes.json();
  
      if (!competitions?.data?.length) {
        return {
          statusCode: 404,
          headers: {
            "Access-Control-Allow-Origin": "*", // Or replace * with your site
            "Access-Control-Allow-Headers": "Content-Type"
          },
          body: JSON.stringify({ message: "No competitions found." })
        };
      }
  
      const competitionId = competitions.data[0].id;
  
      const playersRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
      const playersData = await playersRes.json();
  
      const leaderboard = playersData.data.map((player, index) => ({
        rank: index + 1,
        name: player.name || player.email,
        score: player.total_points
      }));
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Allow all origins
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ competition: competitions.data[0].name, leaderboard })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
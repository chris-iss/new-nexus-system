export async function handler(event, context) {
    const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
    const API_URL = "https://app.pointagram.com/api/v2";
  
    const headers = {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Api-User": "learning@instituteofsustainabilitystudies.com"
    };
  
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://courses.instituteofsustainabilitystudies.com",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };
  
    // Handle preflight CORS request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "OK"
      };
    }
  
    try {
      const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
      const competitions = await competitionsRes.json();
  
      if (!competitions?.data?.length) {
        return {
          statusCode: 404,
          headers: corsHeaders,
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
        headers: corsHeaders,
        body: JSON.stringify({ competition: competitions.data[0].name, leaderboard })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
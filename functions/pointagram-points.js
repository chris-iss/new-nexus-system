// /netlify/functions/pointagram-points.js
export async function handler(event, context) {
    const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
    const API_URL = "https://www.pointagram.com/wp-json/proxy-api/v1";
    const headers = {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Api-User": "learning@instituteofsustainabilitystudies.com"
    };
  
    try {
      const competitionsRes = await fetch(`${API_URL}/competitions`, { headers });
      const competitions = await competitionsRes.json();

      console.log("SHOW ME:", competitions)
  
      if (!competitions?.data?.length) {
        return {
          statusCode: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type"
          },
          body: JSON.stringify({ message: "No competitions found." })
        };
      }
  
      const competitionId = competitions.data[0].id;
  
      const playersRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, { headers });
      const playersData = await playersRes.json();
  
      if (!playersData?.data) {
        throw new Error("No player data returned");
      }
  
      const leaderboard = playersData.data.map((player, index) => ({
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
        body: JSON.stringify({ competition: competitions.data[0].name, leaderboard })
      };
  
    } catch (error) {
      console.error("Netlify function error:", error.message);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: error.message || "Something went wrong" })
      };
    }
  }
  
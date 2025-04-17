// /netlify/functions/leaderboard.js
export async function handler(event, context) {
    const API_KEY = "JjKc6Z12gHxyKRQfKkSJFLGhZXMGJnMM";
    const API_URL = "https://app.pointagram.com/api/v2";
  
    const headers = {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Api-User": "learning@instituteofsustainabilitystudies.com" 
    };
  
    try {
      // STEP 1: Get all competitions
      const competitionsRes = await fetch(`${API_URL}/competitions`, {
        headers
      });
  
      const competitions = await competitionsRes.json();

      console.log("CHECKING DATA NOW:", competitions)
  
      if (!competitions?.data?.length) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "No competitions found." })
        };
      }
  
      // STEP 2: Use the first competition ID (or loop through if you have multiples)
      const competitionId = competitions.data[0].id;
  
      // STEP 3: Get players in the competition
      const playersRes = await fetch(`${API_URL}/competitions/${competitionId}/players`, {
        headers
      });
  
      const playersData = await playersRes.json();
  
      // Optional: format result (e.g. rank, name, points)
      const leaderboard = playersData.data.map((player, index) => ({
        rank: index + 1,
        name: player.name || player.email,
        score: player.total_points
      }));
  
      return {
        statusCode: 200,
        body: JSON.stringify({ competition: competitions.data[0].name, leaderboard })
      };
  
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
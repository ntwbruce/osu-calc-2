import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this endpoint is for fetching general user data
export default withIronSessionApiRoute(async function getLeaderboardData(req, res) {
  try {
    // restrict requests to be only GET
    if (req.method !== "GET") {
      res.status(405).send({ message: "Only GET requests allowed" });
      return;
    }

    // obtain country leaderboard data
    const countryLeaderboardData = (await Promise.all(
      [...Array(200).keys()].flatMap(
        async (index) =>
          (await axios.get(`https://osu.ppy.sh/api/v2/rankings/osu/performance?country=SG&page=${index + 1}`, {
            headers: { Authorization: `Bearer ${req.session.accessToken}` }
        })).data.ranking
      )
    )).flat();

    // obtain global leaderboard data
    const globalLeaderboardData = (await Promise.all(
        [...Array(200).keys()].flatMap(
          async (index) =>
            (await axios.get(`https://osu.ppy.sh/api/v2/rankings/osu/performance?page=${index + 1}`, {
              headers: { Authorization: `Bearer ${req.session.accessToken}` }
          })).data.ranking
        )
      )).flat();

    res.status(200).send({
      message: "Leaderboard data retrieved successfully",
      data: { globalLeaderboardData, countryLeaderboardData } 
    });
  } catch (error) {
    console.log("Error fetching leaderboard data: " + error);
    res
      .status(error.response.status)
      .send("Error fetching leaderboard data: " + error);
  }
},
sessionOptions);

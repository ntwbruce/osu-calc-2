import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this api endpoint is for fetching user scores (recent/ best/ firsts)
export default withIronSessionApiRoute(
    async function getScoreData(req, res) {
        try {
            // restrict requests to be only GET
            if (req.method !== "GET") {
                res.status(405).send({ message: "Only GET requests allowed" })
                return;
            }

            /*  
                URL Parameters:
                userID   integer   
                ID of the user.

                scoreType   string   
                Score type. Must be one of these: best, firsts, recent.

                Query Parameters:
                includeFails   string  optional  
                Only for recent scores, include scores of failed plays. Set to 1 to include them. Defaults to 0.

                mode   string  optional  
                GameMode of the scores to be returned. Defaults to the specified user's mode.

                limit   integer  optional  
                Maximum number of results.

                offset   string  optional  
                Result offset for pagination.
            */
            const userID = req.query.user; // could be either ID or username, depending on context
            const scoreType = req.query.scoreType;
            
            const includeFails = req.query.includeFails || 0;
            const mode = req.query.mode;
            const limit = req.query.limit;
            const offset = req.query.offset;

            if (!userID) {
                return res.status(400).send("cannot be called without userID query parameter!");
            }

            if (!scoreType) {
                return res.status(400).send("cannot be called without scoreType query parameter!");
            }

            if (scoreType !== "best" && scoreType !== "recent" && scoreType !== "firsts") {
                return res.status(400).send("scoreType must be either \'best\', \'recent\' or \'firsts\'!");
            }

            // query recent scores from osu API
            const scoreData = (await axios.get(`https://osu.ppy.sh/api/v2/users/${userID}/scores/${scoreType}?include_fails=${includeFails}${mode ? `&mode=${mode}` : null}${limit ? `&limit=${limit}` : null}${offset ? `&offset=${offset}` : null}`, {
                headers: { Authorization: `Bearer ${req.session.accessToken}` }
            })).data;

            res.status(200).send({ message: "Score data retrieved successfully", data: scoreData });
        } catch (error) {
            console.log("Error fetching score data: " + error);
            res.status(error.response.status).send("Error fetching score data: " + error);
        }
    },
    sessionOptions
);
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this API endpoint is for fetching top score of user on a particular beatmap
export default withIronSessionApiRoute(
    async function getTopUserScoreOnBeatmap(req, res) {
        try {
            // restrict requests to be only GET
            if (req.method !== "GET") {
                res.status(405).send({ message: "Only GET requests allowed" })
                return;
            }

            /*  
                URL Parameters:
                beatmap   integer   
                ID of the beatmap

                userID   integer   
                ID of the user

                Query Parameters:

                mode   string  optional  
                The Gamemode to get scores for

                mods   string  optional  
                an array of matching mods, or none (currently not implemented in API)
            */
            const beatmapID = req.query.beatmapID;
            const userID = req.query.userID;

            const mode = req.query.mode;
            const mods = req.query.mods;

            // query top score of user for beatmap from osu API
            const scoreData = (await axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapID}/scores/users/${userID}`, {
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
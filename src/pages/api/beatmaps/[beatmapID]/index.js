import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this API endpoint is for fetching beatmap info for a particular beatmap
export default withIronSessionApiRoute(
    async function getBeatmapData(req, res) {
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
            */
            const beatmapID = req.query.beatmapID;

            // query beatmap data from osu API
            const beatmapData = (await axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapID}`, {
                headers: { Authorization: `Bearer ${req.session.accessToken}` }
            })).data;

            res.status(200).send({ message: "Beatmap data retrieved successfully", data: beatmapData });
        } catch (error) {
            console.log("Error fetching beatmap data: " + error);
            res.status(error.response.status).send("Error fetching beatmap data: " + error);
        }
    },
    sessionOptions
);
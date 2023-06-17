import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this endpoint is for fetching general user data
export default withIronSessionApiRoute(
    async function getUserData(req, res) {
        try {
            // restrict requests to be only GET
            if (req.method !== "GET") {
                res.status(405).send({ message: "Only GET requests allowed" })
                return;
            }

            // get username from query
            const username = req.query.user; // could be either ID or username, depending on context

            // obtain user data
            const userData = (await axios.get(`https://osu.ppy.sh/api/v2/users/${username}`, {
                headers: { Authorization: `Bearer ${req.session.accessToken}` }
            })).data;

            res.status(200).send({ message: "User data retrieved successfully", data: userData });
        } catch (error) {
            console.log("Error fetching user data: " + error);
            res.status(error.response.status).send("Error fetching user data: " + error);
        }
    },
    sessionOptions
);
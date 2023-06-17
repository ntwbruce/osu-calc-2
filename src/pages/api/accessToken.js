import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this API endpoint is for getting the access token using the oauth token
export default withIronSessionApiRoute(
    async function getAccessToken(req, res) {
        try {
            // restrict requests to be only POST
            if (req.method !== "POST") {
                res.status(405).send({ message: "Only POST requests allowed" })
                return;
            }

            // check if accessToken is present and not expired, skip requesting for a new one
            if (req.session.accessToken && req.session.accessTokenExpiry > (new Date()).getTime()) {
                return res.status(200).send({ message: "Access token already present. Skipping request." })
            }

            // obtain authToken from client_id and client_secret
            const auth_data = (await axios.post("https://osu.ppy.sh/oauth/token", {
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
                client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
                grant_type: "client_credentials",
                scope: "public"
            })).data;

            req.session.accessToken = auth_data.access_token;
            req.session.accessTokenExpiry = (new Date()).getTime() + 1000 * auth_data.expires_in;

            await req.session.save();
            res.status(200).send({ message: "Access token retrieved successfully" });
        } catch (error) {
            console.log("Error fetching access token: " + error);
            res.status(error.response.status).send("Error fetching access token: " + error);
        }
    },
    sessionOptions
);
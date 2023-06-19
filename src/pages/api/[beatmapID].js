import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import axios from "axios";

// * this endpoint is for fetching .osu beatmap file data
export default withIronSessionApiRoute(async function getBeatmapFileData(req, res) {
  try {
    // restrict requests to be only GET
    if (req.method !== "GET") {
      res.status(405).send({ message: "Only GET requests allowed" });
      return;
    }

    /*  
        URL Parameters:
        beatmap   integer   
        ID of the beatmap
    */
    const beatmapID = req.query.beatmapID;

    // obtain .osu file data
    const beatmapText = (await fetch(`https://osu.ppy.sh/osu/${beatmapID}`).then((response) =>response.text())); // Throws 500 if I use axios.get so will use this for now

    res
      .status(200)
      .send({
        message: "Beatmap file data retrieved successfully",
        data: beatmapText,
      });
  } catch (error) {
    console.log("Error fetching beatmap file data: " + error);
    res
      .status(error.response.status)
      .send("Error fetching beatmap file data: " + error);
  }
}, sessionOptions);

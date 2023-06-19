import { Button, Image } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { IconStarFilled } from "@tabler/icons-react";
import ojsama from "ojsama";

export default function HomePage() {
    const router = useRouter();
    const [beatmapData, setBeatmapData] = useState({});
    const [beatmapFileData, setBeatmapFileData] = useState({});
    const [scoreData, setScoreData] = useState({});
    const [starRating, setStarRating] = useState(0);

    useEffect(() => {
        const fetchBeatmapData = async (beatmapID) => {
            try {
                const response = (await axios.get(`/api/beatmaps/${beatmapID}`)).data;

                setBeatmapData(response.data);
            } catch (error) {
                console.log("error fetching beatmap data: " + error);
            }
        }

        const fetchScoreData = async (beatmapID, userID) => {
            try {
                const response = (await axios.get(`/api/beatmaps/${beatmapID}/scores/users/${userID}`)).data;

                setScoreData(response.data);
            } catch (error) {
                console.log("error fetching score data: " + error);
            }
        }

        const fetchBeatmapFileData = async (beatmapID) => {
            try {
                const response = (await axios.get(`/api/${beatmapID}`)).data; 

                setBeatmapFileData(response.data);
            } catch (error) {
                console.log("error fetching beatmap file data: " + error);
            }
        }

        if (router.isReady) {
            fetchBeatmapData(router.query.beatmapID);
            fetchScoreData(router.query.beatmapID, router.query.userID);
            fetchBeatmapFileData(router.query.beatmapID);
        }
    }, [router.isReady])


    useEffect(() => {
        if (Object.keys(beatmapData).length !== 0) {
            console.log('logging beatmap data');
            console.log(beatmapData);
            setStarRating(beatmapData.difficulty_rating);
        }

    }, [beatmapData])

    useEffect(() => {
        if (Object.keys(scoreData).length !== 0) {
            console.log('logging score data');
            console.log(scoreData);
        }
    }, [scoreData])

    useEffect(() => {
        if (Object.keys(beatmapFileData).length !== 0) {
            console.log('logging beatmap file data');
            console.log(beatmapFileData);
        }

    }, [beatmapFileData])

    useEffect(() => {
        if (Object.keys(beatmapData).length !== 0 && Object.keys(scoreData).length !== 0 && Object.keys(beatmapFileData).length !== 0) {
            const isDifficultyChanging = scoreData.score.mods.reduce((acc, curr) => acc || ['EZ', 'HR', 'DT', 'NC', 'FL', 'HT'].includes(curr), false);
            if (isDifficultyChanging) {
                const modbits = {
                    SD: 0,
                    PF: 0,
                    NF: 1<<0,
                    EZ: 1<<1,
                    TD: 1<<2,
                    HD: 1<<3,
                    HR: 1<<4,
                    DT: 1<<6,
                    HT: 1<<8,
                    NC: 1<<9,
                    FL: 1<<10,
                    SO: 1<<12,
                };

                const modValue = scoreData.score.mods.reduce((acc, curr) => acc + modbits[curr], 0);
                const { map } = new ojsama.parser().feed(beatmapFileData);
                const updatedStarRating = new ojsama.std_diff().calc({ map, mods: modValue }).total;
                setStarRating(updatedStarRating);
            }
        }

    }, [beatmapData, scoreData, beatmapFileData])

    return (
        <>
            <Button onClick={() => {
                router.back();
            }}>Back</Button>

            {
                Object.keys(beatmapData).length !== 0 && Object.keys(scoreData).length !== 0 && (
                    <>
                        {/* Get Beatmap unicode Title */}
                        <h1>{beatmapData.beatmapset.title} [{beatmapData.version}]{scoreData.score.mods.length !== 0 ? ` +${scoreData.score.mods.join()}` : " +No Mod"} [{(Math.round(starRating * 100) / 100.0).toFixed(2)}<IconStarFilled />]</h1>
                        {/* Get Beatmap cover image */}
                        <Image mx="auto" radius="md" src={beatmapData.beatmapset.covers["cover@2x"]} alt="Beatmap cover" />

                        <h2>Global Score Position: #{scoreData.position}</h2>
                        <h2>Rank: {scoreData.score.rank} (Replace with colour icon or smth)</h2>
                        <h2>Score: {scoreData.score.score.toLocaleString("en-US")}</h2>
                        <h2>PP: {scoreData.score.pp}PP (XXXPP for XXX FC, calculate from scoreData.score.statistics)</h2>
                        <h2>Accuracy: {(scoreData.score.accuracy * 100).toFixed(2)}</h2>
                        <h2>Combo: {scoreData.score.max_combo}/{beatmapData.max_combo}</h2>
                        {/* count of 300s, 100s, 50s and misses */}
                        <h2>Count: [{scoreData.score.statistics.count_300}/{scoreData.score.statistics.count_100}/{scoreData.score.statistics.count_50}/{scoreData.score.statistics.count_miss}]</h2>
                    </>

                )
            }
        </>
    );
}

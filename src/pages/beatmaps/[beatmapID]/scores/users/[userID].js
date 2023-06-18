import { Flex, Title, Button, Image } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { IconStarFilled } from "@tabler/icons-react"

export default function HomePage() {
    const router = useRouter();
    const [beatmapData, setBeatmapData] = useState({});
    const [scoreData, setScoreData] = useState({});

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

        if (router.isReady) {
            fetchBeatmapData(router.query.beatmapID);
            fetchScoreData(router.query.beatmapID, router.query.userID);
        }
    }, [router.isReady])


    useEffect(() => {
        if (Object.keys(beatmapData).length !== 0) {
            console.log('logging beatmap data');
            console.log(beatmapData)
        }

    }, [beatmapData])

    useEffect(() => {
        if (Object.keys(scoreData).length !== 0) {
            console.log('logging score data');
            console.log(scoreData);
        }
    }, [scoreData])

    return (
        <>
            <Button onClick={() => {
                router.back();
            }}>Back</Button>

            {
                Object.keys(beatmapData).length !== 0 && Object.keys(scoreData).length !== 0 && (
                    <>
                        {/* Get Beatmap unicode Title */}
                        <h1>{beatmapData.beatmapset.title} [{beatmapData.version}]{scoreData.score.mods.length !== 0 ? ` +${scoreData.score.mods.join()}` : " +No Mod"} [{beatmapData.difficulty_rating}<IconStarFilled />]</h1>
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

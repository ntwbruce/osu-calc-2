import { Button, Image, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { IconStarFilled } from "@tabler/icons-react";
import { calculateStarRating } from "@/lib/calculators/StarRatingCalculator";

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
            const isDifficultyChanging = scoreData.score.mods.some(mod => ['EZ', 'HR', 'DT', 'NC', 'FL', 'HT'].includes(mod));
            if (isDifficultyChanging) {
                setStarRating(calculateStarRating(beatmapFileData, scoreData.score.mods));
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
                        <Title order={1}>{beatmapData.beatmapset.title} [{beatmapData.version}]{scoreData.score.mods.length !== 0 ? ` +${scoreData.score.mods.join()}` : " +No Mod"} [{(Math.round(starRating * 100) / 100.0).toFixed(2)}<IconStarFilled />]</Title>
                        {/* Get Beatmap cover image */}
                        <Image mx="auto" radius="md" src={beatmapData.beatmapset.covers["cover@2x"]} alt="Beatmap cover" />

                        <Title order={2}>Global Score Position: #{scoreData.position}</Title>
                        <Title order={2}>Rank: {scoreData.score.rank} (Replace with colour icon or smth)</Title>
                        <Title order={2}>Score: {scoreData.score.score.toLocaleString("en-US")}</Title>
                        <Title order={2}>PP: {scoreData.score.pp}PP (XXXPP for XXX FC, calculate from scoreData.score.statistics)</Title>
                        <Title order={2}>Accuracy: {(scoreData.score.accuracy * 100).toFixed(2)}</Title>
                        <Title order={2}>Combo: {scoreData.score.max_combo}/{beatmapData.max_combo}</Title>
                        {/* count of 300s, 100s, 50s and misses */}
                        <Title order={2}>Count: [{scoreData.score.statistics.count_300}/{scoreData.score.statistics.count_100}/{scoreData.score.statistics.count_50}/{scoreData.score.statistics.count_miss}]</Title>
                    </>

                )
            }
        </>
    );
}

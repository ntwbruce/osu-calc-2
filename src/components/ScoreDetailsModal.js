import { calculateMapStats } from "@/lib/calculators/MapStatCalculator";
import { calculateStarRating } from "@/lib/calculators/StarRatingCalculator";
import { calculateModValue } from "@/lib/modbits";
import {
  BackgroundImage,
  Flex,
  Image,
  Loader,
  Modal,
  Title,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ScoreDetailsModal({ opened, close, scoreData }) {
  const [beatmapData, setBeatmapData] = useState({});
  const [beatmapFileData, setBeatmapFileData] = useState({});
  const [onlineScoreData, setOnlineScoreData] = useState({});
  const [starRating, setStarRating] = useState(0);
  const [isStarRatingSet, setIsStarRatingSet] = useState(false);
  const [mapStats, setMapStats] = useState({});
  const [areMapStatsSet, setAreMapsStatsSet] = useState(false);
  const [isOpenedBefore, setIsOpenedBefore] = useState(false);

  useEffect(() => {
    if (!isOpenedBefore && opened) {
      setIsOpenedBefore(true);
    }
  }, [opened]);

  useEffect(() => {
    if (Object.keys(beatmapData).length !== 0) console.log(beatmapData);
  }, [beatmapData]);

  useEffect(() => {
    const fetchBeatmapData = async (beatmapID) => {
      try {
        const response = (await axios.get(`/api/beatmaps/${beatmapID}`)).data;
        setBeatmapData(response.data);
      } catch (error) {
        console.log("error fetching beatmap data: " + error);
      }
    };

    const fetchOnlineScoreData = async (beatmapID, userID) => {
      try {
        const response = (
          await axios.get(`/api/beatmaps/${beatmapID}/scores/users/${userID}`)
        ).data;
        setOnlineScoreData(response.data);
      } catch (error) {
        console.log("error fetching score data: " + error);
      }
    };

    const fetchBeatmapFileData = async (beatmapID) => {
      try {
        const response = (await axios.get(`/api/${beatmapID}`)).data;
        setBeatmapFileData(response.data);
      } catch (error) {
        console.log("error fetching beatmap file data: " + error);
      }
    };

    if (!isOpenedBefore && opened) {
      fetchBeatmapData(scoreData.beatmap_id);
      fetchOnlineScoreData(scoreData.beatmap_id, scoreData.user_id);
      fetchBeatmapFileData(scoreData.beatmap_id);
    }
  }, [isOpenedBefore, opened]);

  useEffect(() => {
    if (
      Object.keys(beatmapData).length !== 0 &&
      Object.keys(onlineScoreData).length !== 0 &&
      Object.keys(beatmapFileData).length !== 0
    ) {
      setStarRating(
        scoreData.sr_multiplier
          ? calculateStarRating(beatmapFileData, onlineScoreData.score.mods)
          : beatmapData.difficulty_rating
      );
      setIsStarRatingSet(true);
      setMapStats(
        calculateMapStats(
          {
            baseAR: beatmapData.ar,
            baseOD: beatmapData.accuracy,
            baseHP: beatmapData.drain,
            baseCS: beatmapData.cs,
            baseTotalLength: beatmapData.total_length,
            baseDrainLength: beatmapData.hit_length,
            baseBPM: beatmapData.bpm,
          },
          calculateModValue(scoreData.mods)
        )
      );
      setAreMapsStatsSet(true);
    }
  }, [beatmapData, onlineScoreData, beatmapFileData]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      centered
      size="100%"
    >
      <BackgroundImage
        src={scoreData.background}
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
        h={400}
      >
        <Flex direction="column" bg="rgba(0, 0, 0, .75)" p={20} h="100%">
          <Title>
            {scoreData.artist} - {scoreData.title} [{scoreData.difficulty}] (
            {isStarRatingSet ? (
              starRating.toFixed(2)
            ) : (
              <Loader size={25} color="white" />
            )}
            {<IconStarFilled />})
          </Title>
          <Title order={4}>mapset by {scoreData.mapper}</Title>
          <Flex direction="row">
            {scoreData.mods.map((mod) => (
              <Image
                key={mod}
                src={`/mods/${mod}.png`}
                width={44}
                height={31}
                mt={2}
                mb={3}
              />
            ))}
          </Flex>
          <Title order={2}>
            {scoreData.max_combo}/{beatmapData.max_combo}x{" "}
            {scoreData.max_combo === beatmapData.max_combo ? "(PFC)" : ""} (
            {scoreData.hit_counts.count_300}/{scoreData.hit_counts.count_100}/
            {scoreData.hit_counts.count_50}/{scoreData.hit_counts.count_miss})
          </Title>
          <Title order={2}>
            #{onlineScoreData.position} {scoreData.score.toLocaleString()}
          </Title>
          <Title order={2}>
            {scoreData.pp.toFixed(2)}pp {(scoreData.acc * 100).toFixed(2)}%{" "}
            {scoreData.rank}
          </Title>
          <Title order={2}>
            CS{" "}
            {areMapStatsSet ? (
              mapStats.newCS
            ) : (
              <Loader size={20} color="white" />
            )}{" "}
            AR{" "}
            {areMapStatsSet ? (
              mapStats.newAR
            ) : (
              <Loader size={20} color="white" />
            )}{" "}
            OD{" "}
            {areMapStatsSet ? (
              mapStats.newOD
            ) : (
              <Loader size={20} color="white" />
            )}{" "}
            HP{" "}
            {areMapStatsSet ? (
              mapStats.newHP
            ) : (
              <Loader size={20} color="white" />
            )}
          </Title>
          <Title order={2}>
            {areMapStatsSet ? (
              `0${Math.floor(mapStats.newTotalLength / 60)}:`.slice(-3)
            ) : (
              <Loader size={20} color="white" />
            )}
            {areMapStatsSet ? `0${mapStats.newTotalLength % 60}`.slice(-2) : ""}
            (
            {areMapStatsSet ? (
              `0${Math.floor(mapStats.newDrainLength / 60)}:`.slice(-3)
            ) : (
              <Loader size={20} color="white" />
            )}
            {areMapStatsSet ? `0${mapStats.newDrainLength % 60}`.slice(-2) : ""}
            ){" "}
            {areMapStatsSet ? (
              mapStats.newBPM
            ) : (
              <Loader size={20} color="white" />
            )}
            BPM
          </Title>
        </Flex>
      </BackgroundImage>
    </Modal>
  );
}

import { calculateStarRating } from "@/lib/calculators/StarRatingCalculator";
import { BackgroundImage, Flex, Loader, Modal, Title } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ScoreDetailsModal({ opened, close, scoreData }) {
  const [beatmapData, setBeatmapData] = useState({});
  const [beatmapFileData, setBeatmapFileData] = useState({});
  const [onlineScoreData, setOnlineScoreData] = useState({});
  const [starRating, setStarRating] = useState(0);
  const [isStarRatingSet, setIsStarRatingSet] = useState(false);
  const [isOpenedBefore, setIsOpenedBefore] = useState(false);

  useEffect(() => {
    if (!isOpenedBefore && opened) {
      setIsOpenedBefore(true);
    }
  }, [opened]);

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

//   useEffect(() => {
//     if (Object.keys(beatmapData).length !== 0) {
//       console.log("logging beatmap data");
//       console.log(beatmapData);
//     }
//   }, [beatmapData]);

//   useEffect(() => {
//     if (Object.keys(onlineScoreData).length !== 0) {
//       console.log("logging score data");
//       console.log(onlineScoreData);
//     }
//   }, [onlineScoreData]);

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
            CS{beatmapData.cs} AR{beatmapData.ar} OD{beatmapData.accuracy} HP
            {beatmapData.drain}
          </Title>
          <Title order={2}>
            {`0${Math.floor(beatmapData.total_length / 60)}`.slice(-2)}:
            {`0${beatmapData.total_length % 60}`.slice(-2)}(
            {`0${Math.floor(beatmapData.hit_length / 60)}`.slice(-2)}:
            {`0${beatmapData.hit_length % 60}`.slice(-2)}) {beatmapData.bpm}BPM
          </Title>
        </Flex>
      </BackgroundImage>
    </Modal>
  );
}

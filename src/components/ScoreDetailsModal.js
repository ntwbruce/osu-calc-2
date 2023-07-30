import { calculateMapStats } from "@/lib/calculators/MapStatCalculator";
import { calculateStarRating } from "@/lib/calculators/StarRatingCalculator";
import { calculateModValue } from "@/lib/modbits";
import {
  BackgroundImage,
  Flex,
  Image,
  Loader,
  LoadingOverlay,
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
    setIsOpenedBefore(false);
    setIsStarRatingSet(false);
    setAreMapsStatsSet(false);
  }, [scoreData]);

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
        h={600}
      >
        <LoadingOverlay
          visible={!isStarRatingSet || !areMapStatsSet}
          overlayBlur={10}
        />
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, .75)"
          p={20}
          h="100%"
          gap={20}
          justify="center"
        >
          <Flex direction="column" align="center">
            <Title>{scoreData.artist}</Title>
            <Title size={50}>{scoreData.title}</Title>
          </Flex>

          <Flex direction="row" justify="center" gap="10%">
            <Flex direction="column">
              <Title order={4}>MAPSET</Title>
              <Title>{scoreData.mapper}</Title>
            </Flex>

            <Flex direction="column" maw="40%">
              <Title order={4}>DIFFICULTY</Title>
              <Title>{scoreData.difficulty}</Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>
                STAR RATING {<IconStarFilled size={15} />}
              </Title>
              <Title>
                {isStarRatingSet ? (
                  starRating.toFixed(2)
                ) : (
                  <Loader size={25} color="white" />
                )}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>MODS</Title>
              <Flex direction="row">
                {scoreData.mods.map((mod) => (
                  <Image
                    key={mod}
                    src={`/mods/${mod}.png`}
                    width={44}
                    height={31}
                    mt={7}
                  />
                ))}
              </Flex>
            </Flex>
          </Flex>

          <Flex direction="row" justify="center" gap="10%">
            <Flex direction="column">
              <Title order={4}>CS</Title>
              <Title>
                {areMapStatsSet ? (
                  mapStats.newCS
                ) : (
                  <Loader size={20} color="white" />
                )}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>AR</Title>
              <Title>
                {areMapStatsSet ? (
                  mapStats.newAR
                ) : (
                  <Loader size={20} color="white" />
                )}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>OD</Title>
              <Title>
                {areMapStatsSet ? (
                  mapStats.newOD
                ) : (
                  <Loader size={20} color="white" />
                )}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>HP</Title>
              <Title>
                {areMapStatsSet ? (
                  mapStats.newHP
                ) : (
                  <Loader size={20} color="white" />
                )}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>MAP LENGTH (DRAIN LENGTH)</Title>
              <Title>
                {areMapStatsSet ? (
                  `0${Math.floor(mapStats.newTotalLength / 60)}:`.slice(-3)
                ) : (
                  <Loader size={20} color="white" />
                )}
                {areMapStatsSet
                  ? `0${mapStats.newTotalLength % 60}`.slice(-2)
                  : ""}
                (
                {areMapStatsSet ? (
                  `0${Math.floor(mapStats.newDrainLength / 60)}:`.slice(-3)
                ) : (
                  <Loader size={20} color="white" />
                )}
                {areMapStatsSet
                  ? `0${mapStats.newDrainLength % 60}`.slice(-2)
                  : ""}
                )
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>BPM</Title>
              <Title>
                {areMapStatsSet ? (
                  mapStats.newBPM
                ) : (
                  <Loader size={20} color="white" />
                )}
              </Title>
            </Flex>
          </Flex>

          <Flex direction="row" justify="center" gap="10%">
            <Flex direction="column">
              <Title order={4}>DATE SET</Title>
              <Title>
                {`0${scoreData.date.getDate()}`.slice(-2)}/
                {`0${scoreData.date.getMonth() + 1}`.slice(-2)}/
                {scoreData.date.getFullYear()}{" "}
                {`0${scoreData.date.getHours()}`.slice(-2)}:
                {`0${scoreData.date.getMinutes()}`.slice(-2)}:
                {`0${scoreData.date.getSeconds()}`.slice(-2)}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>PP</Title>
              <Title>{scoreData.pp.toFixed(2)}pp</Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>ACCURACY</Title>
              <Title>{(scoreData.acc * 100).toFixed(2)}%</Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>RANK</Title>
              <Title>{scoreData.rank}</Title>
            </Flex>
          </Flex>

          <Flex direction="row" justify="center" gap="10%">
            <Flex direction="column">
              <Title order={4}>COMBO</Title>
              <Title
                sx={{
                  color:
                    scoreData.max_combo === beatmapData.max_combo
                      ? "#DA9100"
                      : "white",
                }}
              >
                {scoreData.max_combo}/{beatmapData.max_combo}x{" "}
                {scoreData.max_combo === beatmapData.max_combo ? "(PFC)" : ""}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>HITS</Title>
              <Title>
                {scoreData.hit_counts.count_300}/
                {scoreData.hit_counts.count_100}/{scoreData.hit_counts.count_50}
                /{scoreData.hit_counts.count_miss}
              </Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>GLOBAL RANK</Title>
              <Title>#{onlineScoreData.position}</Title>
            </Flex>

            <Flex direction="column">
              <Title order={4}>SCORE</Title>
              <Title>{scoreData.score.toLocaleString()}</Title>
            </Flex>
          </Flex>
        </Flex>
      </BackgroundImage>
    </Modal>
  );
}

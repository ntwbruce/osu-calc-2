import { calculateMapStats } from "@/lib/calculators/MapStatCalculator";
import { calculateStarRating } from "@/lib/calculators/StarRatingCalculator";
import { calculateModValue } from "@/lib/modbits";
import {
  BackgroundImage,
  Button,
  Flex,
  Grid,
  Loader,
  LoadingOverlay,
  Modal,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconStarFilled } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import ImageWithPopover from "./ImageWithPopover";
import { ModFullNames } from "@/lib/ModFullNames";
import Link from "next/link";

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
      size={1200}
    >
      <BackgroundImage
        src={scoreData.background}
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
        h={620}
      >
        <LoadingOverlay
          visible={!isStarRatingSet || !areMapStatsSet}
          overlayBlur={10}
        />
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, .75)"
          p={40}
          h="100%"
          gap={20}
          justify="center"
        >
          {/** Title and artist */}
          <Flex>
            <Flex direction="column" gap={10}>
              <Title size={50}>{scoreData.title}</Title>
              <Flex gap={20}>
                <Title order={2}>by {scoreData.artist}</Title>
                <Link
                  href={`https://osu.ppy.sh/beatmaps/${scoreData.beatmap_id}`}
                  target="_blank"
                >
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon={<IconExternalLink size="0.9rem" />}
                  >
                    Beatmap listing
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Flex>

          {/** Container for two columns of info */}
          <Flex direction="row">
            {/** Left column */}
            <Flex direction="column" w="50%" gap={10}>
              {/** Mapset creator */}
              <Flex direction="column">
                <Title order={4}>MAPSET</Title>
                <Title>{scoreData.mapper}</Title>
              </Flex>

              {/** Difficulty name */}
              <Flex direction="column">
                <Title order={4}>DIFFICULTY</Title>
                <Title>{scoreData.difficulty}</Title>
              </Flex>

              {/** Star rating + mods */}
              <Grid>
                <Grid.Col span={4}>
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
                </Grid.Col>

                <Grid.Col span={4}>
                  <Flex direction="column">
                    <Title order={4}>MODS</Title>
                    <Flex direction="row">
                      {scoreData.mods.map((mod) => (
                        <ImageWithPopover
                          key={mod}
                          imageSrc={`/mods/${mod}.png`}
                          popoverText={ModFullNames[mod]}
                          popoverWidth={120}
                          width={44}
                          height={31}
                          margin={7}
                        />
                      ))}
                    </Flex>
                  </Flex>
                </Grid.Col>
              </Grid>

              {/** Map length + BPM */}
              <Grid>
                <Grid.Col span={7}>
                  <Flex direction="column">
                    <Title order={4}>MAP LENGTH (DRAIN LENGTH)</Title>
                    <Title>
                      {areMapStatsSet ? (
                        `0${Math.floor(mapStats.newTotalLength / 60)}:`.slice(
                          -3
                        )
                      ) : (
                        <Loader size={20} color="white" />
                      )}
                      {areMapStatsSet
                        ? `0${mapStats.newTotalLength % 60}`.slice(-2)
                        : ""}
                      {""}(
                      {areMapStatsSet ? (
                        `0${Math.floor(mapStats.newDrainLength / 60)}:`.slice(
                          -3
                        )
                      ) : (
                        <Loader size={20} color="white" />
                      )}
                      {areMapStatsSet
                        ? `0${mapStats.newDrainLength % 60}`.slice(-2)
                        : ""}
                      )
                    </Title>
                  </Flex>
                </Grid.Col>

                <Grid.Col span={1}>
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
                </Grid.Col>
              </Grid>

              {/** CS, AR, OD, HP */}
              <Grid>
                <Grid.Col span={1}>
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
                </Grid.Col>

                <Grid.Col span={1} offset={1.33}>
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
                </Grid.Col>

                <Grid.Col span={1} offset={1.33}>
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
                </Grid.Col>

                <Grid.Col span={1} offset={1.33}>
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
                </Grid.Col>
              </Grid>
            </Flex>

            {/** Right column */}
            <Flex direction="column" w="50%" gap={10}>
              {/** Date */}
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

              {/** Score + global rank */}
              <Grid>
                <Grid.Col span={5}>
                  <Flex direction="column">
                    <Title order={4}>SCORE</Title>
                    <Title>{scoreData.score.toLocaleString()}</Title>
                  </Flex>
                </Grid.Col>
                <Grid.Col span={5}>
                  <Flex direction="column">
                    <Title order={4}>GLOBAL RANK</Title>
                    <Title>#{onlineScoreData.position}</Title>
                  </Flex>
                </Grid.Col>
              </Grid>

              {/** Hit distribution + accuracy + rank */}
              <Grid>
                <Grid.Col span={5}>
                  <Flex direction="column">
                    <Title order={4}>HITS</Title>
                    <Title>
                      {scoreData.hit_counts.count_300}/
                      {scoreData.hit_counts.count_100}/
                      {scoreData.hit_counts.count_50}/
                      {scoreData.hit_counts.count_miss}
                    </Title>
                  </Flex>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Flex direction="column">
                    <Title order={4}>ACCURACY</Title>
                    <Title
                      sx={{
                        color: scoreData.acc === 1 ? "#DA9100" : "white",
                      }}
                    >
                      {(scoreData.acc * 100).toFixed(2)}%
                    </Title>
                  </Flex>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Flex direction="column">
                    <Title order={4}>RANK</Title>
                    <Title>{scoreData.rank}</Title>
                  </Flex>
                </Grid.Col>
              </Grid>

              {/** PP + combo */}
              <Grid>
                <Grid.Col span={5}>
                  <Flex direction="column">
                    <Title order={4}>PP</Title>
                    <Title>{scoreData.pp.toFixed(2)}pp</Title>
                  </Flex>
                </Grid.Col>
                
                <Grid.Col span={7}>
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
                      {scoreData.max_combo === beatmapData.max_combo
                        ? "(PFC)"
                        : ""}
                    </Title>
                  </Flex>
                </Grid.Col>
              </Grid>
            </Flex>
          </Flex>
        </Flex>
      </BackgroundImage>
    </Modal>
  );
}

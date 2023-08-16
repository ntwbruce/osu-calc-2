import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Title,
  Flex,
  Loader,
  Paper,
  Center,
  RingProgress,
  Text,
  ScrollArea,
  Button,
  Grid,
} from "@mantine/core";
import Head from "next/head";
import {
  IconCircle,
  IconHammer,
  IconMinus,
  IconTriangle,
  IconTriangleInverted,
  IconZoomQuestion,
} from "@tabler/icons-react";
import { LoggedInHeader } from "@/components/LoggedInHeader";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateDate } from "@/lib/calculators/DateCalculator";
import { groupModsByValue } from "@/lib/calculators/graph/GroupModsByValue";
import { groupNumbersByInterval } from "@/lib/calculators/graph/GroupNumbersByInterval";
import {
  groupDatesByHour,
  groupDatesByMonth,
} from "@/lib/calculators/graph/GroupDatesByInterval";
import {
  calculateMean,
  calculateMedian,
} from "@/lib/calculators/GeneralCalculator";
import { PlayerInfoSimple } from "@/components/PlayerInfo";

const RADIAN = Math.PI / 180;
const COLORS = [
  "#c80815",
  "#ff7900",
  "#ffbf00",
  "#228b22",
  "#007bb8",
  "#702670",
  "#bf42f5",
];

export default function UserProfilePage() {
  const router = useRouter();

  // ============================================= AUTH TOKEN FETCHING =============================================

  const [authTokenPresent, setAuthTokenPresent] = useState(false);

  async function fetchAuthToken() {
    try {
      await axios.post("/api/accessToken");
      setAuthTokenPresent(true);
    } catch (error) {
      console.log("error fetching auth token: " + error.response.data);
      setAuthTokenPresent(false);
    }
  }

  // * Fetch auth token upon page initialisation
  useEffect(() => {
    fetchAuthToken();
  }, []);

  // ============================================= USER DATA FETCHING =============================================

  const [userData, setUserData] = useState({});
  const [doesUserExist, setDoesUserExist] = useState(true);
  const [isUserDataSet, setIsUserDataSet] = useState(false);

  const [hitData, setHitData] = useState({});
  const [isHitDataSet, setIsHitDataSet] = useState(false);

  const [rankHistoryData, setRankHistoryData] = useState({});
  const [isRankHistoryDataSet, setIsRankHistoryDataSet] = useState(false);

  async function fetchUserDataHandler(username) {
    try {
      const response = (await axios.get(`/api/users/${username}`)).data;

      setUserData(response.data);
      setIsUserDataSet(true);
      setDoesUserExist(true);
    } catch (error) {
      if (error.response.status === 401) {
        // authToken is invalid now, request new authToken (since authToken expires in a day)
        setAuthTokenPresent(false);
        fetchAuthToken();
      } else if (error.response.status === 404) {
        console.log("user does not exist!");
      } else {
        // probably a 500 internal server error
        console.log("error fetching user data: " + error.response.data);
      }
      setDoesUserExist(false);
    }
  }

  // * Fetch user data upon user page initialisation
  useEffect(() => {
    if (router.isReady && authTokenPresent) {
      // wait for router to obtain username before querying user data, as well as waiting for a authToken to be present
      fetchUserDataHandler(router.query.username);
    }
  }, [router.isReady, authTokenPresent]);

  useEffect(() => {
    if (Object.keys(userData).length !== 0) {
      setHitData({
        count_300: userData.statistics.count_300,
        count_100: userData.statistics.count_100,
        count_50: userData.statistics.count_50,
        count_miss: userData.statistics.count_miss,
        total: userData.statistics.total_hits + userData.statistics.count_miss,
      });
      setIsHitDataSet(true);

      const today = new Date();
      let minRank = -1;
      let minRankIdx = -1;
      let maxRank = -1;
      let maxRankIdx = -1;

      const history = userData.rank_history.data.map((rank, index) => {
        if (rank > minRank || minRank === -1) {
          minRank = rank;
          minRankIdx = index;
        }
        if (rank < maxRank || maxRank === -1) {
          maxRank = rank;
          maxRankIdx = index;
        }

        let diff = 0;
        if (index > 0) {
          diff = userData.rank_history.data[index - 1] - rank;
        }

        return {
          rank,
          index,
          diff,
          date: calculateDate(today, index - 89).toLocaleDateString("en-SG"),
        };
      });

      setRankHistoryData({ history, minRank, minRankIdx, maxRank, maxRankIdx });
      setIsRankHistoryDataSet(true);
    }
  }, [userData]);

  // ============================================= BEST SCORES DATA FETCHING =============================================

  const [bestScoresData, setBestScoresData] = useState({});
  const [isBestScoresDataSet, setIsBestScoresDataSet] = useState(false);

  async function fetchBestScoresDataHandler() {
    try {
      const response = (
        await axios.get(
          `/api/users/${userData.id}/scores/best?limit=${userData.scores_best_count}`
        )
      ).data;
      setBestScoresData(response.data);
      setIsBestScoresDataSet(true);
    } catch (error) {
      console.log("error fetching best scores: " + error.response.data);
      setBestScoresData([]);
      setIsBestScoresDataSet(false);
    }
  }

  // * Fetch best score data
  useEffect(() => {
    if (isUserDataSet) {
      fetchBestScoresDataHandler();
    }
  }, [isUserDataSet]);

  // ============================================= BEST SCORES DATA PRE-CALCULATION =============================================

  const [scoreGraphData, setScoreGraphData] = useState({});
  const [isScoreGraphDataSet, setIsScoreGraphDataSet] = useState(false);

  const [ppInterval, setPpInterval] = useState(5);
  const [accInterval, setAccInterval] = useState(0.1);
  const [splitScoreData, setSplitScoreData] = useState({});
  const [isSplitScoreDataSet, setIsSplitScoreDataSet] = useState(false);

  useEffect(() => {
    if (isBestScoresDataSet) {
      let mods = new Array(bestScoresData.length);
      let dates = new Array(bestScoresData.length);
      let pps = new Array(bestScoresData.length);
      let accs = new Array(bestScoresData.length);

      bestScoresData.forEach((score, index) => {
        mods[index] = score.mods.length === 0 ? ["NM"] : score.mods;
        dates[index] = new Date(score.created_at);
        pps[index] = score.pp;
        accs[index] = score.accuracy * 100;
      });

      setSplitScoreData({ mods, dates, pps, accs });
      setIsSplitScoreDataSet(true);

      setScoreGraphData({
        pp: {
          mean: calculateMean(pps),
          median: calculateMedian(pps),
          graphData: groupNumbersByInterval(pps, ppInterval),
        },
        acc: {
          mean: calculateMean(accs),
          median: calculateMedian(accs),
          graphData: groupNumbersByInterval(
            accs.map((acc) => Math.round(acc * 10)),
            accInterval * 10
          ),
        },
        modsGraphData: groupModsByValue(mods),
        dateGraphData: groupDatesByMonth(dates),
        timeGraphData: groupDatesByHour(dates),
      });
      setIsScoreGraphDataSet(true);
    }
  }, [bestScoresData]);

  useEffect(() => {
    if (isSplitScoreDataSet) {
      setScoreGraphData({
        ...scoreGraphData,
        pp: {
          ...scoreGraphData.pp,
          graphData: groupNumbersByInterval(splitScoreData.pps, ppInterval),
        },
      });
    }
  }, [ppInterval]);

  useEffect(() => {
    if (isSplitScoreDataSet) {
      setScoreGraphData({
        ...scoreGraphData,
        acc: {
          ...scoreGraphData.acc,
          graphData: groupNumbersByInterval(
            splitScoreData.accs.map((acc) => Math.round(acc * 10)),
            accInterval * 10
          ),
        },
      });
    }
  }, [accInterval]);

  // ============================================= STAT TOGGLE =============================================

  const [shownStat, setShownStat] = useState(0);

  const statToggleHandler = () =>
    setShownStat((shownStat) => (shownStat + 1) % 6);

  // ============================================= OUTPUT =============================================

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>

      <LoggedInHeader
        pages={[
          { label: "Profile Stats", link: `/${router.query.username}` },
          { label: "Best Scores", link: `/${router.query.username}/best` },
        ]}
        home={{ label: "Check another profile", link: "/" }}
        currPage="Profile Stats"
      />
      <Flex direction="column" gap="md" justify="center" ml={25} mr={25}>
        {authTokenPresent && isUserDataSet && (
          <PlayerInfoSimple userData={userData} isVertical={false} />
        )}

        {isUserDataSet && (
          <Grid grow>
            <Grid.Col span={1}>
              <ScrollArea>
                <Title order={4}>WIP things to add</Title>
                <Title order={4}>
                  country rank {userData.statistics.country_rank}
                </Title>
                <Title order={4}>
                  grade counts A {userData.statistics.grade_counts["a"]}...
                </Title>
                <Title order={4}>join date {userData.join_date}</Title>
                <Title order={4}>
                  playcount {userData.statistics.play_count.toLocaleString()}
                </Title>
                <Title order={4}>
                  monthly playcount {userData.monthly_playcounts[0].count}{" "}
                  {userData.monthly_playcounts[0].start_date}...
                </Title>
                <Title order={4}>
                  rank history {userData.rank_history.data[0]}...
                </Title>
                <Title order={4}>
                  peak rank {userData.rank_highest.rank}{" "}
                  {userData.rank_highest.updated_at}
                </Title>
                <Title order={4}>
                  level {userData.statistics.level.current} +{" "}
                  {userData.statistics.level.progress}%
                </Title>
                <Title order={4}>
                  max combo {userData.statistics.maximum_combo.toLocaleString()}
                </Title>
                <Title order={4}>
                  playtime {userData.statistics.play_time.toLocaleString()}{" "}
                  seconds
                </Title>
                <Title order={4}>
                  ranked score{" "}
                  {userData.statistics.ranked_score.toLocaleString()}
                </Title>
                <Title order={4}>
                  total score {userData.statistics.total_score.toLocaleString()}
                </Title>
              </ScrollArea>
            </Grid.Col>
            <Grid.Col span={2}>
              <Flex align="center" gap={40} h="60vh">
                <Button onClick={statToggleHandler}>Toggle Chart</Button>
                <Flex direction="column" gap={30}>
                  {isRankHistoryDataSet && shownStat === 0 && (
                    <Flex direction="column" gap={30}>
                      <Title align="center">Rank History</Title>
                      <LineChart
                        width={730}
                        height={250}
                        data={rankHistoryData.history}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#ffffff"
                          padding={{ left: 10, right: 10 }}
                          hide
                        />
                        <YAxis
                          stroke="#ffffff"
                          domain={["auto", "auto"]}
                          reversed
                          interval="preserveStartEnd"
                          label={{
                            value: "Rank",
                            angle: -90,
                            position: "left",
                            offset: 10,
                          }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <Paper
                                  shadow="sm"
                                  p="sm"
                                  sx={{
                                    outline: "solid",
                                    borderRadius: "10px",
                                    color: "white",
                                  }}
                                  bg="rgba(50, 50, 50, .6)"
                                >
                                  <Flex gap={10}>
                                    <Title order={6}>
                                      {`Global Rank #${payload[0].value}`}
                                    </Title>
                                    <Flex gap={2}>
                                      {payload[0].payload.diff === 0 ? (
                                        <IconMinus
                                          size={21}
                                          strokeWidth={2}
                                          color="#808080"
                                        />
                                      ) : payload[0].payload.diff > 0 ? (
                                        <IconTriangle
                                          size={21}
                                          strokeWidth={2}
                                          color={"#008000"}
                                        />
                                      ) : (
                                        <IconTriangleInverted
                                          size={21}
                                          strokeWidth={2}
                                          color={"#ff0000"}
                                        />
                                      )}
                                      <Title order={6}>
                                        {Math.abs(payload[0].payload.diff)}
                                      </Title>
                                    </Flex>
                                  </Flex>
                                  <Title order={6}>
                                    {`${label} - ${
                                      payload[0].payload.index === 89
                                        ? "today"
                                        : `${
                                            89 - payload[0].payload.index
                                          } days ago`
                                    }`}
                                  </Title>
                                </Paper>
                              );
                            }

                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rank"
                          stroke="#daa520"
                          strokeWidth={3}
                          dot={({ cx, cy, payload, value }) => {
                            if (
                              value === rankHistoryData.maxRank &&
                              payload.index === rankHistoryData.maxRankIdx
                            ) {
                              return (
                                <circle
                                  key={value}
                                  cx={cx}
                                  cy={cy}
                                  r={5}
                                  stroke="black"
                                  strokeWidth={2}
                                  fill="lime"
                                />
                              );
                            }
                            if (
                              (rankHistoryData.minRank !==
                                rankHistoryData.maxRank ||
                                rankHistoryData.minRankIdx !==
                                  rankHistoryData.maxRankIdx) &&
                              value === rankHistoryData.minRank &&
                              payload.index === rankHistoryData.minRankIdx
                            ) {
                              {
                                return (
                                  <circle
                                    key={value}
                                    cx={cx}
                                    cy={cy}
                                    r={5}
                                    stroke="black"
                                    strokeWidth={2}
                                    fill="red"
                                  />
                                );
                              }
                            }
                          }}
                        />
                      </LineChart>
                    </Flex>
                  )}

                  {isScoreGraphDataSet && (
                    <>
                      {/** PP distribution */}
                      {shownStat === 1 && (
                        <Flex direction="column" gap={30}>
                          <Title align="center">PP Distribution</Title>

                          <BarChart
                            width={730}
                            height={290}
                            data={scoreGraphData.pp.graphData.intervalArray}
                            margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="interval"
                              stroke="#ffffff"
                              padding={{ left: 10, right: 10 }}
                              hide
                            />
                            <XAxis
                              xAxisId="values"
                              stroke="#ffffff"
                              padding={{ left: 10, right: 10 }}
                              type="number"
                              domain={[
                                scoreGraphData.pp.graphData.histogramTicks
                                  .smallestTick,
                                scoreGraphData.pp.graphData.histogramTicks
                                  .largestTick,
                              ]}
                              tickCount={
                                scoreGraphData.pp.graphData.histogramTicks
                                  .tickCount
                              }
                              allowDataOverflow
                            >
                              <Label
                                value="PP"
                                offset={-30}
                                position="insideBottom"
                              />
                            </XAxis>
                            <YAxis
                              stroke="#ffffff"
                              domain={[0, "auto"]}
                              interval="preserveStartEnd"
                              label={{
                                value: "Number of plays",
                                angle: -90,
                                position: "insideBottomLeft",
                                offset: 20,
                              }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <Paper
                                      shadow="sm"
                                      p="sm"
                                      sx={{
                                        outline: "solid",
                                        borderRadius: "10px",
                                        color: "white",
                                      }}
                                      bg="rgba(50, 50, 50, .6)"
                                    >
                                      <Title order={6}>
                                        {label}pp - {label + ppInterval - 1}pp
                                      </Title>
                                      <Title order={2}>
                                        {payload[0].value}
                                      </Title>
                                    </Paper>
                                  );
                                }

                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="#daa520" />
                          </BarChart>

                          <Flex justify="center" gap={50}>
                            <Flex direction="column" justify="center">
                              <Title order={2}>
                                Mean{" "}
                                {Math.round(scoreGraphData.pp.mean * 100) / 100}
                                pp
                              </Title>
                              <Title order={2}>
                                Median{" "}
                                {Math.round(scoreGraphData.pp.median * 100) /
                                  100}
                                pp
                              </Title>
                            </Flex>
                            <Flex direction="column" gap={10}>
                              <Title align="center" order={4}>
                                Change Graph Interval
                              </Title>
                              <Flex direction="column" w={200}>
                                <Button
                                  onClick={() => setPpInterval(5)}
                                  mb={10}
                                >
                                  5
                                </Button>
                                <Button onClick={() => setPpInterval(10)}>
                                  10
                                </Button>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      )}

                      {/** Acc distribution */}
                      {shownStat === 2 && (
                        <Flex direction="column" gap={30}>
                          <Title align="center">Accuracy Distribution</Title>

                          <BarChart
                            width={730}
                            height={290}
                            data={scoreGraphData.acc.graphData.intervalArray}
                            margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="interval"
                              stroke="#ffffff"
                              padding={{ left: 10, right: 10 }}
                              tickFormatter={(tick) => tick / 10}
                            >
                              <Label
                                value="Accuracy"
                                offset={-30}
                                position="insideBottom"
                              />
                            </XAxis>
                            <YAxis
                              stroke="#ffffff"
                              domain={[0, "auto"]}
                              interval="preserveStartEnd"
                              label={{
                                value: "Number of plays",
                                angle: -90,
                                position: "insideBottomLeft",
                                offset: 20,
                              }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <Paper
                                      shadow="sm"
                                      p="sm"
                                      sx={{
                                        outline: "solid",
                                        borderRadius: "10px",
                                        color: "white",
                                      }}
                                      bg="rgba(50, 50, 50, .6)"
                                    >
                                      <Title order={6}>
                                        {(label / 10).toFixed(2)}%
                                        {label !== 1000
                                          ? ` - ${(
                                              label / 10 +
                                              accInterval -
                                              0.01
                                            ).toFixed(2)}%`
                                          : ""}
                                      </Title>
                                      <Title order={2}>
                                        {payload[0].value}
                                      </Title>
                                    </Paper>
                                  );
                                }

                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="#daa520" />
                          </BarChart>

                          <Flex justify="center" gap={50}>
                            <Flex direction="column" justify="center">
                              <Title order={2}>
                                Mean{" "}
                                {Math.round(scoreGraphData.acc.mean * 100) /
                                  100}
                                %
                              </Title>
                              <Title order={2}>
                                Median{" "}
                                {Math.round(scoreGraphData.acc.median * 100) /
                                  100}
                                %
                              </Title>
                            </Flex>
                            <Flex direction="column" gap={10}>
                              <Title align="center" order={4}>
                                Change Graph Interval
                              </Title>
                              <Flex direction="column" w={200}>
                                <Button
                                  onClick={() => setAccInterval(0.1)}
                                  mb={10}
                                >
                                  0.1
                                </Button>
                                <Button
                                  onClick={() => setAccInterval(0.5)}
                                  mb={10}
                                >
                                  0.5
                                </Button>
                                <Button onClick={() => setAccInterval(1)}>
                                  1
                                </Button>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      )}

                      {/** Date distribution */}
                      {shownStat === 3 && (
                        <Flex direction="column" gap={30}>
                          <Title align="center">Date Distribution</Title>

                          <BarChart
                            width={730}
                            height={290}
                            data={scoreGraphData.dateGraphData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="month"
                              stroke="#ffffff"
                              padding={{ left: 10, right: 10 }}
                              tickFormatter={(tick) =>
                                [
                                  "Jan",
                                  "Feb",
                                  "Mar",
                                  "Apr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Aug",
                                  "Sep",
                                  "Oct",
                                  "Nov",
                                  "Dec",
                                ][parseInt(tick.slice(2, 4))] +
                                "-" +
                                tick.slice(0, 2)
                              }
                            >
                              <Label
                                value="Month"
                                offset={-30}
                                position="insideBottom"
                              />
                            </XAxis>
                            <YAxis
                              stroke="#ffffff"
                              domain={[0, "auto"]}
                              interval="preserveStartEnd"
                              label={{
                                value: "Number of plays",
                                angle: -90,
                                position: "insideBottomLeft",
                                offset: 20,
                              }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <Paper
                                      shadow="sm"
                                      p="sm"
                                      sx={{
                                        outline: "solid",
                                        borderRadius: "10px",
                                        color: "white",
                                      }}
                                      bg="rgba(50, 50, 50, .6)"
                                    >
                                      <Title order={6}>
                                        {`${
                                          [
                                            "Jan",
                                            "Feb",
                                            "Mar",
                                            "Apr",
                                            "May",
                                            "Jun",
                                            "Jul",
                                            "Aug",
                                            "Sep",
                                            "Oct",
                                            "Nov",
                                            "Dec",
                                          ][parseInt(label.slice(-2)) - 1]
                                        } 20${label.slice(0, 2)}`}
                                      </Title>
                                      <Title order={2}>
                                        {payload[0].value}
                                      </Title>
                                    </Paper>
                                  );
                                }

                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="#daa520" />
                          </BarChart>
                        </Flex>
                      )}

                      {/** Time distribution */}
                      {shownStat === 4 && (
                        <Flex direction="column" gap={30}>
                          <Title align="center">Time Distribution</Title>

                          <BarChart
                            width={730}
                            height={290}
                            data={scoreGraphData.timeGraphData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="hour"
                              stroke="#ffffff"
                              padding={{ left: 10, right: 10 }}
                              tickFormatter={(hour) =>
                                `${
                                  hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                                }${hour < 12 ? "am" : "pm"}`
                              }
                            >
                              <Label
                                value="Time"
                                offset={-30}
                                position="insideBottom"
                              />
                            </XAxis>
                            <YAxis
                              stroke="#ffffff"
                              domain={[0, "auto"]}
                              interval="preserveStartEnd"
                              label={{
                                value: "Number of plays",
                                angle: -90,
                                position: "insideBottomLeft",
                                offset: 20,
                              }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <Paper
                                      shadow="sm"
                                      p="sm"
                                      sx={{
                                        outline: "solid",
                                        borderRadius: "10px",
                                        color: "white",
                                      }}
                                      bg="rgba(50, 50, 50, .6)"
                                    >
                                      <Title order={6}>
                                        {label === 0
                                          ? 12
                                          : label > 12
                                          ? label - 12
                                          : label}
                                        {label < 12 ? "am" : "pm"}
                                        {" - "}
                                        {label === 0
                                          ? 12
                                          : label > 12
                                          ? label - 12
                                          : label}
                                        {":59"}
                                        {label < 12 ? "am" : "pm"}
                                      </Title>
                                      <Title order={2}>
                                        {payload[0].value}
                                      </Title>
                                    </Paper>
                                  );
                                }

                                return null;
                              }}
                            />
                            <Bar dataKey="count" fill="#daa520" />
                          </BarChart>
                        </Flex>
                      )}

                      {/** Mod distribution */}
                      {shownStat === 5 && (
                        <Flex gap={30}>
                          <Flex direction="column">
                            <Title align="center">Mod Distribution</Title>
                            <PieChart width={600} height={475}>
                              <Pie
                                dataKey="count"
                                data={
                                  scoreGraphData.modsGraphData
                                    .modCombinationArray
                                }
                                cx="50%"
                                cy="50%"
                                outerRadius={200}
                                innerRadius={100}
                                fill="#8884d8"
                                labelLine={false}
                                label={({
                                  cx,
                                  cy,
                                  midAngle,
                                  outerRadius,
                                  mods,
                                  index,
                                  count,
                                }) => {
                                  console.log(
                                    scoreGraphData.modsGraphData
                                      .modCombinationArray
                                  );
                                  if (count > 1) {
                                    const radius = outerRadius + 50;
                                    const x =
                                      cx +
                                      radius * Math.cos(-midAngle * RADIAN);
                                    const y =
                                      cy +
                                      radius *
                                        Math.sin(-midAngle * RADIAN) *
                                        0.9;
                                    return (
                                      <text
                                        x={x}
                                        y={y}
                                        fill={COLORS[index % COLORS.length]}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {mods} ({count})
                                      </text>
                                    );
                                  }
                                }}
                              >
                                {scoreGraphData.modsGraphData.modCombinationArray.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>
                            </PieChart>
                          </Flex>

                          <Flex
                            direction="column"
                            gap={10}
                            h={500}
                            justify="center"
                          >
                            {scoreGraphData.modsGraphData.modCombinationArray.map(
                              (modObj, index) => (
                                <Flex>
                                  <Flex align="center" gap={5}>
                                    <IconCircle
                                      fill={COLORS[index % COLORS.length]}
                                      size={20}
                                    />
                                    <Title order={6}>{modObj.mods}</Title>
                                  </Flex>
                                </Flex>
                              )
                            )}
                          </Flex>

                          <Flex
                            direction="column"
                            gap={10}
                            h={500}
                            justify="center"
                          >
                            {scoreGraphData.modsGraphData.modCombinationArray.map(
                              (modObj) => (
                                <Flex>
                                  <Flex align="center" gap={5}>
                                    <Title order={6}>{modObj.count}</Title>
                                  </Flex>
                                </Flex>
                              )
                            )}
                          </Flex>
                        </Flex>
                      )}
                    </>
                  )}
                </Flex>
              </Flex>
            </Grid.Col>
          </Grid>
        )}

        {!isUserDataSet && doesUserExist && (
          <Center mb={10} mt={10}>
            <Paper w="50%" p="md" radius="md">
              <Flex
                direction={{ base: "row", sm: "column" }}
                gap={{ base: "md" }}
                justify={{ sm: "center" }}
                align={"center"}
              >
                <Loader size={60} />
                <Title order={2}>Loading profile...</Title>
              </Flex>
            </Paper>
          </Center>
        )}

        {!doesUserExist && (
          <Center mb={10} mt={10}>
            <Paper w="50%" p="md" radius="md">
              <Flex
                direction={{ base: "row", sm: "column" }}
                gap={{ base: "md" }}
                justify={{ sm: "center" }}
                align={"center"}
              >
                <IconZoomQuestion size={60} />
                <Title order={2}>Profile does not exist.</Title>
              </Flex>
            </Paper>
          </Center>
        )}
      </Flex>
    </>
  );
}

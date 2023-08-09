import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
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
} from "@mantine/core";
import Head from "next/head";
import {
  IconHammer,
  IconMinus,
  IconTriangle,
  IconTriangleInverted,
  IconZoomQuestion,
} from "@tabler/icons-react";
import { HeaderBar } from "@/components/HeaderBar";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

  const [scoreGraphData, setScoreGraphData] = useState({});
  const [isScoreGraphDataSet, setIsScoreGraphDataSet] = useState(false);

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

  const ppInterval = 5;
  const accInterval = 0.1;

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

      setScoreGraphData({
        ppGraphData: {
          mean: calculateMean(pps),
          median: calculateMedian(pps),
          graphData: groupNumbersByInterval(pps, ppInterval),
        },
        accGraphData: {
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

  // * Fetch best score data
  useEffect(() => {
    if (isUserDataSet) {
      fetchBestScoresDataHandler();
    }
  }, [isUserDataSet]);

  // ============================================= OUTPUT =============================================

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>

      <HeaderBar
        pages={[
          { label: "Profile", link: `/${router.query.username}` },
          { label: "Best Scores", link: `/${router.query.username}/best` },
          { label: "Recent Scores", link: `/${router.query.username}/recent` },
        ]}
        home={{ label: "Check another profile", link: "/" }}
        currPage="Profile"
      />
      <Flex direction="column" gap="md" justify="center" ml={25} mr={25}>
        {authTokenPresent && isUserDataSet && (
          <UserDetails
            userData={userData}
            statChangeData={{
              ppChange: 0,
              accChange: 0,
              rankChange: 0,
              showChanges: false,
            }}
            isVertical={false}
          />
        )}

        {isUserDataSet && (
          <>
            <Flex direction="column" align="center">
              <Flex direction="column">
                {isHitDataSet && (
                  <RingProgress
                    size={260}
                    thickness={30}
                    label={
                      <>
                        <Title order={3} align="center">
                          Total Hits and Misses
                        </Title>
                        <Text align="center">
                          {hitData.total.toLocaleString()}
                        </Text>
                      </>
                    }
                    sections={[
                      {
                        value: (hitData.count_300 / hitData.total) * 96,
                        color: "#4287f5",
                        tooltip: `300s: ${hitData.count_300.toLocaleString()} - ${(
                          (hitData.count_300 / hitData.total) *
                          100
                        ).toFixed(2)}%`,
                      },
                      { value: 1, color: "black" },
                      {
                        value: (hitData.count_100 / hitData.total) * 96,
                        color: "#42f560",
                        tooltip: `100s: ${hitData.count_100.toLocaleString()} - ${(
                          (hitData.count_100 / hitData.total) *
                          100
                        ).toFixed(2)}%`,
                      },
                      { value: 1, color: "black" },
                      {
                        value: (hitData.count_50 / hitData.total) * 96,
                        color: "#cef542",
                        tooltip: `50s: ${hitData.count_50.toLocaleString()} - ${(
                          (hitData.count_50 / hitData.total) *
                          100
                        ).toFixed(2)}%`,
                      },
                      { value: 1, color: "black" },
                      {
                        value: (hitData.count_miss / hitData.total) * 96,
                        color: "#c73c3c",
                        tooltip: `Misses: ${hitData.count_miss.toLocaleString()} - ${(
                          (hitData.count_miss / hitData.total) *
                          100
                        ).toFixed(2)}%`,
                      },
                      { value: 1, color: "black" },
                    ]}
                  />
                )}

                {isRankHistoryDataSet && (
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
                )}

                {isScoreGraphDataSet && (
                  <>
                    <Flex>
                      <BarChart
                        width={730}
                        height={250}
                        data={
                          scoreGraphData.ppGraphData.graphData.intervalArray
                        }
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                            scoreGraphData.ppGraphData.graphData.histogramTicks
                              .smallestTick,
                            scoreGraphData.ppGraphData.graphData.histogramTicks
                              .largestTick,
                          ]}
                          tickCount={
                            scoreGraphData.ppGraphData.graphData.histogramTicks
                              .tickCount
                          }
                          allowDataOverflow
                        />
                        <YAxis
                          stroke="#ffffff"
                          domain={["auto", "auto"]}
                          interval="preserveStartEnd"
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
                                  <Title order={2}>{payload[0].value}</Title>
                                </Paper>
                              );
                            }

                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#daa520" />
                      </BarChart>

                      <Flex direction="column">
                        <Title order={2}>
                          Mean{" "}
                          {Math.round(scoreGraphData.ppGraphData.mean * 100) /
                            100}
                          pp
                        </Title>
                        <Title order={2}>
                          Median{" "}
                          {Math.round(scoreGraphData.ppGraphData.median * 100) /
                            100}
                          pp
                        </Title>
                      </Flex>
                    </Flex>

                    <Flex>
                      <BarChart
                        width={730}
                        height={250}
                        data={
                          scoreGraphData.accGraphData.graphData.intervalArray
                        }
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="interval"
                          stroke="#ffffff"
                          padding={{ left: 10, right: 10 }}
                          tickFormatter={(tick) => tick / 10}
                        />
                        {/* <XAxis
                        xAxisId="values"
                        stroke="#ffffff"
                        padding={{ left: 10, right: 10 }}
                        type="number"
                        domain={[
                          scoreGraphData.accGraphData.ticks.smallestTick,
                          scoreGraphData.accGraphData.ticks.largestTick,
                        ]}
                        tickCount={scoreGraphData.accGraphData.ticks.tickCount}
                        allowDataOverflow
                        tickFormatter={(tick) => tick / 10}
                      /> */}
                        <YAxis
                          stroke="#ffffff"
                          domain={["auto", "auto"]}
                          interval="preserveStartEnd"
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
                                  <Title order={2}>{payload[0].value}</Title>
                                </Paper>
                              );
                            }

                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#daa520" />
                      </BarChart>

                      <Flex direction="column">
                        <Title order={2}>
                          Mean{" "}
                          {Math.round(scoreGraphData.accGraphData.mean * 100) /
                            100}
                          %
                        </Title>
                        <Title order={2}>
                          Median{" "}
                          {Math.round(
                            scoreGraphData.accGraphData.median * 100
                          ) / 100}
                          %
                        </Title>
                      </Flex>
                    </Flex>

                    <Flex>
                      <BarChart
                        width={730}
                        height={250}
                        data={scoreGraphData.dateGraphData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="#ffffff"
                          padding={{ left: 10, right: 10 }}
                          tickFormatter={(tick) =>
                            "20" + tick.slice(0, 2) + "-" + tick.slice(2, 4)
                          }
                        />
                        <YAxis
                          stroke="#ffffff"
                          domain={["auto", "auto"]}
                          interval="preserveStartEnd"
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
                                  <Title order={2}>{payload[0].value}</Title>
                                </Paper>
                              );
                            }

                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#daa520" />
                      </BarChart>
                    </Flex>
                  </>
                )}

                <ScrollArea h="25vh">
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
                    max combo{" "}
                    {userData.statistics.maximum_combo.toLocaleString()}
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
                    total score{" "}
                    {userData.statistics.total_score.toLocaleString()}
                  </Title>
                </ScrollArea>
              </Flex>
              <Paper w="50%" p="md" radius="md">
                <Flex direction="column" gap="md" align="center">
                  <IconHammer size={60} />
                  <Title order={2} align="center">
                    Work in progress, come back later!
                  </Title>
                </Flex>
              </Paper>
            </Flex>
          </>
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

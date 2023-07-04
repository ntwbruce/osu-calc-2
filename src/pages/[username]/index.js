import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import axios from "axios";
import { Button, Title, Flex } from "@mantine/core";
import Head from "next/head";
import SortableTable from "@/components/SortableTable";
import {
  calculateTotalPP,
  calculateTotalPPNoSelection,
} from "@/lib/calculators/PPCalculator";
import {
  calculateOverallAcc,
  calculateOverallAccNoSelection,
} from "@/lib/calculators/AccCalculator";
import { calculateRank } from "@/lib/calculators/RankCalculator";

// * Life cycle: get auth token (persists, refresh daily) --> get leaderboard data (persists, refresh daily) --> get user data --> get best/recent scores data
export default function UserProfilePage() {
  const router = useRouter();

  // ============================================= AUTH TOKEN FETCHING =============================================
  // ! This should eventually be moved to somewhere where it persists across the site's lifetime rather than re-fetched every time a user page is (re)loaded

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

  // ============================================= LEADERBOARD DATA FETCHING =============================================
  // ! This should eventually be moved to somewhere where it persists across the site's lifetime rather than re-fetched every time a user page is (re)loaded

  const [leaderboardData, setLeaderboardData] = useState({});
  const [isLeaderboardDataSet, setIsLeaderboardDataSet] = useState(false);

  async function fetchLeaderboardDataHandler() {
    try {
      const response = (await axios.get(`/api/rankings`)).data;
      setLeaderboardData(response.data);
      setIsLeaderboardDataSet(true);
    } catch (error) {
      console.log("error fetching leaderboard data: " + error.response.data); 
      setLeaderboardData([]);
      setIsLeaderboardDataSet(false);
    }
  }

  // * Fetch leaderboard data upon user page initialisation
  useEffect(() => {
    if (authTokenPresent) {
      fetchLeaderboardDataHandler();
    }
  }, [authTokenPresent]);

  // ============================================= USER DATA FETCHING =============================================

  const [userData, setUserData] = useState({});
  const [doesUserExist, setDoesUserExist] = useState(true);
  const [isUserDataSet, setIsUserDataSet] = useState(false);

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

  // ============================================= SCORE DATA FETCHING =============================================

  const [bestScoresData, setBestScoresData] = useState({});
  const [isBestScoresDataSet, setIsBestScoresDataSet] = useState(false);
  const [isShowingBestScores, setIsShowingBestScores] = useState(true);

  const [recentScoresData, setRecentScoresData] = useState({});
  const [isRecentScoresDataSet, setIsRecentScoresDataSet] = useState(false);
  const [isShowingRecentScores, setIsShowingRecentScores] = useState(false);

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

  // * Disable score selection buttons and recent score logic, implementing seperate pages for best and recent scores later

  // async function fetchRecentScoresDataHandler() {
  //   try {
  //     const response = (
  //       await axios.get(
  //         `/api/users/${userData.id}/scores/recent?include_fails=1&limit=100`
  //       )
  //     ).data;
  //     setRecentScoresData(response.data);
  //     setIsRecentScoresDataSet(true);
  //   } catch (error) {
  //     console.log("error fetching score data: " + error.response.data);
  //     setRecentScoresData([]);
  //     setIsRecentScoresDataSet(false);
  //   }
  // }

  // const fetchBestScoresButtonHandler = (event) => {
  //   event.preventDefault();
  //   fetchBestScoresDataHandler();
  //   setIsShowingBestScores(!isShowingBestScores);
  //   setIsShowingRecentScores(false);
  // };

  // const fetchRecentScoresButtonHandler = (event) => {
  //   event.preventDefault();
  //   fetchRecentScoresDataHandler();
  //   setIsShowingRecentScores(!isShowingRecentScores);
  //   setIsShowingBestScores(false);
  // };

  // ============================================= STAT CHANGE HANDLING =============================================

  const [statChangeData, setStatChangeData] = useState({
    ppChange: 0,
    accChange: 0,
    rankChange: 0,
  });
  const [PPValues, setPPValues] = useState([]);
  const [baseRawPPValue, setBaseRawPPValue] = useState(0);
  const [accValues, setAccValues] = useState([]);
  const [baseOverallAcc, setBaseOverallAcc] = useState(0);
  const [rankValues, setRankValues] = useState([]);
  const [baseRank, setBaseRank] = useState(0);
  const [areStatChangeValuesSet, setAreStatChangeValuesSet] = useState(false);

  const statChangeHandler = (selection) => {
    if (areStatChangeValuesSet) {
      const ppChange = calculateTotalPP(PPValues, selection) - baseRawPPValue;
      setStatChangeData({
        ppChange: ppChange,
        accChange: calculateOverallAcc(accValues, selection) - baseOverallAcc,
        rankChange: baseRank - calculateRank(userData.statistics.pp + ppChange, rankValues)
      });
    }
  };

  // * Set values for pp, acc and rank calculation once user data, leaderboard data, and best score data are available
  useEffect(() => {
    if (isUserDataSet && isBestScoresDataSet && isLeaderboardDataSet) {
      const ppValues = bestScoresData.map((score) => score.pp);
      setPPValues(ppValues);
      setBaseRawPPValue(calculateTotalPPNoSelection(ppValues));

      const accValues = bestScoresData.map((score) => score.accuracy);
      setAccValues(accValues);
      setBaseOverallAcc(calculateOverallAccNoSelection(accValues));

      const globalValues = leaderboardData.globalLeaderboardData.map(player => {
        return { 
          pp: player.pp, 
          rank: player.global_rank
        }
      });
      const countryValues = leaderboardData.countryLeaderboardData.map(player => {
        return { 
          pp: player.pp, 
          rank: player.global_rank
        }
      });
      setRankValues({ globalValues, countryValues });
      setBaseRank(userData.statistics.global_rank);

      setAreStatChangeValuesSet(true);
    }
  }, [isUserDataSet, isBestScoresDataSet, isLeaderboardDataSet]);

  // ============================================= OUTPUT =============================================

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>

      <Flex
        direction={{ base: "row", sm: "column" }}
        gap={{ base: "sm", sm: "md" }}
        justify={{ sm: "center" }}
      >
        {authTokenPresent && isUserDataSet && (
          <>
            <Button onClick={() => router.push("/")}>reset</Button>
            <UserDetails userData={userData} statChangeData={statChangeData} />
          </>
        )}

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "xl" }}
          justify={{ sm: "center" }}
        >
          {isUserDataSet && (
            <Button
              variant={isShowingBestScores ? "filled" : "outline"}
            >
              Best Scores
            </Button>
          )}

          {isUserDataSet && (
            <Button
              variant={isShowingRecentScores ? "filled" : "outline"}
            >
              Recent Scores
            </Button>
          )}
        </Flex>

        {isUserDataSet && isBestScoresDataSet && isShowingBestScores && areStatChangeValuesSet && (
          <>
            <Title order={1} align="center">
              Best Scores
            </Title>
            <SortableTable
              rawScoresData={bestScoresData}
              setStatChanges={statChangeHandler}
            />
          </>
        )}

        {isUserDataSet && isRecentScoresDataSet && isShowingRecentScores && (
          <>
            <Title order={1} align="center">
              Recent Scores
            </Title>
            <SortableTable
              rawScoresData={recentScoresData}
              setStatChanges={statChangeHandler}
            />
          </>
        )}

        {!doesUserExist && <Title order={2}>Profile does not exist.</Title>}
      </Flex>
    </>
  );
}

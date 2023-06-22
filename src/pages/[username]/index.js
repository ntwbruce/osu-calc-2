import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import axios from "axios";
import { Button, Title, Flex } from "@mantine/core";
import Head from "next/head";
import SortableTable from "@/components/SortableTable";
import { UserStatChangesProvider } from "@/context/UserStatChangesContext";
import {
  calculateTotalPP,
  calculateTotalPPNoSelection,
} from "@/lib/PPCalculator";
import {
  calculateOverallAcc,
  calculateOverallAccNoSelection,
} from "@/lib/AccCalculator";

export default function UserProfilePage() {
  const router = useRouter();

  const [authTokenPresent, setAuthTokenPresent] = useState(false);

  const [userData, setUserData] = useState({});
  const [doesUserExist, setDoesUserExist] = useState(true);
  const [isUserDataSet, setIsUserDataSet] = useState(false);

  const [bestScoresData, setBestScoresData] = useState({});
  const [isBestScoresDataSet, setIsBestScoresDataSet] = useState(false);
  const [isShowingBestScores, setIsShowingBestScores] = useState(false);

  const [recentScoresData, setRecentScoresData] = useState({});
  const [isRecentScoresDataSet, setIsRecentScoresDataSet] = useState(false);
  const [isShowingRecentScores, setIsShowingRecentScores] = useState(false);

  const [statChangeData, setStatChangeData] = useState({
    ppChange: 0,
    accChange: 0,
  });
  const [PPValues, setPPValues] = useState([]);
  const [baseRawPPValue, setBaseRawPPValue] = useState(0);
  const [accValues, setAccValues] = useState([]);
  const [baseOverallAcc, setBaseOverallAcc] = useState(0);
  const [arePPAccValuesSet, setArePPAccValuesSet] = useState(false);

  // * Fetch oauth token on homepage initialisation (runs upon new page reload)
  async function fetchAuthToken() {
    try {
      await axios.post("/api/accessToken");
      setAuthTokenPresent(true);
    } catch (error) {
      console.log("error fetching auth token: " + error.response.data);
      setAuthTokenPresent(false);
    }
  }

  useEffect(() => {
    fetchAuthToken();
  }, []);

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
        setAuthTokenPresent(true);
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

  async function fetchBestScoresDataHandler() {
    try {
      const response = (
        await axios.get(
          `/api/users/${userData.id}/scores/best?limit=${userData.scores_best_count}`
        )
      ).data;

      setBestScoresData(response.data);
      setIsBestScoresDataSet(true);

      // console.log("fetch best scores success");
      // console.log(score_data);
    } catch (error) {
      console.log("error fetching best scores: " + error.response.data);
      setBestScoresData([]);
      setIsBestScoresDataSet(false);
    }
  }

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchRecentScoresDataHandler() {
    try {
      const response = (
        await axios.get(
          `/api/users/${userData.id}/scores/recent?include_fails=1&limit=100`
        )
      ).data;

      //   console.log(response.data);
      setRecentScoresData(response.data);
      setIsRecentScoresDataSet(true);
    } catch (error) {
      console.log("error fetching score data: " + error.response.data);

      setRecentScoresData([]);
      setIsRecentScoresDataSet(false);
    }
  }

  function homeRedirectHandler() {
    router.push("/");
  }

  const fetchBestScoresButtonHandler = (event) => {
    event.preventDefault();
    fetchBestScoresDataHandler();
    setIsShowingBestScores(!isShowingBestScores);
    setIsShowingRecentScores(false);
  };

  const fetchRecentScoresButtonHandler = (event) => {
    event.preventDefault();
    fetchRecentScoresDataHandler();
    setIsShowingRecentScores(!isShowingRecentScores);
    setIsShowingBestScores(false);
  };

  const statChangeHandler = (selection) => {
    if (arePPAccValuesSet) {
      console.log(calculateOverallAcc(accValues, selection));
      console.log(calculateOverallAcc(accValues, selection) - baseOverallAcc);
      setStatChangeData({
        ppChange: calculateTotalPP(PPValues, selection) - baseRawPPValue,
        accChange: calculateOverallAcc(accValues, selection) - baseOverallAcc,
      });
    }
  };

  useEffect(() => {
    if (isUserDataSet && isBestScoresDataSet) {
      console.log(userData);
      console.log(bestScoresData);
      console.log(userData.statistics.hit_accuracy);
      const ppValues = bestScoresData.map((score) => score.pp);
      setPPValues(ppValues);
      setBaseRawPPValue(calculateTotalPPNoSelection(ppValues));
      const accValues = bestScoresData.map((score) => score.accuracy);
      setAccValues(accValues);
      setBaseOverallAcc(calculateOverallAccNoSelection(accValues));
      setArePPAccValuesSet(true);
    }
  }, [isUserDataSet, isBestScoresDataSet]);

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>

      <UserStatChangesProvider>
        <Flex
          direction={{ base: "row", sm: "column" }}
          gap={{ base: "sm", sm: "md" }}
          justify={{ sm: "center" }}
        >
          {authTokenPresent && isUserDataSet && (
            <>
              <Button onClick={homeRedirectHandler}>reset</Button>
              <UserDetails
                userData={userData}
                statChangeData={statChangeData}
              />
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
                onClick={fetchBestScoresButtonHandler}
              >
                Best Scores
              </Button>
            )}

            {isUserDataSet && (
              <Button
                variant={isShowingRecentScores ? "filled" : "outline"}
                onClick={fetchRecentScoresButtonHandler}
              >
                Recent Scores
              </Button>
            )}
          </Flex>

          {isUserDataSet && isBestScoresDataSet && isShowingBestScores && (
            <>
              <Title order={1} align="center">
                Best Scores
              </Title>
              <SortableTable
                rawScoresData={bestScoresData}
                baseOverallAcc={userData.statistics.hit_accuracy}
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
                baseOverallAcc={userData.statistics.hit_accuracy}
                setStatChanges={statChangeHandler}
              />
            </>
          )}

          {!doesUserExist && <p>Profile does not exist.</p>}
        </Flex>
      </UserStatChangesProvider>
    </>
  );
}

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
import { IconHammer, IconZoomQuestion } from "@tabler/icons-react";
import { HeaderBar } from "@/components/HeaderBar";
import { Cell, Pie, PieChart } from "recharts";

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
    }
  }, [userData]);

  useEffect(() => console.log(userData), [userData]);

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

  // ============================================= OUTPUT =============================================

  const COLORS = ["#4287f5", "#42f560", "#cef542", "#c73c3c"];

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

        {isUserDataSet && isHitDataSet && (
          <>
            <Flex direction="column" align="center">
              <Flex direction="row">
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
                      color: COLORS[0],
                      tooltip: `300s: ${hitData.count_300.toLocaleString()} - ${(
                        (hitData.count_300 / hitData.total) *
                        100
                      ).toFixed(2)}%`,
                    },
                    { value: 1, color: "black" },
                    {
                      value: (hitData.count_100 / hitData.total) * 96,
                      color: COLORS[1],
                      tooltip: `100s: ${hitData.count_100.toLocaleString()} - ${(
                        (hitData.count_100 / hitData.total) *
                        100
                      ).toFixed(2)}%`,
                    },
                    { value: 1, color: "black" },
                    {
                      value: (hitData.count_50 / hitData.total) * 96,
                      color: COLORS[2],
                      tooltip: `50s: ${hitData.count_50.toLocaleString()} - ${(
                        (hitData.count_50 / hitData.total) *
                        100
                      ).toFixed(2)}%`,
                    },
                    { value: 1, color: "black" },
                    {
                      value: (hitData.count_miss / hitData.total) * 96,
                      color: COLORS[3],
                      tooltip: `Misses: ${hitData.count_miss.toLocaleString()} - ${(
                        (hitData.count_miss / hitData.total) *
                        100
                      ).toFixed(2)}%`,
                    },
                    { value: 1, color: "black" },
                  ]}
                />
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
                    level {userData.statistics.level.current} + {userData.statistics.level.progress}%
                  </Title>
                  <Title order={4}>
                    max combo {userData.statistics.maximum_combo.toLocaleString()}
                  </Title>
                  <Title order={4}>
                    playtime {userData.statistics.play_time.toLocaleString()} seconds
                  </Title>
                  <Title order={4}>
                    ranked score {userData.statistics.ranked_score.toLocaleString()}
                  </Title>
                  <Title order={4}>
                    total score {userData.statistics.total_score.toLocaleString()}
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

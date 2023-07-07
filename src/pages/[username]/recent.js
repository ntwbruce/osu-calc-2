import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import axios from "axios";
import { Button, Title, Flex, Center, Paper, Loader } from "@mantine/core";
import Head from "next/head";
import SortableTable from "@/components/SortableTable";
import { IconHammer } from "@tabler/icons-react";

export default function UserRecentScoresPage() {
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
        {authTokenPresent && (
          <Flex gap={{ base: "sm" }} justify={{ sm: "center" }}>
            <Button onClick={() => router.back()} w="25%">
              Back
            </Button>
            <Button onClick={() => router.push("/")} w="25%">
              Reset
            </Button>
          </Flex>
        )}

        {authTokenPresent && isUserDataSet && (
          <UserDetails
            userData={userData}
            statChangeData={{
              ppChange: 0,
              accChange: 0,
              rankChange: 0,
              showChanges: false,
            }}
          />
        )}

        {isUserDataSet && (
          <>
            <Title order={1} align="center">
              Recent Scores
            </Title>
            <Center>
            <Paper w="50%" p="md" radius="md">
              <Flex
                direction={{ base: "row", sm: "column" }}
                gap={{ base: "md" }}
                justify={{ sm: "center" }}
                align={"center"}
              >
                <IconHammer size={60} />
              <Title order={2} align="center">
                Work in progress, come back later!
              </Title>
              </Flex>
            </Paper>
          </Center>
          </>
        )}

        {!doesUserExist && (
          <Center>
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

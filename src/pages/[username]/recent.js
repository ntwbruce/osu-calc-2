import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import axios from "axios";
import { Title, Flex, Center, Paper, Loader } from "@mantine/core";
import Head from "next/head";
import { IconHammer, IconZoomQuestion } from "@tabler/icons-react";
import { HeaderBar } from "@/components/HeaderBar";

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

      <HeaderBar
        pages={[
          { label: "Profile", link: `/${router.query.username}` },
          { label: "Best Scores", link: `/${router.query.username}/best` },
          { label: "Recent Scores", link: `/${router.query.username}/recent` },
        ]}
        home={{ label: "Check another profile", link: "/" }}
        currPage="Recent Scores"
      />

      <Flex
        direction="column"
        gap="md"
        justify="center"
        ml={25}
        mr={25}
      >
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

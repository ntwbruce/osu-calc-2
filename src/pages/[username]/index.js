import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import ScoresList from "@/components/ScoresList";
import axios from "axios";

export default function UserProfilePage() {
  const router = useRouter();

  const [authToken, setAuthToken] = useState(null);

  const [userData, setUserData] = useState({});
  const [doesUserExist, setDoesUserExist] = useState(true);
  const [isUserDataSet, setIsUserDataSet] = useState(false);

  const [bestScoresData, setBestScoresData] = useState({});
  const [isBestScoresDataSet, setIsBestScoresDataSet] = useState(false);

  const [recentScoresData, setRecentScoresData] = useState({});
  const [isRecentScoresDataSet, setIsRecentScoresDataSet] = useState(false);

  // * Fetch oauth token on homepage initialisation (runs upon new page reload)
  async function fetchAuthToken() {
    try {
      // * check if authToken already exists in sessionStorage, if yes, do not query for a new one
      if (!!sessionStorage.getItem("authToken")) {
        console.log("using cached authToken")
        setAuthToken(sessionStorage.getItem("authToken"));
      } else {
        // * get a new authToken based off our client id and secrets in environmental variables
        const auth_data = (await axios.post("/oauth/token", {
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
          grant_type: "client_credentials",
          scope: "public"
        })).data;

        setAuthToken(auth_data.access_token);

        // * save a copy of authToken in sessionStorage
        sessionStorage.setItem("authToken", auth_data.access_token);
        // console.log("fetch auth token success");
      }
    } catch (error) {
      console.log("error fetching auth token: " + error);
      setAuthToken(null);
    }
  }

  useEffect(() => {
    fetchAuthToken();
  }, []);

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  // ? Currently uses router.query.username to get username --> user must submit username from homepage, i.e. cannot directly go to /[username]. Fixable? 
  // * fixed by moving auth token into this page, since the index page is merely a search, there is no reason to query for authtoken so early
  async function fetchUserDataHandler(username) {
    // console.log('calling user data')
    // console.log(router.query.username)

    if (!!authToken) {
      try {
        const user_data = (await axios.get(`/api/v2/users/${username}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })).data;

        setUserData(user_data);
        setIsUserDataSet(true);
        setDoesUserExist(true);
      } catch (error) {
        if (error.response.status === 401) {
          // authToken is invalid now, request new authToken (since authToken expires in a day)
          fetchAuthToken();
        }
        else if (error.response.status === 404) {
          console.log("user does not exist!");
        } else {
          // probably a 500 internal server error
          console.log("error fetching user data");
        }
        setDoesUserExist(false);
      }
    }
  }
  // * Fetch user data upon user page initialisation
  useEffect(() => {
    if (router.isReady && !!authToken) {
      // wait for router to obtain username before querying user data, as well as waiting for a authToken to be present
      fetchUserDataHandler(router.query.username);
    }
  }, [router.isReady, authToken]);


  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchBestScoresDataHandler() {
    try {
      const score_data = (await axios.get(`/api/v2/users/${userData.id}/scores/best?limit=${userData.scores_best_count}&offset=1`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })).data;

      setBestScoresData(score_data);
      setIsBestScoresDataSet(true);

      // console.log("fetch best scores success");
      // console.log(score_data);
    } catch (error) {
      console.log("error fetching best scores: " + error);
      setBestScoresData({});
      setIsBestScoresDataSet(false);
    }
  }

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchRecentScoresDataHandler() {
    try {
      const score_data = (await axios.get(`/api/v2/users/${userData.id}/scores/recent?include_fails=1&limit=100&offset=1`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })).data;

      setRecentScoresData(score_data);
      setIsRecentScoresDataSet(true);
    } catch (error) {
      console.log("error fetching score data: " + error);

      setRecentScoresData({});
      setIsRecentScoresDataSet(false);
    }
  }

  function homeRedirectHandler() {
    router.push("/");
  }

  const fetchBestScoresButtonHandler = (event) => {
    event.preventDefault();
    fetchBestScoresDataHandler();
  }

  const fetchRecentScoresButtonHandler = (event) => {
    event.preventDefault();
    fetchRecentScoresDataHandler();
  }

  return (
    <>
      {!!authToken && isUserDataSet && (
        <>
          <button onClick={homeRedirectHandler}>reset</button>

          <hr />
          <UserDetails userData={userData} />
          <hr />
        </>
      )}

      {isUserDataSet && !isBestScoresDataSet && (
        <button onClick={fetchBestScoresButtonHandler}>best scores</button>
      )}

      {isBestScoresDataSet && (
        <>
          <h1>Best Scores</h1>
          <ScoresList data={bestScoresData} />
          <hr />
        </>
      )}

      {isUserDataSet && !isRecentScoresDataSet && (
        <button onClick={fetchRecentScoresButtonHandler}>recent scores</button>
      )}

      {isRecentScoresDataSet && (
        <>
          <h1>Recent Scores</h1>
          <ScoresList data={recentScoresData} />
          <hr />
        </>
      )}

      {!doesUserExist && <p>Profile does not exist.</p>}
    </>
  );
}

import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import UserDetails from "@/components/UserDetails";
import AuthTokenContext from "@/store/authtoken-context";
import ScoresList from "@/components/ScoresList";
import axios from "axios";

export default function UserProfilePage() {
  const router = useRouter();
  const { authToken } = useContext(AuthTokenContext);

  const [userData, setUserData] = useState({});
  const [doesUserExist, setDoesUserExist] = useState(true);
  const [isUserDataSet, setIsUserDataSet] = useState(false);

  const [bestScoresData, setBestScoresData] = useState({});
  const [isBestScoresDataSet, setIsBestScoresDataSet] = useState(false);

  const [recentScoresData, setRecentScoresData] = useState({});
  const [isRecentScoresDataSet, setIsRecentScoresDataSet] = useState(false);

  const axios_config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  // ? Currently uses router.query.username to get username --> user must submit username from homepage, i.e. cannot directly go to /[username]. Fixable? 
  async function fetchUserDataHandler(username) {
    // console.log('calling user data')
    // console.log(router.query.username)

    if (!!authToken) {
      try {
        const user_data = (await axios.get(`/api/v2/users/${username}`, axios_config)).data;

        setUserData(user_data);
        setIsUserDataSet(true);
        setDoesUserExist(true);
      } catch (error) {
        if (error.response.status === 404) {
          console.log("user does not exist!");
        } else {
          // probably a 500 internal server error
          console.log("error fetching user data");
        }
        setDoesUserExist(false);
      }
    }
  }

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchBestScoresDataHandler() {
    try {
      const score_data = (await axios.get(`/api/v2/users/${userData.id}/scores/best?limit=${userData.scores_best_count}&offset=1`, axios_config)).data;

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
      const score_data = (await axios.get(`/api/v2/users/${userData.id}/scores/recent?include_fails=1&limit=100&offset=1`, axios_config)).data;

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

  // * Fetch user data upon user page initialisation
  useEffect(() => {
    if (router.isReady) {
      // wait for router to obtain username before querying user data
      fetchUserDataHandler(router.query.username);
    }
  }, [router.isReady]);

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
      <button onClick={homeRedirectHandler}>reset</button>

      {isUserDataSet && (
        <>
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

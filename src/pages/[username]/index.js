import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import UserDetails from "@/components/UserDetails";
import AuthTokenContext from "@/store/authtoken-context";
import ScoresList from "@/components/ScoresList";

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

  const fetch_headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + authToken,
  };

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  // ? Currently uses router.query.username to get username --> user must submit username from homepage, i.e. cannot directly go to /[username]. Fixable? 
  async function fetchUserDataHandler() {
    if (authToken !== "") {
      // console.log(router);
      // console.log(authToken);
      const user_data = await fetch(
        `api/v2/users/${router.query.username}?key=username`,
        {
          method: "GET",
          headers: fetch_headers,
        }
      )
        .then((response) => response.json())
        .catch((err) => console.log("error fetching player data: " + err)); // TODO: throw error?
      if (typeof user_data.error === "undefined") {
        // console.log('fetch user data success');
        // console.log(user_data);
        setUserData(user_data);
        setIsUserDataSet(true);
        setDoesUserExist(true);
      } else {
        setDoesUserExist(false);
      }
    } else {
      console.log("auth token not updated"); // TODO: should not happen, maybe can assert()
    }
  }

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchBestScoresDataHandler(event) {
    event.preventDefault();

    const score_data = await fetch(
      `api/v2/users/${userData.id}/scores/best?limit=${userData.scores_best_count}&offset=1`,
      {
        method: "GET",
        headers: fetch_headers,
      }
    )
      .then((response) => response.json())
      .catch((err) => console.log("error fetching score data: " + err));

    // console.log("fetch best scores success");
    // console.log(score_data);

    setBestScoresData(score_data);
    setIsBestScoresDataSet(true);
  }

  // ? Is there a way to refactor this somewhere else so this file isn't 150+ lines long
  async function fetchRecentScoresDataHandler(event) {
    event.preventDefault();

    const score_data = await fetch(
      `api/v2/users/${userData.id}/scores/recent?include_fails=1&limit=100&offset=1`,
      {
        method: "GET",
        headers: fetch_headers,
      }
    )
      .then((response) => response.json())
      .catch((err) => console.log("error fetching score data: " + err));

    // console.log("fetch recent scores success");
    // console.log(score_data);

    setRecentScoresData(score_data);
    setIsRecentScoresDataSet(true);
  }

  function homeRedirectHandler() {
    router.push("/");
  }

  // * Fetch user data upon user page initialisation
  useEffect(() => {
    fetchUserDataHandler();
  }, []);

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
        <button onClick={fetchBestScoresDataHandler}>best scores</button>
      )}

      {isBestScoresDataSet && (
        <>
          <h1>Best Scores</h1>
          <ScoresList data={bestScoresData} />
          <hr />
        </>
      )}

      {isUserDataSet && !isRecentScoresDataSet && (
        <button onClick={fetchRecentScoresDataHandler}>recent scores</button>
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

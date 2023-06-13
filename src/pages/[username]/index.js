import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserDetails from "@/components/UserDetails";
import ScoresList from "@/components/ScoresList";
import axios from "axios";

export default function UserProfilePage() {
    const router = useRouter();

    const [authTokenPresent, setAuthTokenPresent] = useState(false);

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
            }
            else if (error.response.status === 404) {
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
            const response = (await axios.get(`/api/users/${userData.id}/scores/best?limit=${userData.scores_best_count}&offset=1`)).data;

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
            const response = (await axios.get(`/api/users/${userData.id}/scores/recent?include_fails=1&limit=100&offset=1`)).data;

            console.log(response.data);
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
    }

    const fetchRecentScoresButtonHandler = (event) => {
        event.preventDefault();
        fetchRecentScoresDataHandler();
    }

    return (
        <>
            {authTokenPresent && isUserDataSet && (
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

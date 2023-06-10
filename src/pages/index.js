import UsernameForm from "@/components/UsernameForm";
import Head from "next/head";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthTokenContext from "@/store/authtoken-context";

export default function HomePage() {
  const router = useRouter();
  const { setAuthToken } = useContext(AuthTokenContext);

  // * Fetch oauth token on homepage initialisation, store in context
  useEffect(() => {
    const auth_headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    async function fetchData() {
      const auth_data = await fetch("/oauth/token", {
        method: "POST",
        headers: auth_headers,
        body: `client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&client_secret=${process.env.NEXT_PUBLIC_CLIENT_SECRET}&grant_type=client_credentials&scope=public`,
      })
        .then((response) => response.json())
        .catch((err) => console.log("error getting auth token: " + err));

      setAuthToken(auth_data.access_token);
      // console.log("fetch auth token success");
    }
    fetchData();
  }, []);

  function userPageRedirectHandler(username) {
    router.push(`/${username}`);
  }

  return (
    <>
      <Head>
        <title>among us</title>
      </Head>

      <h1>le osu game a la peppy</h1>
      <UsernameForm onSubmit={userPageRedirectHandler} />
    </>
  );

  // import ojsama from 'ojsama';
  // async function testMapHandler(event) {
  //   event.preventDefault();

  //   const map_text = await fetch(`osu/3963421`, {
  //     method: "GET",
  //     headers: fetch_headers,
  //   })
  //     .then((response) => response.text())
  //     .catch((err) => console.log("error fetching map text: " + err));

  //   console.log(map_text);
  //   const { map } = new ojsama.parser().feed(map_text);
  //   console.log(map);
  //   const stars = new ojsama.std_diff().calc({ map, mods: 64 });
  //   console.log(Math.ceil(stars.total * 100) / 100.0);
  // }
}

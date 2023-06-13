import UsernameForm from "@/components/UsernameForm";
import { Flex, Title, Button } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  function userPageRedirectHandler(username) {
    router.push(`/${username}`);
  }

  const link1 = "https://www.youtube.com/watch?v=3d_l_Kyb5GM";
  const link2 = "https://www.youtube.com/watch?v=NY0ffyEu6uo";

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>
      <Link href={Math.random() > 0.4 ? link1 : link2} target="_blank">
        <Button type="button">I'm feeling lucky (viewer discretion)</Button>
      </Link>
      <Flex
        direction={{ base: "row", sm: "column" }}
        gap={{ base: "sm", sm: "xl" }}
        justify={{ sm: "center" }}
      >
        <Title order={1} align="center">
          le osu game a la peppy
        </Title>
        <UsernameForm onSubmit={userPageRedirectHandler} />
      </Flex>
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

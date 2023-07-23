import UsernameForm from "@/components/UsernameForm";
import { Flex, Title, Button } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const link1 = "https://www.youtube.com/watch?v=3d_l_Kyb5GM";
  const link2 = "https://www.youtube.com/watch?v=NY0ffyEu6uo";

  return (
    <>
      <Head>
        <title>silver wolf cheese slap meme</title>
      </Head>
      <Link href={Math.random() > 0.8 ? link1 : link2} target="_blank">
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
        <UsernameForm onSubmit={username => router.push(`/${username}/best`)} />
      </Flex>
    </>
  );
}

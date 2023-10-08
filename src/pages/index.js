import UsernameForm from "@/components/UsernameForm";
import { Flex, Title, Button, Text } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>osu!calc</title>
      </Head>

      <Flex
        direction={{ base: "row", sm: "column" }}
        justify={{ sm: "center" }}
        m={20}
      >
        <Title size={200} align="center">
          osu!calc
        </Title>

        <Text size={44} align="center" pb={60}>
          View detailed profile stats and scores!
        </Text>

        <UsernameForm onSubmit={(username) => router.push(`/${username}`)} />
      </Flex>
    </>
  );
}

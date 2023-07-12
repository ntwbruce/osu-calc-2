import { Title, Flex, Image, BackgroundImage, Center } from "@mantine/core";
import { useEffect } from "react";
import Flag from "react-flagkit";

export default function UserDetails({ userData, statChangeData }) {
  const pfp = userData.avatar_url;
  const username = userData.username;
  const playmode =
    userData.playmode === "osu"
      ? "Standard"
      : userData.playmode === "taiko"
      ? "Taiko"
      : userData.playmode === "mania"
      ? "Mania"
      : "Catch";
  const global_rank = userData.statistics.is_ranked
    ? userData.statistics.global_rank
    : "--";
  const pp = userData.statistics.is_ranked ? userData.statistics.pp : "--";
  const acc = userData.statistics.hit_accuracy;
  const cover_url = userData.cover_url;
  const country_code = userData.country_code;

  const { ppChange, accChange, rankChange, showChanges } = statChangeData;

  useEffect(() => {
    console.log(userData);
  }, []);

  return (
    <Center>
      <BackgroundImage
        src={cover_url}
        sx={{
          position: "relative",
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
        w="80%"
        h={300}
        mb={10}
        mt={10}
      >
        <Flex
          mih="100%"
          bg="rgba(0, 0, 0, .6)"
          gap="5%"
          justify="center"
          align="center"
          direction="row"
        >
          <Flex
            direction="column"
            gap={"md"}
            justify="center"
            align="center"
            ml="5%"
          >
            <Image width="12rem" height="12rem" src={pfp} radius="lg" />
            <Title order={2} align="center">
              {username} {<Flag country={country_code} />}
            </Title>
          </Flex>

          <Flex
            w="70%"
            mih="100%"
            gap="10%"
            justify="center"
            align="center"
            direction="row"
            wrap="wrap"
            mr="5%"
          >
            <Flex direction="column" justify="center" align="center">
              <Title order={4}>MODE</Title>
              <Title>{playmode}</Title>
            </Flex>

            <Flex direction="column" justify="center" align="center">
              <Title order={4}>RANK</Title>
              <Title>
                {showChanges ? global_rank - rankChange : global_rank}
              </Title>
              {showChanges && (
                <Title order={3}>
                  ({rankChange > 0 ? "+" : ""}
                  {rankChange})
                </Title>
              )}
            </Flex>

            <Flex direction="column" justify="center" align="center">
              <Title order={4}>PERFORMANCE</Title>
              <Title>
                {pp === "--"
                  ? pp
                  : showChanges
                  ? (Math.round((pp + ppChange) * 100) / 100.0).toFixed(2)
                  : pp.toFixed(2)}
                pp
              </Title>
              {showChanges && (
                <Title order={3}>
                  ({(Math.round(ppChange * 100) / 100.0).toFixed(2)}pp)
                </Title>
              )}
            </Flex>

            <Flex direction="column" justify="center" align="center">
              <Title order={4}>ACCURACY</Title>
              <Title>
                {showChanges
                  ? `${(acc + Math.round(accChange * 100) / 100).toFixed(2)}`
                  : acc.toFixed(2)}
                %
              </Title>
              {showChanges && (
                <Title order={3}>
                  ({accChange > 0 ? "+" : ""}
                  {accChange.toFixed(2)}%)
                </Title>
              )}
            </Flex>
          </Flex>
        </Flex>
      </BackgroundImage>
    </Center>
  );
}

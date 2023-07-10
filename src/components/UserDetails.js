import { Title, Flex, Image, BackgroundImage, Center } from "@mantine/core";
import { useEffect } from "react";

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
  // const country_code = userData.country_code;
  // const country_rank = userData.statistics.is_ranked
  //   ? userData.statistics.country_rank
  //   : "--";
  const pp = userData.statistics.is_ranked ? userData.statistics.pp : "--";
  const acc = userData.statistics.hit_accuracy;
  const cover_url = userData.cover_url;

  const { ppChange, accChange, rankChange, showChanges } = statChangeData;

  return (
    <Center>
      <BackgroundImage
        src={cover_url}
        sx={{ position: "relative", outline: "solid", borderRadius: "10px" }}
        w="80%"
        h={300}
        mb={10}
        mt={10}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "2",
            borderRadius: "10px",
          }}
        />
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap="xl"
          justify={{ sm: "center" }}
          h={300}
        >
          <Center>
            <Image
              width="15rem"
              height="15rem"
              src={pfp}
              sx={{ zIndex: "3", borderRadius: "10px" }}
            />
          </Center>
          <Flex
            direction={{ base: "row", sm: "column" }}
            gap="md"
            justify={{ sm: "center" }}
            sx={{ zIndex: "3", color: "white" }}
          >
            <Title order={1}>{username}</Title>
            <Title order={3}>Mode: {playmode}</Title>
            <Title order={3}>
              Rank: {showChanges ? global_rank - rankChange : global_rank}{" "}
              {showChanges ? `(${rankChange > 0 ? "+" : ""}${rankChange})` : ""}
            </Title>
            <Title order={3}>
              PP:{" "}
              {pp === "--"
                ? pp
                : (showChanges
                  ? (Math.round((pp + ppChange) * 100) / 100.0).toFixed(2)
                  : pp.toFixed(2))
              }pp{" "}
              {showChanges
                ? `(${(Math.round(ppChange * 100) / 100.0).toFixed(2)}pp)`
                : ""}
            </Title>
            <Title order={3}>
              Accuracy:{" "}
              {showChanges
                ? `${(acc + Math.round(accChange * 100) / 100).toFixed(2)}`
                : acc.toFixed(2)}
              %{" "}
              {showChanges
                ? `(${accChange > 0 ? "+" : ""}${accChange.toFixed(2)}%)`
                : ""}
            </Title>
          </Flex>
        </Flex>
      </BackgroundImage>
    </Center>
  );
}

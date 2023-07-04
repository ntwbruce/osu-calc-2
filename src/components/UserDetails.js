import { Title, Flex, Image, BackgroundImage, Overlay } from "@mantine/core";
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
  const country_code = userData.country_code;
  const country_rank = userData.statistics.is_ranked
    ? userData.statistics.country_rank
    : "--";
  const pp = userData.statistics.is_ranked ? userData.statistics.pp : "--";
  const acc = userData.statistics.hit_accuracy;
  const cover_url = userData.cover_url;

  const { ppChange, accChange, rankChange } = statChangeData;

  return (
    <BackgroundImage src={cover_url} sx={{ position: "relative" }}>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: "2",
        }}
      />
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap="xl"
        justify={{ sm: "center" }}
      >
        <Image width="15rem" height="15rem" src={pfp} sx={{ zIndex: "3" }} />
        <Flex
          direction={{ base: "row", sm: "column" }}
          gap="md"
          justify={{ sm: "center" }}
          sx={{ zIndex: "3", color: "white" }}
        >
          <Title order={1}>{username}</Title>
          <Title order={3}>Mode: {playmode}</Title>
          <Title order={3}>
            Rank: {global_rank - rankChange} ({rankChange > 0 ? "+" : ""}{rankChange}) 
          </Title>
          <Title order={3}>
            PP: {(Math.round((pp + ppChange) * 100) / 100.0).toFixed(2)}pp (
            {(Math.round(ppChange * 100) / 100.0).toFixed(2)}pp)
          </Title>
          <Title order={3}>
            Accuracy:{" "}
            {`${(acc + Math.round(accChange * 100) / 100).toFixed(2)}% 
          (${accChange > 0 ? "+" : ""}${accChange.toFixed(2)}%)`}
          </Title>
        </Flex>
      </Flex>
    </BackgroundImage>
  );
}

import { Title, Flex, Image } from "@mantine/core";
import styles from "./UserDetails.module.css";
import { useContext } from "react";
import UserStatChangesContext from "@/context/UserStatChangesContext";

export default function UserDetails({ userData }) {
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
  const acc = userData.statistics.hit_accuracy.toFixed(2);

  const { userStatChanges } = useContext(UserStatChangesContext);

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      gap="xl"
      justify={{ sm: "center" }}
    >
      <Image width="15rem" height="15rem" src={pfp} />
      <Flex
        direction={{ base: "row", sm: "column" }}
        gap="md"
        justify={{ sm: "center" }}
      >
        <Title order={1}>{username}</Title>
        <Title order={3}>Mode: {playmode}</Title>
        <Title order={3}>
          Rank: {global_rank} ({country_code}#{country_rank}) (0)
        </Title>
        <Title order={3}>
          PP: {(Math.round((pp + userStatChanges.ppChange) * 100) / 100.0).toFixed(2)}pp 
          ({(Math.round(userStatChanges.ppChange * 100) / 100.0).toFixed(2)}pp)
        </Title>
        <Title order={3}>Accuracy: {`${acc}% (0.00%)`}</Title>
      </Flex>
    </Flex>
  );
}

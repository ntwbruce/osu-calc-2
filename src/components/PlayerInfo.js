import {
  Title,
  Flex,
  Image,
  BackgroundImage,
  Center,
  Tooltip,
  Container,
} from "@mantine/core";
import ReactCountryFlag from "react-country-flag";

export default function PlayerInfo({ userData, statChangeData, isVertical }) {
  const pfp = userData.avatar_url;
  const username = userData.username;
  const global_rank = userData.statistics.is_ranked
    ? userData.statistics.global_rank
    : "--";
  const pp = userData.statistics.is_ranked ? userData.statistics.pp : "--";
  const acc = userData.statistics.hit_accuracy;
  const cover_url = userData.cover_url;
  const country_code = userData.country_code;
  const country_name = userData.country.name;
  const playmode = userData.playmode;

  const { ppChange, accChange, rankChange, showChanges } = statChangeData;

  return (
    <Center>
      <BackgroundImage
        src={cover_url}
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
        h={isVertical ? "87vh" : 300}
        mb={10}
        mt={10}
      >
        <Flex
          mih="100%"
          bg="rgba(0, 0, 0, .7)"
          justify="center"
          align="center"
          direction={isVertical ? "column" : "row"}
          gap={10}
        >
          <Flex
            direction="column"
            gap="md"
            justify="center"
            align="center"
            m={20}
          >
            <Image
              width="12rem"
              height="12rem"
              src={pfp}
              radius="lg"
              sx={{
                outline: "solid",
                borderRadius: "18px",
                color: "white",
              }}
            />
            <Flex align="center">
              <Title order={1} align="center">
                {username}
              </Title>
              <Tooltip label={country_name}>
                <Container>
                  <ReactCountryFlag
                    countryCode={country_code}
                    svg
                    style={{
                      width: "2em",
                      height: "2em",
                    }}
                  />
                </Container>
              </Tooltip>
            </Flex>
          </Flex>

          <Flex
            w="60%"
            h="60%"
            gap="10%"
            justify="center"
            direction={isVertical ? "column" : "row"}
          >
            <Flex
              direction="column"
              justify="center"
              align="center"
              mt={10}
              mb={10}
            >
              <Image src={`/playmodes/${playmode}.png`} width={60} />
              <Title>
                {playmode === "osu"
                  ? "Standard"
                  : playmode === "taiko"
                  ? "Taiko"
                  : playmode === "mania"
                  ? "Mania"
                  : "Catch"}
              </Title>
            </Flex>

            <Flex
              direction="column"
              justify="center"
              align="center"
              mt={10}
              mb={10}
            >
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

            <Flex
              direction="column"
              justify="center"
              align="center"
              mt={10}
              mb={10}
            >
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

            <Flex
              direction="column"
              justify="center"
              align="center"
              mt={10}
              mb={10}
            >
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

export function PlayerInfoSimple({ userData, isVertical }) {
  const pfp = userData.avatar_url;
  const username = userData.username;
  const cover_url = userData.cover_url;
  const country_code = userData.country_code;
  const country_name = userData.country.name;

  return (
    <Center>
      <BackgroundImage
        src={cover_url}
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
        h={isVertical ? "87vh" : 250}
        mb={10}
        mt={10}
      >
        <Flex
          mih="100%"
          bg="rgba(0, 0, 0, .7)"
          justify="center"
          align="center"
          direction={isVertical ? "column" : "row"}
          gap={60}
        >
          <Image
            width="12rem"
            height="12rem"
            src={pfp}
            radius="lg"
            sx={{
              outline: "solid",
              borderRadius: "18px",
              color: "white",
            }}
          />

          <Flex align="center" gap={20}>
            <Title size={70} align="center">
              {username}
            </Title>
            <Tooltip label={country_name}>
              <Container>
                <ReactCountryFlag
                  countryCode={country_code}
                  svg
                  style={{
                    width: "4em",
                    height: "4em",
                  }}
                />
              </Container>
            </Tooltip>
          </Flex>
        </Flex>
      </BackgroundImage>
    </Center>
  );
}

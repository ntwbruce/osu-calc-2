import { BackgroundImage, Center, Flex, Grid, Title } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";

export default function Score({ scoreData }) {
  return (
    <Center m={20}>
      <BackgroundImage
        src={scoreData.background}
        h={110}
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
      >
        <Grid h={120} bg="rgba(0, 0, 0, .75)" justify="center" align="center" grow>
          <Grid.Col span={1}>
            <Flex direction="column" justify="center" ml="20px">
              <Title>{scoreData.index + 1}</Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={6}>
            <Flex direction="column" align="flex-start">
              <Title order={5}>{scoreData.artist}</Title>
              <Title order={3}>{scoreData.title}</Title>
              <Title order={5}>
                [{scoreData.difficulty}] ({scoreData.mapper})
              </Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex direction="column" justify="center" align="center">
              <Title order={2}>{scoreData.mods}</Title>
              <Title order={2}>
                {scoreData.sr.toFixed(2)}
                {scoreData.sr_multiplier}{" "}
                {<IconStarFilled />}
              </Title>
              <Title order={6}>
                {scoreData.date.toLocaleString()}
              </Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex
              direction="column"
              justify="center"
              align="flex-end"
              mr="20px"
            >
              <Title order={1}>{scoreData.rank}</Title>
              <Title order={5}>{(scoreData.acc * 100).toFixed(2)}%</Title>
              <Title order={3}>{scoreData.pp.toFixed(2)}pp</Title>
            </Flex>
          </Grid.Col>
        </Grid>
      </BackgroundImage>
    </Center>
  );
}

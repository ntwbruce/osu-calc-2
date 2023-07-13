import { BackgroundImage, Center, Flex, Grid, Title } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";

export default function Score({ scoreData }) {
  return (
    <Center>
      <BackgroundImage
        src={scoreData.background}
        h={110}
        w="60%"
        sx={{
          outline: "solid",
          borderRadius: "10px",
          color: "white",
        }}
      >
        <Grid h={120} bg="rgba(0, 0, 0, .7)" justify="center" align="center">
          <Grid.Col span={1}>
            <Flex direction="column" justify="center" ml="10px">
              <Title>{scoreData.index + 1}</Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={4}>
            <Flex direction="column" justify="center" align="flex-start">
              <Title order={5}>{scoreData.artist}</Title>
              <Title order={3}>{scoreData.title}</Title>
              <Title order={5}>
                [{scoreData.difficulty}] ({scoreData.mapper})
              </Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex direction="column" justify="center" align="center">
              <Title order={2}>
                {scoreData.sr.toFixed(2)}
                {scoreData.sr_multiplier}
                {<IconStarFilled />}
              </Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex direction="column" justify="center" align="center">
              <Title order={2}>{scoreData.mods}</Title>
            </Flex>
          </Grid.Col>

          <Grid.Col span={2}>
            <Flex
              direction="column"
              justify="center"
              align="flex-end"
              mr="10px"
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
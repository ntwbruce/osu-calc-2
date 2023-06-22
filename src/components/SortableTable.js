import { useContext, useEffect, useState } from "react";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Flex,
  NavLink,
  Checkbox,
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import UserStatChangesContext from "@/context/UserStatChangesContext";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: rem(21),
    height: rem(21),
    borderRadius: rem(21),
  },
}));

// For table header styling.
function Th({ children, isReverseSorted, isActiveSortingParam, onSort }) {
  const { classes } = useStyles();
  const Icon = isActiveSortingParam
    ? isReverseSorted
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size="0.9rem" stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

/**
 * Filters data by given search parameters object.
 * @param {*} data to be filtered.
 * @param {*} search object containing parameters (map name, mapper name etc) to filter by.
 * @returns filtered data.
 */
function filterData(data, search) {
  const { map, mapper } = search;
  const mapQuery = map.toLowerCase().trim();
  const mapperQuery = mapper.toLowerCase().trim();
  return data.filter(
    (item) =>
      item["map"].toLowerCase().includes(mapQuery) &&
      item["mapper"].toLowerCase().includes(mapperQuery)
  );
}

/**
 * Sorts data by parameters given in payload object.
 * @param {*} data to be sorted.
 * @param {*} payload containing sorting parameter (sortingParam), boolean for sorting in reverse (reversed) and a search parameters object (search).
 * @returns sorted data.
 */
function sortData(data, payload) {
  const { sortingParam, reversed, search } = payload;

  if (!sortingParam) {
    return filterData(data, search);
  }

  // Sorted differently based on which parameter is being used
  return filterData(
    [...data].sort((first, second) => {
      if (reversed) {
        [first, second] = [second, first];
      }

      let compValue = 0;
      switch (sortingParam) {
        case "index":
          compValue = first[sortingParam] - second[sortingParam];
          break;

        case "mods":
          const multipliers = {
            NM: 1.0,
            EZ: 0.5,
            NF: 0.49,
            HT: 0.3,
            HR: 1.06,
            SD: 1.01,
            PF: 1.02,
            DT: 1.13,
            NC: 1.12,
            HD: 1.05,
            FL: 1.1,
            SO: 0.9,
          };
          const firstMultiplier = Array.isArray(first[sortingParam])
            ? first[sortingParam].reduce(
                (acc, curr) => acc * multipliers[curr],
                1.0
              )
            : multipliers[first[sortingParam]];
          const secondMultiplier = Array.isArray(second[sortingParam])
            ? second[sortingParam].reduce(
                (accum, curr) => accum * multipliers[curr],
                1.0
              )
            : multipliers[second[sortingParam]];
          compValue = secondMultiplier - firstMultiplier;
          break;

        case "sr":
        case "pp":
        case "acc":
          compValue = second[sortingParam] - first[sortingParam];
          break;

        case "rank":
          const ranks = ["SS", "S", "A", "B", "C", "D", "F"];
          compValue =
            ranks.findIndex((rank) => rank === first[sortingParam]) -
            ranks.findIndex((rank) => rank === second[sortingParam]);
          break;

        default:
          compValue = first[sortingParam].localeCompare(second[sortingParam]);
          break;
      }
      return compValue;
    }),
    search
  );
}

export default function SortableTable({ rawScoresData, baseOverallAcc, setStatChanges }) {
  // Data manipulated into a more convenient format
  const scoresData = rawScoresData.map((score, index) => {
    return {
      index,
      beatmap_id: score.beatmap.id,
      user_id: score.user_id,
      map: `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`,
      mapper: score.beatmapset.creator,
      sr: score.beatmap.difficulty_rating,
      sr_multiplier:
        score.mods.includes("DT") ||
        score.mods.includes("NC") ||
        score.mods.includes("FL") ||
        score.mods.includes("HR") ||
        score.mods.includes("EZ")
          ? "*"
          : "",
      mods: score.mods.length >= 1 ? score.mods : "NM",
      pp: score.pp,
      acc: score.accuracy,
      rank:
        score.rank === "X" || score.rank === "XH"
          ? "SS"
          : score.rank === "SH"
          ? "S"
          : score.rank,
    }
  });

  // Search states
  const [mapSearch, setMapSearch] = useState("");
  const [mapperSearch, setMapperSearch] = useState("");

  // Sorting states
  const [sortingParam, setSortingParam] = useState(null);
  const [isReverseSorted, setIsReverseSorted] = useState(false);

  // Score state
  const [sortedData, setSortedData] = useState(scoresData);

  // Selection state
  const [selection, setSelection] = useState(new Array(sortedData.length).fill(false));

  // Stat changes context
  const { userStatChanges, setUserStatChanges } = useContext(UserStatChangesContext);

  // // Stuff for pp and acc recalculation when 'deleting' scores
  // const pps = scoresData.map(score => score.pp);
  // const baseTotalRawPP = pps.reduce((acc, curr, index) => acc + curr * Math.pow(0.95, index++), 0);

  // const accs = scoresData.map(score => score.acc);

  // const calculateRawPP = () => {
  //   let count = 0;
  //   return pps.reduce((acc, curr, index) => acc + (selection[index] ? 0 : curr * Math.pow(0.95, count++)), 0);
  // };

  // const calculateOverallAcc = () => {
  //   let count = 0;
  //   const accSum = accs.reduce((acc, curr, index) => acc + (selection[index] ? 0 : curr * Math.pow(0.95, count++)), 0);
  //   return count === 100 ? baseOverallAcc : 100 / (20 * (1 - Math.pow(0.95, count))) * accSum;
  // }

  // Recalculate stats and update stat changes context every time selection array is changed
  useEffect(() => { 
    setStatChanges(selection);
  }, [selection]);

  // Handler for changing sort parameter/reverse sort
  const sortChangeHandler = (field) => {
    const toReverse = field === sortingParam ? !isReverseSorted : false;
    setIsReverseSorted(toReverse);
    setSortingParam(field);
    setSortedData(
      sortData(scoresData, {
        sortingParam: field,
        reversed: toReverse,
        search: { map: mapSearch, mapper: mapperSearch },
      })
    );
  };

  // Handler for updating map name search state
  const mapSearchChangeHandler = (event) => {
    const { value } = event.currentTarget;
    setMapSearch(value);
    setSortedData(
      sortData(scoresData, {
        sortingParam,
        reversed: isReverseSorted,
        search: { map: value, mapper: mapperSearch },
      })
    );
  };

  // Handler for updating mapper name search state
  const mapperSearchChangeHandler = (event) => {
    const { value } = event.currentTarget;
    setMapperSearch(value);
    setSortedData(
      sortData(scoresData, {
        sortingParam,
        reversed: isReverseSorted,
        search: { map: mapSearch, mapper: value },
      })
    );
  };

  // Handler for updating selection state 
  const rowSelectionToggleHandler = (selectedIndex) => {
    setSelection((currSelection) => currSelection.map((curr, index) => (index === selectedIndex) ? !curr : curr));
  };

  const rows = sortedData.map((row) => (
    <tr key={row.index}>
      <td>{row.index + 1}</td>
      <td>
        <NavLink
          component="a"
          href={`/beatmaps/${row.beatmap_id}/scores/users/${row.user_id}`}
          label={row.map}
          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
        />
      </td>
      <td>{row.mapper}</td>
      <td>{row.mods}</td>
      <td>
        {(Math.round(row.sr * 100) / 100).toFixed(2)}
        {row.sr_multiplier}
      </td>
      <td>{(Math.round(row.pp * 100) / 100).toFixed(2)}</td>
      <td>{(row.acc * 100).toFixed(2)}</td>
      <td>{row.rank}</td>
      <td><Checkbox checked={selection[row.index]} onChange={() => rowSelectionToggleHandler(row.index)} transitionDuration={0} /></td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Flex gap={{ base: "sm", sm: "lg" }} justify={{ sm: "center" }}>
        <TextInput
          placeholder="Search by map name"
          mb="md"
          w="20rem"
          icon={<IconSearch size="0.9rem" stroke={1.5} />}
          value={mapSearch}
          onChange={mapSearchChangeHandler}
        />

        <TextInput
          placeholder="Search by mapper"
          mb="md"
          w="20rem"
          icon={<IconSearch size="0.9rem" stroke={1.5} />}
          value={mapperSearch}
          onChange={mapperSearchChangeHandler}
        />
      </Flex>
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        miw={700}
        sx={{ tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <Th
              isActiveSortingParam={sortingParam === "index"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("index")}
            >
              Index
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "map"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("map")}
            >
              Map
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "mapper"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("mapper")}
            >
              Mapper
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "mods"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("mods")}
            >
              Mods
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "sr"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("sr")}
            >
              Star Rating
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "pp"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("pp")}
            >
              Peformance (pp)
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "acc"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("acc")}
            >
              Accuracy (%)
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "rank"}
              isReverseSorted={isReverseSorted}
              onSort={() => sortChangeHandler("rank")}
            >
              Rank
            </Th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={8}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

import { useEffect, useState } from "react";
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
  Select,
  Button,
  Title,
  NumberInput,
  Drawer,
  MultiSelect,
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

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
  const {
    map,
    mapper,
    minPP,
    maxPP,
    minAcc,
    maxAcc,
    minSR,
    maxSR,
    mods,
    rank,
  } = search;
  return data.filter(
    (item) =>
      item["map"].toLowerCase().includes(map.toLowerCase().trim()) &&
      item["mapper"].toLowerCase().includes(mapper.toLowerCase().trim()) &&
      (minPP ? item["pp"] >= minPP : item["pp"] >= 0) &&
      (maxPP ? item["pp"] <= maxPP : item["pp"] <= Number.MAX_VALUE) &&
      (minAcc ? item["acc"] >= minAcc / 100 : item["acc"] >= 0) &&
      (maxAcc ? item["acc"] <= maxAcc / 100 : item["acc"] <= 1) &&
      (minSR ? item["sr"] >= minSR : item["sr"] >= 0) &&
      (maxSR ? item["sr"] <= maxSR : item["sr"] <= Number.MAX_VALUE) &&
      (!mods || mods.length === 0 ||
        (mods.length === item["mods"].length &&
          mods.every((mod) => item["mods"].includes(mod))) ||
        (mods.length === 1 && mods[0] === "NM" && item["mods"] === "NM")) &&
      (!rank || item["rank"] === rank)
  );
}

/**
 * Sorts data by parameters given in payload object.
 * @param {*} data to be sorted.
 * @param {*} payload containing sorting parameter (sortingParam), boolean for sorting in reverse (reversed) and a search parameters object (search).
 * @returns sorted data.
 */
function sortData(data, payload) {
  const { sortingParam, isReverseSorted, search } = payload;

  if (!sortingParam) {
    return filterData(data, search);
  }

  // Sorted differently based on which parameter is being used
  return filterData(
    [...data].sort((first, second) => {
      if (isReverseSorted) {
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

export default function SortableTable({ rawScoresData, setStatChanges }) {

  // ============================================= DATA =============================================

  // Manipulates raw score data into a more convenient format
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
    };
  });

  // Score state
  const [sortedData, setSortedData] = useState(scoresData);

  // ============================================= FILTER BY SEARCH =============================================

  // Drawer open state
  const [isFilterOpened, { open, close }] = useDisclosure(false);

  // Search states
  const [mapSearch, setMapSearch] = useState("");
  const [mapperSearch, setMapperSearch] = useState("");
  const [minPPSearch, setMinPPSearch] = useState();
  const [maxPPSearch, setMaxPPSearch] = useState();
  const [minAccSearch, setMinAccSearch] = useState();
  const [maxAccSearch, setMaxAccSearch] = useState();
  const [minSRSearch, setMinSRSearch] = useState();
  const [maxSRSearch, setMaxSRSearch] = useState();
  const [modsSearch, setModsSearch] = useState();
  const [rankSearch, setRankSearch] = useState();

  const currentSearchParams = {
    map: mapSearch,
    mapper: mapperSearch,
    minPP: minPPSearch,
    maxPP: maxPPSearch,
    minAcc: minAccSearch,
    maxAcc: maxAccSearch,
    minSR: minSRSearch,
    maxSR: maxSRSearch,
    mods: modsSearch,
    rank: rankSearch,
  };

  const filterUpdateHandler = (filterParam, value) => {
    let search;

    switch (filterParam) {
      case "map":
        setMapSearch(value);
        search = { ...currentSearchParams, map: value };
        break;
      case "mapper":
        setMapperSearch(value);
        search = { ...currentSearchParams, mapper: value };
        break;
      case "minPP":
        setMinPPSearch(value);
        search = { ...currentSearchParams, minPP: value };
        break;
      case "maxPP":
        setMaxPPSearch(value);
        search = { ...currentSearchParams, maxPP: value };
        break;
      case "minAcc":
        setMinAccSearch(value);
        search = { ...currentSearchParams, minAcc: value };
        break;
      case "maxAcc":
        setMaxAccSearch(value);
        search = { ...currentSearchParams, maxAcc: value };
        break;
      case "minSR":
        setMinSRSearch(value);
        search = { ...currentSearchParams, minSR: value };
        break;
      case "maxSR":
        setMaxSRSearch(value);
        search = { ...currentSearchParams, maxSR: value };
        break;
      case "mods":
        setModsSearch(value);
        search = { ...currentSearchParams, mods: value };
        break;
      case "rank":
        setRankSearch(value);
        search = { ...currentSearchParams, rank: value };
        break;
    }

    setSortedData(
      sortData(scoresData, {
        sortingParam,
        isReverseSorted,
        search,
      })
    );
  };

  // Handler for updating map name search state
  const mapSearchChangeHandler = (event) => {
    const { value } = event.currentTarget;
    filterUpdateHandler("map", value);
  };

  // Handler for updating mapper name search state
  const mapperSearchChangeHandler = (event) => {
    const { value } = event.currentTarget;
    filterUpdateHandler("mapper", value);
  };

  // Handler for updating minimum pp search state
  const minPPSearchChangeHandler = (value) => {
    filterUpdateHandler("minPP", value);
  };

  // Handler for updating maximum pp search state
  const maxPPSearchChangeHandler = (value) => {
    filterUpdateHandler("maxPP", value);
  };

  // Handler for updating minimum accuracy search state
  const minAccSearchChangeHandler = (value) => {
    filterUpdateHandler("minAcc", value);
  };

  // Handler for updating maximum accuracy search state
  const maxAccSearchChangeHandler = (value) => {
    filterUpdateHandler("maxAcc", value);
  };

  // Handler for updating minimum accuracy search state
  const minSRSearchChangeHandler = (value) => {
    filterUpdateHandler("minSR", value);
  };

  // Handler for updating maximum accuracy search state
  const maxSRSearchChangeHandler = (value) => {
    filterUpdateHandler("maxSR", value);
  };

  // Handler for updating mods search state
  const modsSearchChangeHandler = (value) => {
    filterUpdateHandler("mods", value);
  };

  // Handler for updating rank search state
  const rankSearchChangeHandler = (value) => {
    filterUpdateHandler("rank", value);
  };

  // ============================================= SORTING =============================================

  // Sorting states
  const [sortingParam, setSortingParam] = useState("index");
  const [isReverseSorted, setIsReverseSorted] = useState(false);

  // Handler for changing sort parameter/reverse sort
  const sortChangeHandler = (field) => {
    if (field === sortingParam) {
      reverseSortHandler();
    } else {
      setIsReverseSorted(false);
      setSortingParam(field);
      setSortedData(
        sortData(scoresData, {
          sortingParam: field,
          isReverseSorted: false,
          search: {
            map: mapSearch,
            mapper: mapperSearch,
            minPP: minPPSearch,
            maxPP: maxPPSearch,
            minAcc: minAccSearch,
            maxAcc: maxAccSearch,
            minSR: minSRSearch,
            maxSR: maxSRSearch,
            mods: modsSearch,
            rank: rankSearch,
          },
        })
      );
    }
  };

  // Handler for reversing sort
  const reverseSortHandler = () => {
    setIsReverseSorted(!isReverseSorted);
    setSortedData(
      sortData(scoresData, {
        sortingParam,
        isReverseSorted: !isReverseSorted,
        search: {
          map: mapSearch,
          mapper: mapperSearch,
          minPP: minPPSearch,
          maxPP: maxPPSearch,
          minAcc: minAccSearch,
          maxAcc: maxAccSearch,
          minSR: minSRSearch,
          maxSR: maxSRSearch,
          mods: modsSearch,
          rank: rankSearch,
        },
      })
    );
  };

  // ============================================= SELECTION =============================================

  // Selection state
  const [selection, setSelection] = useState(
    new Array(sortedData.length).fill(false)
  );

  // Recalculate stats and update stat changes context every time selection array is changed
  useEffect(() => {
    setStatChanges(selection);
  }, [selection]);

  // Handler for updating selection state
  const rowSelectionToggleHandler = (selectedIndex) => {
    setSelection((currSelection) =>
      currSelection.map((curr, index) =>
        index === selectedIndex ? !curr : curr
      )
    );
  };

  // ============================================= ROW CONVERSION =============================================

  // Converts each score into a row element
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
      <td>
        <Checkbox
          checked={selection[row.index]}
          onChange={() => rowSelectionToggleHandler(row.index)}
          transitionDuration={0}
        />
      </td>
    </tr>
  ));

  // ============================================= OUTPUT =============================================

  return (
    <ScrollArea>
      <Flex
        direction={{ base: "row", sm: "column" }}
        gap={{ base: "sm", sm: "lg" }}
        justify={{ sm: "center" }}
      >
        <Flex
          direction={{ base: "row", sm: "column" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ sm: "center" }}
        >
          <Flex justify={{ sm: "center" }}>
            <Drawer
              opened={isFilterOpened}
              onClose={close}
              title="Filter"
              sx={{ fontFamily: "Segoe UI" }}
            >
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

              <MultiSelect
                clearable
                mb="md"
                w="20rem"
                placeholder="Mods"
                data={[
                  { value: "NM", label: "NM" },
                  { value: "EZ", label: "EZ" },
                  { value: "NF", label: "NF" },
                  { value: "HT", label: "HT" },
                  { value: "HR", label: "HR" },
                  { value: "SD", label: "SD" },
                  { value: "PF", label: "PF" },
                  { value: "DT", label: "DT" },
                  { value: "NC", label: "NC" },
                  { value: "HD", label: "HD" },
                  { value: "FL", label: "FL" },
                  { value: "SO", label: "SO" },
                ]}
                value={modsSearch}
                onChange={modsSearchChangeHandler}
              />

              <NumberInput
                placeholder="Minimum star rating"
                mb="md"
                w="20rem"
                value={minSRSearch}
                onChange={minSRSearchChangeHandler}
              />

              <NumberInput
                placeholder="Maximum star rating"
                mb="md"
                w="20rem"
                value={maxSRSearch}
                onChange={maxSRSearchChangeHandler}
              />

              <NumberInput
                placeholder="Minimum pp"
                mb="md"
                w="20rem"
                value={minPPSearch}
                onChange={minPPSearchChangeHandler}
              />

              <NumberInput
                placeholder="Maximum pp"
                mb="md"
                w="20rem"
                value={maxPPSearch}
                onChange={maxPPSearchChangeHandler}
              />

              <NumberInput
                placeholder="Minimum accuracy"
                mb="md"
                w="20rem"
                value={minAccSearch}
                onChange={minAccSearchChangeHandler}
              />

              <NumberInput
                placeholder="Maximum accuracy"
                mb="md"
                w="20rem"
                value={maxAccSearch}
                onChange={maxAccSearchChangeHandler}
              />

              <Select
                clearable
                placeholder="Rank"
                mb="md"
                w="20rem"
                data={[
                  { value: "SS", label: "SS" },
                  { value: "S", label: "S" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "C", label: "C" },
                  { value: "D", label: "D" },
                ]}
                value={rankSearch}
                onChange={rankSearchChangeHandler}
              />
            </Drawer>

            <Button
              variant="outline"
              onClick={open}
              leftIcon={<IconFilter size={20} />}
            >
              Filter
            </Button>
          </Flex>

          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={{ base: "sm", sm: "lg" }}
            justify={{ sm: "center" }}
            align="center"
          >
            <IconArrowsSort />
            <Select
              data={[
                { value: "index", label: "Index" },
                { value: "map", label: "Map" },
                { value: "mapper", label: "Mapper" },
                { value: "mods", label: "Mods" },
                { value: "sr", label: "Star Rating" },
                { value: "pp", label: "Performance Points (pp)" },
                { value: "acc", label: "Accuracy" },
                { value: "rank", label: "Rank" },
              ]}
              onChange={sortChangeHandler}
              value={sortingParam}
            />

            <Button color="grape" onClick={reverseSortHandler}>
              {isReverseSorted ? <IconSortAscending /> : <IconSortDescending />}
            </Button>
          </Flex>
        </Flex>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ sm: "center" }}
          align="center"
        >
          <Title order={3}>{sortedData.length} score(s) found!</Title>
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
      </Flex>
    </ScrollArea>
  );
}

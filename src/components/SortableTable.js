import { useEffect, useState } from "react";
import {
  TextInput,
  Flex,
  Select,
  Button,
  Title,
  NumberInput,
  Drawer,
  MultiSelect,
  ScrollArea,
  Image,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import Score from "./Score";
import { calculateDate } from "@/lib/calculators/DateCalculator";
import {
  mods_mania,
  mods_standard,
  mods_taiko_fruits,
} from "@/lib/ModsByGamemode";

const modSortMultipliers = {
  HT: 0.3,
  NF: 0.5,
  EZ: 0.5 + 0.01,
  SO: 0.9,
  TD: 1.0,
  NM: 1.0 + 0.01,
  SD: 1.0 + 0.02,
  PF: 1.0 + 0.03,
  HD: 1.06,
  HR: 1.06 + 0.01,
  FL: 1.12,
  NC: 1.12 + 0.01,
  DT: 1.12 + 0.02,
};

const ranks = ["SS", "S", "A", "B", "C", "D"];

/**
 * Filters data by given search parameters object.
 * @param {*} data to be filtered.
 * @param {*} search object containing parameters (map name, mapper name etc) to filter by.
 * @returns filtered data.
 */
function filterData(data, search) {
  const {
    artist,
    title,
    difficulty,
    mapper,
    mods,
    minSR,
    maxSR,
    minDate,
    maxDate,
    rank,
    minAcc,
    maxAcc,
    minPP,
    maxPP,
  } = search;

  return data.filter(
    (item) =>
      item["artist"].toLowerCase().includes(artist.toLowerCase().trim()) &&
      item["title"].toLowerCase().includes(title.toLowerCase().trim()) &&
      item["difficulty"]
        .toLowerCase()
        .includes(difficulty.toLowerCase().trim()) &&
      item["mapper"].toLowerCase().includes(mapper.toLowerCase().trim()) &&
      (!mods ||
        mods.length === 0 ||
        (mods.length === item["mods"].length &&
          mods.every((mod) => item["mods"].includes(mod))) ||
        (mods.length === 1 && mods[0] === "NM" && item["mods"] === "NM")) &&
      (minSR ? item["sr"] >= minSR : item["sr"] >= 0) &&
      (maxSR ? item["sr"] <= maxSR : item["sr"] <= Number.MAX_VALUE) &&
      (!minDate || minDate <= item["date"]) &&
      (!maxDate || item["date"] <= calculateDate(maxDate, 1)) &&
      (!rank || item["rank"] === rank) &&
      (minAcc ? item["acc"] >= minAcc / 100 : item["acc"] >= 0) &&
      (maxAcc ? item["acc"] <= maxAcc / 100 : item["acc"] <= 1) &&
      (minPP ? item["pp"] >= minPP : item["pp"] >= 0) &&
      (maxPP ? item["pp"] <= maxPP : item["pp"] <= Number.MAX_VALUE)
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

  // Sorted differently based on which parameter is being used
  return filterData(
    [...data].sort((first, second) => {
      if (isReverseSorted) {
        [first, second] = [second, first];
      }

      let compValue = 0;
      switch (sortingParam) {
        case "mods":
          const firstMultiplier = Array.isArray(first[sortingParam])
            ? first[sortingParam].reduce(
                (acc, curr) => acc * modSortMultipliers[curr],
                1.0
              )
            : modSortMultipliers[first[sortingParam]];
          const secondMultiplier = Array.isArray(second[sortingParam])
            ? second[sortingParam].reduce(
                (accum, curr) => accum * modSortMultipliers[curr],
                1.0
              )
            : modSortMultipliers[second[sortingParam]];
          compValue = secondMultiplier - firstMultiplier;
          break;

        case "sr":
        case "pp":
        case "acc":
        case "date":
          compValue = second[sortingParam] - first[sortingParam];
          break;

        case "rank":
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

export default function SortableTable({
  rawScoresData,
  playmode,
  setStatChanges,
  toggleStatChanges,
  isStatChangeReady,
}) {
  // ============================================= DATA =============================================

  // Manipulates raw score data into a more convenient format
  const scoresData = rawScoresData.map((score, index) => ({
    key: index,
    index,
    beatmap_id: score.beatmap.id,
    user_id: score.user_id,
    artist: score.beatmapset.artist,
    title: score.beatmapset.title,
    difficulty: score.beatmap.version,
    mapper: score.beatmapset.creator,
    sr: score.beatmap.difficulty_rating,
    sr_multiplier:
      score.mods.includes("DT") ||
      score.mods.includes("NC") ||
      score.mods.includes("FL") ||
      score.mods.includes("HR") ||
      score.mods.includes("EZ") ||
      score.mods.includes("HT"),
    mods: score.mods.length >= 1 ? score.mods : ["NM"],
    pp: score.pp,
    acc: score.accuracy,
    rank:
      score.rank === "X" || score.rank === "XH"
        ? "SS"
        : score.rank === "SH"
        ? "S"
        : score.rank,
    background: score.beatmapset.covers["cover@2x"],
    date: new Date(score.created_at),
    max_combo: score.max_combo,
    hit_counts: {
      count_300: score.statistics.count_300,
      count_100: score.statistics.count_100,
      count_50: score.statistics.count_50,
      count_miss: score.statistics.count_miss,
    },
    score: score.score,
  }));

  // Score state
  const [sortedData, setSortedData] = useState(scoresData);

  // Mods
  const currentGamemodeMods =
    playmode === "osu"
      ? mods_standard
      : playmode === "mania"
      ? mods_mania
      : mods_taiko_fruits;

  // ============================================= FILTER BY SEARCH =============================================

  // Drawer open state
  const [isFilterOpened, { open, close }] = useDisclosure(false);

  // Search states
  const [artistSearch, setArtistSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [difficultySearch, setDifficultySearch] = useState("");
  const [mapperSearch, setMapperSearch] = useState("");
  const [modsSearch, setModsSearch] = useState([]);
  const [minSRSearch, setMinSRSearch] = useState("");
  const [maxSRSearch, setMaxSRSearch] = useState("");
  const [minDateSearch, setMinDateSearch] = useState(null);
  const [maxDateSearch, setMaxDateSearch] = useState(null);
  const [rankSearch, setRankSearch] = useState(null);
  const [minAccSearch, setMinAccSearch] = useState("");
  const [maxAccSearch, setMaxAccSearch] = useState("");
  const [minPPSearch, setMinPPSearch] = useState("");
  const [maxPPSearch, setMaxPPSearch] = useState("");

  const defaultSearchParams = {
    artist: "",
    title: "",
    difficulty: "",
    mapper: "",
    mods: [],
    minSR: "",
    maxSR: "",
    minDate: null,
    maxDate: null,
    rank: null,
    minAcc: "",
    maxAcc: "",
    minPP: "",
    maxPP: "",
  };

  const currentSearchParams = {
    artist: artistSearch,
    title: titleSearch,
    difficulty: difficultySearch,
    mapper: mapperSearch,
    mods: modsSearch,
    minSR: minSRSearch,
    maxSR: maxSRSearch,
    minDate: minDateSearch,
    maxDate: maxDateSearch,
    rank: rankSearch,
    minAcc: minAccSearch,
    maxAcc: maxAccSearch,
    minPP: minPPSearch,
    maxPP: maxPPSearch,
  };

  // Handler for updating the filter
  const filterUpdateHandler = (filterParam, value) => {
    switch (filterParam) {
      case "artist":
        setArtistSearch(value);
        break;
      case "title":
        setTitleSearch(value);
        break;
      case "difficulty":
        setDifficultySearch(value);
        break;
      case "mapper":
        setMapperSearch(value);
        break;
      case "mods":
        setModsSearch(value);
        break;
      case "minSR":
        setMinSRSearch(value);
        break;
      case "maxSR":
        setMaxSRSearch(value);
        break;
      case "minDate":
        setMinDateSearch(value);
        break;
      case "maxDate":
        setMaxDateSearch(value);
        break;
      case "rank":
        setRankSearch(value);
        break;
      case "minAcc":
        setMinAccSearch(value);
        break;
      case "maxAcc":
        setMaxAccSearch(value);
        break;
      case "minPP":
        setMinPPSearch(value);
        break;
      case "maxPP":
        setMaxPPSearch(value);
        break;
    }

    const search = { ...currentSearchParams, [filterParam]: value };

    setSortedData(
      sortData(scoresData, {
        sortingParam,
        isReverseSorted,
        search,
      })
    );
  };

  const clearAllFiltersHandler = () => {
    setArtistSearch("");
    setTitleSearch("");
    setDifficultySearch("");
    setMapperSearch("");
    setModsSearch([]);
    setMinSRSearch("");
    setMaxSRSearch("");
    setMinDateSearch(null);
    setMaxDateSearch(null);
    setRankSearch(null);
    setMinAccSearch("");
    setMaxAccSearch("");
    setMinPPSearch("");
    setMaxPPSearch("");
    setSortedData(
      sortData(scoresData, {
        sortingParam,
        isReverseSorted,
        search: defaultSearchParams,
      })
    );
  };

  // ============================================= SORTING =============================================

  // Sorting states
  const [sortingParam, setSortingParam] = useState("pp");
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
          search: currentSearchParams,
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
        search: currentSearchParams,
      })
    );
  };

  // ============================================= SELECTION =============================================

  // Selection state
  const [selection, setSelection] = useState(
    new Array(sortedData.length).fill(false)
  );

  const [showSelection, setShowSelection] = useState(false);

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

  const showSelectionHandler = () => {
    toggleStatChanges();
    setShowSelection((isShowing) => !isShowing);
  };

  // ============================================= ROW CONVERSION =============================================

  // Converts each score into a Score object
  const scores = sortedData.map((scoreData, index) => (
    <Score key={index} scoreData={scoreData} />
  ));

  // ============================================= OUTPUT =============================================

  return (
    <Flex direction="column" gap="md">
      <Flex direction="row" gap="lg" justify="center">
        <Drawer
          opened={isFilterOpened}
          onClose={close}
          size={420}
          withCloseButton={false}
        >
          <Flex direction="column" gap="xs">
            <Title>Filters</Title>
            <Button onClick={clearAllFiltersHandler} w="25%">
              Clear All
            </Button>

            <Flex direction="column">
              <Title order={5}>Artist</Title>
              <TextInput
                placeholder="Find artist name"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                value={artistSearch}
                onChange={(event) =>
                  filterUpdateHandler("artist", event.currentTarget.value)
                }
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>Title</Title>
              <TextInput
                placeholder="Find map title"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                value={titleSearch}
                onChange={(event) =>
                  filterUpdateHandler("title", event.currentTarget.value)
                }
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>Difficulty</Title>
              <TextInput
                placeholder="Find difficulty title"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                value={difficultySearch}
                onChange={(event) =>
                  filterUpdateHandler("difficulty", event.currentTarget.value)
                }
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>Mapper</Title>
              <TextInput
                placeholder="Find mapper name"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                value={mapperSearch}
                onChange={(event) =>
                  filterUpdateHandler("mapper", event.currentTarget.value)
                }
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>Mods</Title>
              <MultiSelect
                clearable
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                placeholder="Select mods"
                data={currentGamemodeMods.map((mod) => ({
                  value: mod,
                  label: (
                    <Flex direction="row" gap="xs" align="center">
                      <Image
                        src={`/mods/${mod}.png`}
                        width={22}
                        height={15.5}
                      />
                      <Title order={5}>{mod}</Title>
                    </Flex>
                  ),
                }))}
                value={modsSearch}
                onChange={(value) => filterUpdateHandler("mods", value)}
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>Star rating</Title>
              <Flex gap="sm">
                <NumberInput
                  hideControls
                  placeholder="Min. star rating"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={minSRSearch}
                  onChange={(value) => filterUpdateHandler("minSR", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. star rating"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={maxSRSearch}
                  onChange={(value) => filterUpdateHandler("maxSR", value)}
                />
              </Flex>
            </Flex>

            <Flex direction="column">
              <Title order={5}>Date</Title>
              <Flex gap="sm">
                <DateInput
                  clearable
                  placeholder="Start date"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  value={minDateSearch}
                  onChange={(value) => filterUpdateHandler("minDate", value)}
                />

                <Title order={3}> - </Title>

                <DateInput
                  clearable
                  placeholder="End date"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  value={maxDateSearch}
                  onChange={(value) => filterUpdateHandler("maxDate", value)}
                />
              </Flex>
            </Flex>

            <Flex direction="column">
              <Title order={5}>Rank</Title>
              <Select
                clearable
                placeholder="Select rank"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" />}
                data={[
                  { value: "SS", label: "SS" },
                  { value: "S", label: "S" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "C", label: "C" },
                  { value: "D", label: "D" },
                ]}
                value={rankSearch}
                onChange={(value) => filterUpdateHandler("rank", value)}
              />
            </Flex>

            <Flex direction="column">
              <Title order={5}>pp</Title>
              <Flex gap="sm">
                <NumberInput
                  hideControls
                  placeholder="Min. pp"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={minPPSearch}
                  onChange={(value) => filterUpdateHandler("minPP", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. pp"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={maxPPSearch}
                  onChange={(value) => filterUpdateHandler("maxPP", value)}
                />
              </Flex>
            </Flex>

            <Flex direction="column">
              <Title order={5}>Accuracy</Title>
              <Flex gap="sm">
                <NumberInput
                  hideControls
                  placeholder="Min. accuracy"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={minAccSearch}
                  onChange={(value) => filterUpdateHandler("minAcc", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. accuracy"
                  w="11rem"
                  icon={<IconSearch size="0.9rem" />}
                  step={0.01}
                  precision={2}
                  value={maxAccSearch}
                  onChange={(value) => filterUpdateHandler("maxAcc", value)}
                />
              </Flex>
            </Flex>
          </Flex>
        </Drawer>

        <Button
          variant={isFilterOpened ? "outline" : "filled"}
          onClick={open}
          leftIcon={<IconFilter size={20} />}
        >
          Filter
        </Button>

        <Title order={3}>||</Title>

        <Flex direction="row" gap="lg">
          <Select
            data={[
              { value: "pp", label: "Performance Points (pp)" },
              { value: "artist", label: "Artist" },
              { value: "title", label: "Title" },
              { value: "difficulty", label: "Difficulty" },
              { value: "mapper", label: "Mapper" },
              { value: "mods", label: "Mods" },
              { value: "sr", label: "Star Rating" },
              { value: "date", label: "Date" },
              { value: "rank", label: "Rank" },
              { value: "acc", label: "Accuracy" },
            ]}
            onChange={sortChangeHandler}
            value={sortingParam}
          />

          <Button color="grape" onClick={reverseSortHandler}>
            {isReverseSorted ? <IconSortAscending /> : <IconSortDescending />}
          </Button>
        </Flex>
      </Flex>

      <Flex justify="center">
        <Title order={3}>{sortedData.length} score(s) found!</Title>
      </Flex>

      <ScrollArea h="70vh" type="auto">
        {scores}
      </ScrollArea>
    </Flex>
  );
}

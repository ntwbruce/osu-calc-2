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
        case "mods":
          const multipliers = {
            HT: 0.3,
            NF: 0.5,
            EZ: 0.5 + 0.01,
            SO: 0.9,
            NM: 1.0,
            SD: 1.0 + 0.01,
            PF: 1.0 + 0.02,
            HD: 1.06,
            HR: 1.06 + 0.01,
            FL: 1.12,
            NC: 1.12 + 0.01,
            DT: 1.12 + 0.02,
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
        case "date":
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

export default function SortableTable({
  rawScoresData,
  setStatChanges,
  toggleStatChanges,
  isStatChangeReady,
}) {
  // ============================================= DATA =============================================

  // Manipulates raw score data into a more convenient format
  const scoresData = rawScoresData.map((score, index) => {
    return {
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
      background: score.beatmapset.covers.cover,
      date: new Date(score.created_at),
    };
  });

  // Score state
  const [sortedData, setSortedData] = useState(scoresData);

  // ============================================= FILTER BY SEARCH =============================================

  // Drawer open state
  const [isFilterOpened, { open, close }] = useDisclosure(false);

  // Search states
  const [artistSearch, setArtistSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [mapperSearch, setMapperSearch] = useState("");
  const [modsSearch, setModsSearch] = useState();
  const [minSRSearch, setMinSRSearch] = useState();
  const [maxSRSearch, setMaxSRSearch] = useState();
  const [minDateSearch, setMinDateSearch] = useState();
  const [maxDateSearch, setMaxDateSearch] = useState();
  const [rankSearch, setRankSearch] = useState();
  const [minAccSearch, setMinAccSearch] = useState();
  const [maxAccSearch, setMaxAccSearch] = useState();
  const [minPPSearch, setMinPPSearch] = useState();
  const [maxPPSearch, setMaxPPSearch] = useState();

  const currentSearchParams = {
    artist: artistSearch,
    title: titleSearch,
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
    <Flex
      direction={{ base: "row", sm: "column" }}
      gap={{ base: "sm", sm: "lg" }}
      justify={{ sm: "center" }}
    >
      <Flex
        direction="row"
        gap={{ base: "sm", sm: "lg" }}
        justify={{ sm: "center" }}
      >
        <Flex justify={{ sm: "center" }}>
          <Drawer
            opened={isFilterOpened}
            onClose={close}
            title="Filter"
            sx={{ fontFamily: "Segoe UI" }}
            size={420}
          >
            <Flex
              direction={{ base: "row", sm: "column" }}
              justify={{ sm: "center" }}
            >
              <Title order={5}>Artist</Title>
              <TextInput
                placeholder="Find artist name"
                mb="md"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" stroke={1.5} />}
                value={artistSearch}
                onChange={(event) =>
                  filterUpdateHandler("artist", event.currentTarget.value)
                }
              />

              <Title order={5}>Title</Title>
              <TextInput
                placeholder="Find map title"
                mb="md"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" stroke={1.5} />}
                value={titleSearch}
                onChange={(event) =>
                  filterUpdateHandler("title", event.currentTarget.value)
                }
              />

              <Title order={5}>Mapper</Title>
              <TextInput
                placeholder="Find mapper name"
                mb="md"
                w="23.92rem"
                icon={<IconSearch size="0.9rem" stroke={1.5} />}
                value={mapperSearch}
                onChange={(event) =>
                  filterUpdateHandler("mapper", event.currentTarget.value)
                }
              />

              <Title order={5}>Mods</Title>
              <MultiSelect
                clearable
                mb="md"
                w="23.92rem"
                placeholder="Select mods"
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
                onChange={(value) => filterUpdateHandler("mods", value)}
              />

              <Title order={5}>Star rating</Title>
              <Flex gap={{ base: "sm" }}>
                <NumberInput
                  hideControls
                  placeholder="Min. star rating"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={minSRSearch}
                  onChange={(value) => filterUpdateHandler("minSR", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. star rating"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={maxSRSearch}
                  onChange={(value) => filterUpdateHandler("maxSR", value)}
                />
              </Flex>

              <Title order={5}>Date</Title>
              <Flex gap={{ base: "sm" }}>
                <DateInput
                  clearable
                  placeholder="Start date"
                  mb="md"
                  w="11rem"
                  value={minDateSearch}
                  onChange={(value) => filterUpdateHandler("minDate", value)}
                />

                <Title order={3}> - </Title>

                <DateInput
                  clearable
                  placeholder="End date"
                  mb="md"
                  w="11rem"
                  value={maxDateSearch}
                  onChange={(value) => filterUpdateHandler("maxDate", value)}
                />
              </Flex>

              <Title order={5}>Rank</Title>
              <Select
                clearable
                placeholder="Select rank"
                mb="md"
                w="23.92rem"
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

              <Title order={5}>pp</Title>
              <Flex gap={{ base: "sm" }}>
                <NumberInput
                  hideControls
                  placeholder="Min. pp"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={minPPSearch}
                  onChange={(value) => filterUpdateHandler("minPP", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. pp"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={maxPPSearch}
                  onChange={(value) => filterUpdateHandler("maxPP", value)}
                />
              </Flex>

              <Title order={5}>Accuracy</Title>
              <Flex gap={{ base: "sm" }}>
                <NumberInput
                  hideControls
                  placeholder="Min. accuracy"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={minAccSearch}
                  onChange={(value) => filterUpdateHandler("minAcc", value)}
                />

                <Title order={3}> - </Title>

                <NumberInput
                  hideControls
                  placeholder="Max. accuracy"
                  mb="md"
                  w="11rem"
                  step={0.01}
                  precision={2}
                  value={maxAccSearch}
                  onChange={(value) => filterUpdateHandler("maxAcc", value)}
                />
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
        </Flex>

        <Title order={3}>||</Title>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ sm: "center" }}
          align="center"
        >
          <Select
            data={[
              { value: "pp", label: "Performance Points (pp)" },
              { value: "artist", label: "Artist" },
              { value: "title", label: "Title" },
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

        <Title order={3}>||</Title>

        <Flex
          direction={{ base: "column", sm: "row" }}
          gap={{ base: "sm", sm: "lg" }}
          justify={{ sm: "center" }}
          align="center"
        >
          {/* {isStatChangeReady ? (
            <Button
              data-disabled
              variant={showSelection ? "outline" : "filled"}
              onClick={showSelectionHandler}
            >
              Delete Scores (WIP)
            </Button>
          ) : (
            <Button
              data-disabled
              variant="outline"
              onClick={showSelectionHandler}
              rightIcon={<Loader size="sm" color="dark" />}
            >
              Delete Scores (WIP)
            </Button>
          )} */}
          <Button
            data-disabled
            variant={showSelection ? "outline" : "filled"}
            onClick={showSelectionHandler}
          >
            Delete Scores (WIP)
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

      <ScrollArea h="70vh" type="auto">
        {scores}
      </ScrollArea>
    </Flex>
  );
}

import { useState } from "react";
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
} from "@mantine/core";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";

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

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => item["map"].toLowerCase().includes(query));
}

function sortData(data, payload) {
  const { sortingParam, reversed, search } = payload;

  if (!sortingParam) {
    return filterData(data, search);
  }

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
            FL: 1.10,
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

export default function SortableTable({ data }) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortingParam, setSortingParam] = useState(null);
  const [isReverseSorted, setIsReverseSorted] = useState(false);

  const changeSort = (field) => {
    const toReverse = field === sortingParam ? !isReverseSorted : false;
    setIsReverseSorted(toReverse);
    setSortingParam(field);
    setSortedData(
      sortData(data, { sortingParam: field, reversed: toReverse, search })
    );
  };

  const searchChangeHandler = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortingParam, reversed: isReverseSorted, search: value })
    );
  };

  const rows = sortedData.map((row) => (
    <tr key={row.index}>
      <td>{row.index}</td>
      <td>{row.map}</td>
      <td>{row.mapper}</td>
      <td>{row.mods}</td>
      <td>
        {(Math.round(row.sr * 100) / 100).toFixed(2)}
        {row.sr_multiplier}
      </td>
      <td>{(Math.round(row.pp * 100) / 100).toFixed(2)}</td>
      <td>{(row.acc * 100).toFixed(2)}</td>
      <td>{row.rank}</td>
    </tr>
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by map name"
        mb="md"
        icon={<IconSearch size="0.9rem" stroke={1.5} />}
        value={search}
        onChange={searchChangeHandler}
      />
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
              onSort={() => changeSort("index")}
            >
              Index
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "map"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("map")}
            >
              Map
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "mapper"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("mapper")}
            >
              Mapper
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "mods"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("mods")}
            >
              Mods
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "sr"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("sr")}
            >
              Star Rating
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "pp"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("pp")}
            >
              Peformance (pp)
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "acc"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("acc")}
            >
              Accuracy (%)
            </Th>
            <Th
              isActiveSortingParam={sortingParam === "rank"}
              isReverseSorted={isReverseSorted}
              onSort={() => changeSort("rank")}
            >
              Rank
            </Th>
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

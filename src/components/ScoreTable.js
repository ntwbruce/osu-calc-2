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

function Th({ children, reversed, sorted, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
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
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return typeof b[sortBy] === "string"
          ? b[sortBy].localeCompare(a[sortBy])
          : a[sortBy] - b[sortBy];
      }
      return typeof a[sortBy] === "string"
        ? a[sortBy].localeCompare(b[sortBy])
        : b[sortBy] - a[sortBy];
    }),
    payload.search
  );
}

export default function TableSort({ data }) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const rows = sortedData.map((row) => (
    <tr key={row.index}>
      <td>{row.map}</td>
      <td>{row.mapper}</td>
      <td>{row.mods}</td>
      <td>{(Math.round(row.sr * 100) / 100).toFixed(2)}{row.sr_multiplier}</td>
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
        onChange={handleSearchChange}
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
              sorted={sortBy === "map"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("map")}
            >
              Map
            </Th>
            <Th
              sorted={sortBy === "mapper"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("mapper")}
            >
              Mapper
            </Th>
            <Th
              sorted={sortBy === "mods"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("mods")}
            >
              Mods
            </Th>
            <Th
              sorted={sortBy === "sr"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("sr")}
            >
              Star Rating
            </Th>
            <Th
              sorted={sortBy === "pp"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("pp")}
            >
              Peformance (pp)
            </Th>
            <Th
              sorted={sortBy === "acc"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("acc")}
            >
              Accuracy (%)
            </Th>
            <Th
              sorted={sortBy === "rank"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("rank")}
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
              <td colSpan={Object.keys(data[0]).length}>
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

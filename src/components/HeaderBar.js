import {
  createStyles,
  Header,
  Group,
  Container,
  Burger,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MantineLogo } from "@mantine/ds";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: rem(56),

    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  links: {},

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.lg,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

export function HeaderBar({ pages, home, currPage }) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes, cx } = useStyles();

  const pageButtons = pages.map((link) => (
    <Link
      component="a"
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: currPage === link.label,
      })}
    >
      {link.label}
    </Link>
  ));

  const homeButton = (
    <Link
      component="a"
      key={home.label}
      href={home.link}
      className={classes.link}
    >
      {home.label}
    </Link>
  );

  return (
    <Header mb={15}>
      <Container className={classes.inner}>
        <Burger
          opened={opened}
          onClick={toggle}
          size="sm"
          className={classes.burger}
        />
        <Group className={classes.links} spacing={5}>
          {pageButtons}
        </Group>
        <Group className={classes.links} position="right">
          {homeButton}
        </Group>
      </Container>
    </Header>
  );
}

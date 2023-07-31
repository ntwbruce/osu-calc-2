import { Image, Popover, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function ImageWithPopover({
  imageSrc,
  popoverText,
  width,
  height,
  margin,
}) {
  const [opened, { close, open }] = useDisclosure(false);
  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
    >
      <Popover.Target>
        <Image
          src={imageSrc}
          onMouseEnter={open}
          onMouseLeave={close}
          width={width}
          height={height}
          m={margin}
        />
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: "none" }}>
        <Text size="sm">{popoverText}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}

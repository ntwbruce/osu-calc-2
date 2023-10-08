import { TextInput, Button, Box, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRef } from "react";

export default function UsernameForm(props) {
  const usernameInputRef = useRef();

  const form = useForm({
    initialValues: {
      username: "",
    },
  });

  function submitHandler(event) {
    event.preventDefault();
    props.onSubmit(usernameInputRef.current.value + "/best");
  }

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={submitHandler}>
        <Flex direction="column" gap={20}>
          <TextInput
            placeholder="Username"
            {...form.getInputProps("username")}
            ref={usernameInputRef}
            w="40rem"
            size="xl"
          />

          <Button type="submit" size="xl" w="40rem">
            Go!!!
          </Button>
        </Flex>
      </form>
    </Box>
  );
}

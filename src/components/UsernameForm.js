import { TextInput, Checkbox, Button, Group, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { useRef } from "react";

export default function UsernameForm(props) {
  const usernameInputRef = useRef();

  const form = useForm({
    initialValues: {
      username: "",
      termsOfService: false,
    },
  });

  function submitHandler(event) {
    event.preventDefault();
    props.onSubmit(usernameInputRef.current.value);
  }

  return (
    <Box maw={600} mx="auto">
      <form onSubmit={submitHandler}>
        <TextInput
          label="Username"
          placeholder="Username"
          {...form.getInputProps("username")}
          ref={usernameInputRef}
          w="24rem"
        />

        <Checkbox
          mt="md"
          label="I agree to sell my privacy."
          {...form.getInputProps("termsOfService", { type: "checkbox" })}
        />

        <Group position="right" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}

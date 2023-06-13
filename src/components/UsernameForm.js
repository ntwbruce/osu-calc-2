import { useRef } from "react";
import styles from "./UsernameForm.module.css";
import { Button } from "@mantine/core";

export default function UsernameForm(props) {
  const usernameInputRef = useRef();

  function submitHandler(event) {
    event.preventDefault();
    props.onSubmit(usernameInputRef.current.value);
  }

  return (
    <form onSubmit={submitHandler}>
      <label htmlFor="username">Username</label>
      <input type="text" required id="username" ref={usernameInputRef} />
      <Button type="submit">submit</Button>
    </form>
  );
}

import { createContext, useState } from "react";

// ? Storing oauth token in a context for now then wrap the whole app in the provider below, there probably exist better ways to do this lmk
const AuthTokenContext = createContext({});
export default AuthTokenContext;

export function AuthTokenProvider(props) {
  const [authToken, setAuthToken] = useState({});
  return (
    <AuthTokenContext.Provider value={{ authToken, setAuthToken }}>
      {props.children}
    </AuthTokenContext.Provider>
  );
}

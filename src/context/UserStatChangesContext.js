import { createContext, useState } from "react";

const UserStatChangesContext = createContext({});
export default UserStatChangesContext;

export function UserStatChangesProvider({ children }) {
  const [userStatChanges, setUserStatChanges] = useState({ppChange: 0, accChange: 0});
  return (
    <UserStatChangesContext.Provider value={{ userStatChanges, setUserStatChanges }}>
      {children}
    </UserStatChangesContext.Provider>
  );
}

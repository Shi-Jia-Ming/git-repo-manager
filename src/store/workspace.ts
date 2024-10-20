import { createContext } from "react";

export const WorkDirectoryContext = createContext({
    workspace: '',
    workPath: '',
    setWorkspace: (_: string) => {},
    setWorkPath: (_: string) => {}
});
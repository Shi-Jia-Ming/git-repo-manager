import { createContext } from "react";
import { RepoInfo } from "../types/repo.type";

export const RepoContext = createContext({
    activeRepo: new RepoInfo(),
    setActiveRepo: (_: RepoInfo) => {},
})
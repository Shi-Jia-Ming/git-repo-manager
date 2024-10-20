import { useContext, useEffect, useRef, useState } from "react";
import { WorkDirectoryContext } from "../store/repository";
import { invoke } from "@tauri-apps/api";
import { RepoInfo } from "../types/repo.type";
import "mac-scrollbar/dist/mac-scrollbar.css";
import { MacScrollbar } from "mac-scrollbar";

export default function FileList() {

  const { workPath } = useContext(WorkDirectoryContext);

  const [repoList, setRepoList] = useState<RepoInfo[]>([]);

  useEffect(() => {
    invoke<RepoInfo[]>("load_repo_list", { path: workPath }).then((repos: RepoInfo[]) => {
      setRepoList(repos);
    });
  }, [workPath]);

  return (
    <div className={"size-full flex justify-start items-start flex-col"}>
      <MacScrollbar className={"size-full"}>
        {repoList.map((repo) => (
          <div
            key={repo.id}
            className={"border-b w-full h-[60px] overflow-hidden text-ellipsis whitespace-nowrap p-1.5 cannot-select hover:bg-gray-200 active:bg-gray-300 font-mono"}
          >{repo.name}</div>
        ))}
      </MacScrollbar>
    </div>
  )
}
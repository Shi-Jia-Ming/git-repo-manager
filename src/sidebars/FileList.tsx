import { useContext, useEffect, useRef, useState } from "react";
import { WorkDirectoryContext } from "../store/repository";
import { invoke } from "@tauri-apps/api";
import { RepoInfo } from "../types/repo.type";

export default function FileList() {

  const { workPath } = useContext(WorkDirectoryContext);

  const [repoList, setRepoList] = useState<RepoInfo[]>([]);
  const repoListScroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    invoke<RepoInfo[]>("scan_repo", { path: workPath }).then((repos: RepoInfo[]) => {
      setRepoList(repos);
    });
  }, [workPath]);

  return (
    <div className={"size-full flex justify-start items-start flex-col"}>
      <div ref={repoListScroller} className={"scroll-smooth size-full overflow-y-auto"}>
        {repoList.map((repo, index) => (
          <div
            key={index}
            className={"border-b w-full h-[60px] overflow-hidden text-ellipsis whitespace-nowrap p-1.5 cannot-select hover:bg-gray-200 active:bg-gray-300 font-mono"}
          >{repo.name}</div>
        ))}
      </div>
    </div>
  )
}
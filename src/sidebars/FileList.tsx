import { useContext, useEffect, useState } from "react";
import { WorkDirectoryContext } from "../store/repository";
import { invoke } from "@tauri-apps/api";
import { RepoInfo } from "../types/repo.type";
import "mac-scrollbar/dist/mac-scrollbar.css";
import { MacScrollbar } from "mac-scrollbar";

export default function FileList() {

  const { workPath } = useContext(WorkDirectoryContext);

  const [repoList, setRepoList] = useState<RepoInfo[]>([]);

  async function scanRepo() {
    const repos = await invoke<RepoInfo[]>("scan_repo", { path: workPath });
    setRepoList(repos);
  }

  useEffect(() => {
    invoke<RepoInfo[]>("load_repo_list", { path: workPath }).then((repos: RepoInfo[]) => {
      setRepoList(repos);
    });
  }, [workPath]);

  return (
    <div className={"size-full flex justify-start items-start flex-col"}>
      <div className={"h-12 w-full p-2 flex justify-between items-center pl-2 pr-4"}>
        <div id={"title"} className={"text-sm cannot-select overflow-hidden text-ellipsis whitespace-nowrap"}>仓库列表</div>
        <div id={"toolbar"} className={"tooltip tooltip-left size-5"} data-tip="重新扫描工作区">
          <button className={"size-4"} onClick={scanRepo}>
            <img alt={""} src={"/icons/arrow-counterclockwise.svg"} className={"size-4"}/>
          </button>
        </div>
      </div>
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
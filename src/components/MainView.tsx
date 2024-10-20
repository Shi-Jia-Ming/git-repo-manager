import { useContext, useEffect, useState } from "react";
import { RepoContext } from "../store/repository";
import Markdown from "react-markdown";
import { invoke } from "@tauri-apps/api";
import { MacScrollbar } from "mac-scrollbar";

export default function MainView() {

  const { activeRepo } = useContext(RepoContext);

  const [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    invoke<string>("get_readme", {repoPath: activeRepo.path}).then((res) => {
      setMarkdown(res);
    });
  }, [activeRepo])

  return (
    <div id={"repo-main-view"} className={"p-4 pt-6 size-full"}>
      <div id={"repo-title"} className={"w-full h-10"}>
        <div className={"text-3xl"}>{activeRepo.name}</div>
      </div>
      <div className={"divider"}/>
      <div id={"repo-description"} className={"w-full readme-board"}>
        <div id={"readme"} className={"border border-black h-full w-[80%] p-4 pr-0 rounded-lg"}>
          <MacScrollbar className={"size-full"}>
            <Markdown>{ markdown }</Markdown>
          </MacScrollbar>
        </div>
      </div>
    </div>
  )
}
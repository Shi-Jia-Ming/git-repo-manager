import RepoSelection from "./RepoSelection.tsx";
import {appWindow} from "@tauri-apps/api/window";
import {useContext, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api";
import {WorkDirectoryContext} from "../store/workspace.ts";

export default function Toolbar() {
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false);

  const {workspace, workPath} = useContext(WorkDirectoryContext);

  const [historySpace, setHistorySpace] = useState<Array<{
    name: string,
    path: string
  }>>([]);

  async function addHistorySpace(name: string, path: string) {
    if (name === '' || path === '') return;
    const newHistorySpace = historySpace.filter((space) => space.name !== name);
    newHistorySpace.unshift({name, path});
    if (newHistorySpace.length > 5) {
      newHistorySpace.pop();
    }
    setHistorySpace(newHistorySpace);
    // save to local storage
    await invoke('write_history_file', {data: JSON.stringify(newHistorySpace)});
  }

  async function handleMaximize() {
    setIsWindowMaximized(!isWindowMaximized);
    await appWindow.toggleMaximize();
  }

  function handleClose() {
    addHistorySpace(workspace, workPath).then(() => {
      appWindow.close().then();
    });
  }

  useEffect(() => {
    // 获取最近打开的仓库
    // 从本地存储中获取 TODO 如果不设置定时器，会因为Rust端的异步操作导致获取该命令失败
    setTimeout(() => {
      invoke<string>('read_history_file').then((historySrc: string) => {
        try {
          const history: Array<{
            name: string,
            path: string
          }> = JSON.parse(historySrc);
          setHistorySpace(history);
        } catch (e) {
          console.error(e);
        }
      });
    }, 500);
  });

  return (
    <div
      className={"size-full flex justify-between items-center cursor-pointer border-b"} id={"tool-bar"}
      data-tauri-drag-region={"true"}
    >
      <div className={"flex flex-row"} id={"function-area"}>
        <div className={"h-7 w-7 flex items-center justify-center ml-2 mr-1"} id={"app-icon"}>
          <img alt={""} src={"/icon.png"} className={"size-4"}/>
        </div>
        <div className={"h-7"}>
          <RepoSelection historySpace={historySpace} addHistorySpace={addHistorySpace}/>
        </div>
      </div>
      <div id={"control-button-group-area"} className={"absolute right-0 top-0 h-10 w-auto flex flex-rows"}>
        <div className={"h-10 w-12 flex align-middle justify-center hover:bg-gray-100 active:bg-gray-200"}
             id={"minimize-button-container"}>
          <button className={"size-full flex justify-center items-center"} onClick={() => {
            appWindow?.minimize().then(() => {
            })
          }}>
            <img alt={""} src={"/icons/minimize.svg"} className={"size-4"}/>
          </button>
        </div>
        <div className={"h-10 w-12 flex align-middle justify-center hover:bg-gray-100 active:bg-gray-200"}
             id={"maximize-button-container"}>
          <button className={"size-full flex justify-center items-center"} onClick={handleMaximize}>
            {/* TODO can't listen the maximize when double click the drag area */}
            <img alt={""} src={isWindowMaximized ? "/icons/scale-min.svg" : "/icons/scale-max.svg"}
                 className={"size-4"}/>
          </button>
        </div>
        <div className={"h-10 w-12 flex align-middle justify-center hover:bg-[#e93147] active:bg-[#f1626c]"}
             id={"close-button-container"}>
          <button className={"size-full flex justify-center items-center"} onClick={handleClose}>
            <img alt={""} src={"/icons/close.svg"} className={"size-4"}/>
          </button>
        </div>
      </div>
    </div>
  )
}
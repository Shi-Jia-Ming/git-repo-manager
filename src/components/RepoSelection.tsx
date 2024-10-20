import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import NameImage from "./NameImage.tsx";
import {useContext} from "react";
import {WorkDirectoryContext} from "../store/repository.ts";
import {open} from "@tauri-apps/api/dialog";
import {invoke, path} from "@tauri-apps/api";

function RepoItem({name, path, needPath, iconSize, iconColor}: { name: string, path: string, needPath: boolean, iconSize: number, iconColor?: string }) {
    return (
      <div
        className={"flex w-full h-12 pr-2 pl-2 rounded-lg items-center justify-start hover:bg-gray-200 active:bg-gray-300 gap-3"}>
        <NameImage name={name} size={iconSize} color={iconColor ? iconColor : '#8f8f8f'}/>
        <div className={"w-5/6 flex flex-col items-start justify-center"}>
          <div className={"text-[1rem]"}>{name}</div>
          <div hidden={!needPath} className={"size-full text-gray-400 text-[0.8rem] overflow-hidden text-ellipsis whitespace-nowrap"}>{path}</div>
        </div>
      </div>
    )
}

export default function RepoSelection({historySpace, addHistorySpace}: {historySpace: Array<{
    name: string,
    path: string
  }>, addHistorySpace: Function}) {
  const {workspace, workPath, setWorkspace, setWorkPath} = useContext(WorkDirectoryContext);

  async function selectWorkspace(close: Function) {
    const newWorkPath = await open({
      multiple: false,
      directory: true
    });
    if (typeof newWorkPath === "string") {
      // store the new workspace and save the history workspace
      const dirs: string[] = newWorkPath.split(path.sep);
      const workName = dirs[dirs.length - 1];
      // add to history
      await updateWorkspace(workName, newWorkPath);
    }
    close();
  }

  async function updateWorkspace(name: string, path: string) {
      addHistorySpace(workspace, workPath);
      setWorkPath(path);
      setWorkspace(name);
      // init new repo
      await invoke("init_workspace", {path: path});
  }

  return (
    <Popover className={"relative size-full"}>
      <PopoverButton id={"repo-selection"}
                     className={"rounded-lg h-full flex justify-start items-center hover:bg-gray-200 active:bg-gray-300"}>
        <div id={"repo-name"}
             className={"text-[0.8rem] h-5 w-[85%] overflow-hidden whitespace-nowrap text-ellipsis text-left flex justify-start items-center"}>
          {workspace === '' ? <div className={"pl-2 pr-2"}>暂未打开任何仓库</div> : RepoItem({name: workspace, path: '', needPath: false, iconSize: 20})}
        </div>
        <div id={"switch-icon"} className={"w-[15%] flex justify-end"}>
          <img alt={""} src={"/icons/chevron-down.svg"} className={"size-5"}/>
        </div>
      </PopoverButton>
      <PopoverPanel
        transition
        anchor={"bottom start"}
        className={"divide-y divide-white/5 bg-white text-sm/6 border border-black-100 rounded-lg p-2 w-[300px] shadow-lg transition duration-200 ease-in-out  [--anchor-gap:var(--spacing-5)] data-[closed]:translate-y-1 data-[closed]:opacity-0"}>
        {({close}) => (
          <div className={"divide-y divide-solid"}>
            <button
              className={"w-full h-8 mb-1 hover:bg-gray-200 active:bg-gray-300 flex justify-start items-center rounded-lg p-2 gap-2"}
              onClick={() => {
                selectWorkspace(close).then();
              }}
            >
              <div>
                <img alt={""} src={"/icons/plus.svg"} className={"size-4"}/>
              </div>
              <div>打开新的仓库</div>
            </button>
            <div className={"p-2"}>
              <div id={"repo-list-title"} className={"font-bold text-[0.7rem]"}>
                最近的仓库
              </div>
              {historySpace.map((item) => (
                <button
                  id={item.path}
                  key={item.path}
                  className={"w-full h-12"}
                  onClick={() => {updateWorkspace(item.name, item.path); close();}}
                >
                  <RepoItem name={item.name} path={item.path} needPath={true} iconSize={27}/>
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  )
}
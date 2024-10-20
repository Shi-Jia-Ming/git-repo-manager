import { useRef, useState } from "react";
import "./styles/global.css";
import "./styles/rc-dock-extra.css";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "./components/Sidebar";
import { WorkDirectoryContext } from "./store/workspace.ts";
import Toolbar from "./components/Toolbar.tsx";
import MainView from "./components/MainView.tsx";
import { RepoInfo } from "./types/repo.type.ts";
import { RepoContext } from "./store/repository.ts";

function App() {
  const [needAnimation, setNeedAnimation] = useState<boolean>(false);
  const [leftPanelSize, setLeftPanelSize] = useState<number>(20);

  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState<boolean>(false);

  const leftPanelRef = useRef<ImperativePanelHandle>(null);

  const [workspace, setWorkspace] = useState('');
  const [workPath, setWorkPath] = useState('');

  const [activeRepo, setActiveRepo] = useState<RepoInfo>(new RepoInfo());

  const collapseLeftPanel = () => {
    setNeedAnimation(true);
    setTimeout(() => {
      setNeedAnimation(false);
    }, 200);
    if (isLeftPanelCollapsed) {
      leftPanelRef.current?.resize(leftPanelSize);
      setIsLeftPanelCollapsed(false);
    } else {
      setLeftPanelSize(leftPanelRef.current?.getSize() || 20);
      leftPanelRef.current?.resize(0);
      setIsLeftPanelCollapsed(true);
    }
  }

  return (
    <WorkDirectoryContext.Provider value={{ workspace, workPath, setWorkspace, setWorkPath }}>
      <RepoContext.Provider value={{ activeRepo, setActiveRepo }}>
        <div className={"size-full flex flex-col"} id={"main-window"}>
          <div className={"w-full h-10"} id={"tool-bar-container"}>
            <Toolbar />
          </div>
          <div className={"w-full h-except-10 flex"} id={"app-main"}>
            <div
              className={"h-full w-12 flex flex-col items-center justify-start bg-[#f6f6f6] border-r border-[#e0e0e0] pt-1 pb-1"}
              id={"sidebar"}>
              <button
                className={"p-[0.55rem] size-10 rounded-lg text-black hover:bg-gray-200 active:bg-gray-200 transition duration-200 flex align-middle justify-center"}
                id={"sidebar-collapse-button"}
                onClick={collapseLeftPanel}
              >
                <img alt={""}
                  src={isLeftPanelCollapsed ? "/icons/indentation-right.svg" : "/icons/indentation-left.svg"}
                  className={"size-5"} />
              </button>
            </div>
            <div className={"h-full w-except-12"} id={"app-main"}>
              <PanelGroup direction="horizontal" className={"size-full"} autoSaveId={"persistence"}>
                <Panel collapsible defaultSize={leftPanelSize}
                  className={`transition-width ${needAnimation ? 'duration-200' : ''}`} ref={leftPanelRef}>
                  <Sidebar />
                </Panel>
                <PanelResizeHandle
                  className={"hover:bg-purple-500 active:bg-purple-500 transition-colors duration-300"} />
                <Panel defaultSize={80}>
                  {activeRepo.name && <MainView />}
                </Panel>
              </PanelGroup>
            </div>
          </div>
        </div>
      </RepoContext.Provider>
    </WorkDirectoryContext.Provider>
  );
}

export default App;

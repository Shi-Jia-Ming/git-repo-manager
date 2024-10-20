import {useState} from "react"
import FileList from "../sidebars/FileList";

export type SidebarItem = {
  index: number;
  icon: string;
  component: Function;
}

const sidebarItems: SidebarItem[] = [
  {
    index: 0,
    icon: 'file-list.svg',
    component: FileList
  }
]

export default function Sidebar() {
  const [currentActive] = useState<number>(0);

  return (
    <div className={"size-full border-r border-[#e0e0e0]"}>
      {sidebarItems.filter((sidebarItem) => {
        return sidebarItem.index === currentActive;
      })[0].component()}
    </div>
  )
}
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import Reader from "../components/reader/Reader";
import RightPanel from "../components/right-panel/RightPanel";
import StatusBar from "../components/status-bar/StatusBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Reader />
        <RightPanel />
      </div>

      <StatusBar />
    </div>
  );
}
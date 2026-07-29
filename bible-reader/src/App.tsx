import AppLayout from "./layouts/AppLayout";
import { StudySessionProvider } from "./lib/contexts/StudySessionContext";

export default function App() {
  return (
    <StudySessionProvider>
      <AppLayout />
    </StudySessionProvider>
  );
}
import AppLayout from "./layouts/AppLayout";
import { StudySessionProvider } from "./lib/contexts/StudySessionContext";
import { WorkspaceSettingsProvider } from "./lib/contexts/WorkspaceSettingsContext";
import ToastProvider from "./components/toast/ToastProvider";
import ErrorBoundary from "./features/shared/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary variant="full">
      <ToastProvider>
        <WorkspaceSettingsProvider>
          <StudySessionProvider>
            <AppLayout />
          </StudySessionProvider>
        </WorkspaceSettingsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
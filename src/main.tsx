import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './styles/tokens.css';
import './styles/animations.css';

// Register all app components with the plugin registry
import './apps/terminal/TerminalApp';
import './apps/files/FilesApp';
import './apps/settings/SettingsApp';
import './apps/editor/EditorApp';
import './apps/companion/LeluCompanionApp';
import './apps/browser/BrowserApp';
import './apps/stubs/PlaceholderApps';
import './apps/stubs/SystemApps';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

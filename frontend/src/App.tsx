import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommandDashboard from './pages/CommandDashboard';
import CitizenSOS from './pages/CitizenSOS';
import CitizenRecovery from './pages/CitizenRecovery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/command" element={<CommandDashboard />} />
        <Route path="/citizen/sos" element={<CitizenSOS />} />
        <Route path="/citizen/recovery" element={<CitizenRecovery />} />
        {/* Default route to Command Dashboard for demo */}
        <Route path="*" element={<CommandDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

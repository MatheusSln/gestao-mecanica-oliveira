import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { Dashboard } from './pages/Dashboard';
import { Recibos } from './pages/Recibos';
import { DetalhesOS } from './pages/DetalhesOS';
import { Estoque } from './pages/Estoque';
import { Equipe } from './pages/Equipe';
import { NovaOS } from './pages/NovaOS';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MobileLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="recibos" element={<Recibos />} />
          <Route path="recibos/nova" element={<NovaOS />} />
          <Route path="recibos/:id" element={<DetalhesOS />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="equipe" element={<Equipe />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
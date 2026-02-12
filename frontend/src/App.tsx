import { Outlet } from 'react-router-dom';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;
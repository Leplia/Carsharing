import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from './router'; // Импортируем Router
import './styles/App.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
);
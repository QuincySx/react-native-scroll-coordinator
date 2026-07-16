import { createRoot } from 'react-dom/client';

import App from './App';
import './web.css';

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('Missing web root element');
}

createRoot(rootElement).render(<App />);

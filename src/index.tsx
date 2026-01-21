import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexErrorProvider } from './providers/ConvexErrorProvider';

const convex = new ConvexReactClient(import.meta.env.VITE_APP_CONVEX_URL as string);

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as Element);
root.render(
  <ConvexAuthProvider client={convex}>
    <ConvexErrorProvider>
      <App />
    </ConvexErrorProvider>
  </ConvexAuthProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(null);

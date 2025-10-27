import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.jsx';
import './styles/global-fonts.css';
import './styles/Register.css';
import { UserProvider } from './components/common/UserContext';
import { store, persistor } from './store/store';
import { initializeSocket } from './store/socketMiddleware';

initializeSocket(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <UserProvider>
          <App />
        </UserProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
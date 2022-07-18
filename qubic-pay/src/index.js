import React from 'react';
import ReactDOM from 'react-dom/client';
import PaymentForm from './components/PaymentForm';

import './index.css';
import './configs/i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PaymentForm />
  </React.StrictMode>
);

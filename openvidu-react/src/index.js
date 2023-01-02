import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import S_words from './page_info/S_word';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

registerServiceWorker();

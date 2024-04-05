import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from './App';
import DetailView from './DetailView ';

function Root() {
  return (
    <Router>
      <div>
        <Route path="/" exact component={App} />
        <Route path="/detail/:index" render={(props) => <DetailView {...props} filteredData={filteredData} />} />
      </div>
    </Router>
  );
}

export default Root;
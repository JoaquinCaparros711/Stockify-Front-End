import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Home from './components/pages/Home';
import Products from './components/pages/Products';
import Branchs from './components/pages/Branchs';

function App() {
  return (
    <>
      <Router>
        <NavBar />
        <Routes>
          <Route path='/' exact Component={Home}/>
          <Route path='/products' Component={Products}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;

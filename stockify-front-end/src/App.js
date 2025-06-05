import './App.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import Home from './components/pages/Home';
import Products from './components/pages/Products';
import Branchs from './components/pages/Branchs';

function App() {
  return (
    <Router>
      <div className='flex'>
        <SideBar />
        <div className='content w-100'>
          <NavBar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/products' element={<Products />} />
            <Route path='/branchs' element={<Branchs />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

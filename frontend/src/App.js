import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Screens/Home';

function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
        </Routes>
     </BrowserRouter>
    </div>
  );
}

export default App;

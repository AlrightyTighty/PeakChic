import {BrowserRouter as Router, Route, Routes} from "react-router";
import Main from "./pages/Main";
import Result from "./pages/Result";
import Info from "./pages/Info";

export default function App() {

  return (
    <div>
    <Router initialEntries={['/']}>
      <Routes>
        <Route index path="/" element={<Main/>}/>
        <Route path="/result" element={<Result/>}/>
        <Route path="/rating" element ={<Info/>}/>
      </Routes>
    </Router>

    </div>
  );
}

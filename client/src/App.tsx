import {MemoryRouter as Router, Route, Routes} from "react-router";
import Main from "./pages/Main";
import Result from "./pages/Result";

export default function App() {

  return (
    <div>
    <Router initialEntries={['/']}>
      <Routes>
        <Route index path="/" element={<Main/>}/>
        <Route path="/result" element={<Result/>}/>
      </Routes>
    </Router>

    </div>
  );
}

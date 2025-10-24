import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IdenfyVerification from "./pages/IdenfyVerification";

function App() {
  return (
    <div className="w-full">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IdenfyVerification />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;

import {BrowserRouter, Routes, Route} from "react-router-dom"
import Login from "./Login"
function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<h1>Hello</h1>} />
        <Route path="Login" element={<Login />} />
        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

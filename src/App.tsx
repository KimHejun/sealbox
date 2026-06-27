import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Write from './pages/Write'
import Receive from './pages/Receive'
import View from './pages/View'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/write" element={<Write />} />
      <Route path="/receive" element={<Receive />} />
      <Route path="/view/:code" element={<View />} />
    </Routes>
  )
}

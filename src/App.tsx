import { useState } from 'react'
import FilterHistory from './components/FilterHistory'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'min-h-screen bg-neutral-900 text-neutral-100' : 'min-h-screen bg-white text-neutral-900'}>
      {/* Mock de dark mode */}
      <button
        onClick={() => setDarkMode((v) => !v)}
        className="fixed top-6 right-6 rounded-md border px-3 py-1 text-sm shadow-sm bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-pointer"
      >
        {darkMode ? 'Light' : 'Dark'} mode
      </button>

      <FilterHistory darkMode={darkMode} />
    </div>
  )
}

export default App

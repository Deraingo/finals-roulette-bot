import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import FinalsRouletteSection from './components/FinalsRouletteSection'
import Footer from './components/Footer'
import Vibebot from './components/VibebotSection'
import Waymark from './components/Waymark'
function App() {
  return (
    <>
      <Header/>
        <div className='flex-1 main'>
          <div className='story'>
            <p>Welcome to Deraingo.dev!</p>
            <p> I mainly plan to use this site as a display / frontend for my bots, and links to my other projects!</p>
          </div>
          <FinalsRouletteSection/>
          {/* <Vibebot/>
          <Waymark/> */}
        </div>
      <Footer/>
    </>
  )
}

export default App

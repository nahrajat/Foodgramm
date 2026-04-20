import React from 'react'
import Video from '../components/Home/Video'
import Hometoptext from '../components/Home/Hometoptext'
import Bottomtext from '../components/Home/Bottomtext'

import Navigationbar from '../components/Home/Navigationbar'

const Home = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="fixed inset-0 h-full w-full z-[-10]">
        <Video />
      </div>
      <div className="relative flex flex-col min-h-screen w-full z-10">
        <Navigationbar />
        <main className="flex-1 flex flex-col justify-center items-center px-2 sm:px-4 md:px-8">
          <Hometoptext />
          <Bottomtext />
        </main>
      </div>
    </div>
  )
}

export default Home

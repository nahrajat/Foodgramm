import React from 'react'
import Section1  from '../components/Aboutus/Section1.jsx'
import Section2 from '../components/Aboutus/Section2.jsx'
import Section3 from '../components/Aboutus/Section3.jsx'
import Navigationbar from '../components/Home/Navigationbar.jsx'

const Aboutus = () => {
  return (
    <div className="relative min-h-screen w-full text-white">
      <div className="h-full w-full relative">
        <Navigationbar />
        <div className="absolute inset-0 bg-[url('/chef2.jpg')] bg-cover bg-center bg-no-repeat bg-fixed blur-[5px] z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row h-full w-full min-h-screen">
          <div className="w-full md:w-[30%] h-auto md:h-screen flex-shrink-0"><Section1 /></div>
          <div className="w-full md:w-[70%] h-auto md:h-screen flex flex-col">
            <div className="h-auto md:h-[65%] transition-transform duration-200 flex-1"><Section2 /></div>
            <div className="h-auto md:h-[35%] flex-1"> <Section3 /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Aboutus

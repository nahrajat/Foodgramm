import React from 'react'
import Video from './Video'

const Hometoptext = () => {
  return (
    <div className="font-[font1] mt-16 sm:mt-20 px-2 sm:px-8 text-white w-full">
      <div className="text-[10vw] sm:text-[6vw] mt-6 sm:mt-9 uppercase leading-[10vw] sm:leading-[6vw] flex flex-wrap items-center justify-center text-center">your culinery</div>

      <div className="text-[10vw] sm:text-[6vw] mt-6 sm:mt-9 uppercase leading-[10vw] sm:leading-[6vw] flex flex-wrap items-center justify-center text-center">
        <div className="mx-2 sm:ml-20 sm:mr-2 rounded-full overflow-hidden h-[12vw] w-[12vw] min-w-[60px] min-h-[60px] max-w-[120px] max-h-[120px] flex items-center justify-center">
          <Video />
        </div>
        adventure
      </div>
      <div className="text-[10vw] sm:text-[6vw] mt-6 sm:mt-9 uppercase leading-[10vw] sm:leading-[6vw] flex flex-wrap items-center justify-center text-center">starts here</div>
    </div>
  )
}

export default Hometoptext

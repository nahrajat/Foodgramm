import React from 'react'
import Navigationbar from '../components/Home/Navigationbar'

const Connect = () => {
  return (
    <div className="min-h-screen w-full relative">
      <Navigationbar />
      <div className="absolute inset-0 bg-[url('/chefaboutus.jpg')] bg-cover bg-center bg-no-repeat bg-fixed blur-[5px] z-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full text-white pt-16 sm:pt-20 px-2 sm:px-4">
        <div className="w-full max-w-xl bg-black/40 rounded-lg p-4 sm:p-8 text-center shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="mb-4 text-base sm:text-lg">We'd love to hear from you! Reach out to us through any of the channels below:</p>
          <ul className="list-disc list-inside text-left mx-auto w-fit text-sm sm:text-base">
            <li>Email: support@foodgram.com</li>
            <li>Phone: (123) 456-7890</li>
            <li>Social Media: @foodgram on all platforms</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Connect
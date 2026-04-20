import React from 'react'
import Navigationbar from '../components/Home/Navigationbar'

const Help = () => {
  return (
    <div className="min-h-screen w-full relative">
      <Navigationbar />
      <div className="absolute inset-0 bg-[url('/chef3.jpg')] bg-cover bg-center bg-no-repeat bg-fixed blur-[5px] z-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full text-white pt-16 sm:pt-20 px-2 sm:px-4">
        <div className="w-full max-w-xl bg-black/40 rounded-lg p-4 sm:p-8 text-center shadow-lg">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="mb-4 text-base sm:text-lg">If you have any questions or need assistance, please reach out to our support team.</p>
          <h2 className="text-lg sm:text-2xl font-semibold mb-2">Frequently Asked Questions</h2>
          <ul className="list-disc list-inside text-left mx-auto w-fit text-sm sm:text-base">
            <li>How do I place an order?</li>
            <li>What payment methods do you accept?</li>
            <li>Can I modify my order after it's been placed?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Help
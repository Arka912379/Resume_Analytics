import React from 'react'

const Navbar = () => {
  return (
    <div className='fixed top-0 w-[80%] h-28 text-black right-0 flex justify-between items-start'>
      <div className="heading h-full w-[70%] bg-yellow-500 border border-black">Dashboard</div>
      <div className="profile h-[80%] w-[30%] bg-gray-200 border border-black">User Profile</div>
    </div>
  )
}

export default Navbar
import React from 'react'
import { Link } from 'react-router-dom'

const InfoDiv = ({heading, textdetail,btnText,linktext}) => {
  return (
    <div className='w-full md:px-[11%]  h-[325px] flex flex-col justify-center items-center   gap-7 '>
        <h1 className='font-bold font-serif text-3xl text-center'>{heading}</h1>
        <div className='text-wrap px-auto text-center'>
            {textdetail}
        </div>
        <Link to={linktext} className='px-7 bg-black text-white py-3 rounded-md '>{btnText}</Link>
    </div>
  )
}

export default InfoDiv
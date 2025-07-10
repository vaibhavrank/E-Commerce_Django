import React from 'react'
import banner_image from '../assets/images/banner_image.jpg'
import ShopByCategory from '../components/core/Homepage/ShopByCategory'
import NewInItems from '../components/core/Homepage/NewInItems'
import ClosetSection from '../components/core/Homepage/ClosetSection'

const Home = () => {
    

  return (
    <div className='w-screen flex  flex-col items-center justify-center  '>
      {/* hero section part 1*/}
      <div
        style={{
            backgroundImage: `url(${banner_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100vw',
            height: '536px',
            position:'relative'
        }}
        className="flex pl-[110px] relative justify-center  text-white"
      >
        
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-0" />
        <div className='flex flex-col justify-center items-start gap-7 z-10'>
            <div className='text-white text-5xl text-bold font-serif font-bold'>
                <p>Not your ordinary</p> 
                <p>vintage store</p>
            </div>
            <button className='text-black bg-white border-1 border-black rounded-sm px-7  py-3'>Shop Now</button>
        </div>
        <div className='w-[50%]'></div>
      </div>
      {/* hero section part 2 */}
        <div className='bg-white w-dvw px-auto  '>
          <ShopByCategory />
          <NewInItems />
          <ClosetSection />
        </div>
        
    </div>
  )
}

export default Home

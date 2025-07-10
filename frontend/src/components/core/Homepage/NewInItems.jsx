import React from 'react'
import i1 from '../../../assets/images/h_pro_img_1.jpg'
import i2 from '../../../assets/images/h_pro_img_2.jpg'
import i3 from '../../../assets/images/h_pro_img_3.jpg'
import i4 from '../../../assets/images/h_pro_img_4.jpg'
import { Link } from 'react-router-dom'
import InfoDiv from './InfoDiv'
import InstagramSlider from './InstagramSlider'

const NewInItems = () => {
  const newInData = [
    { id: 1, title: "Gucci Bag", price: 255, stock: 1, image: i1 },
    { id: 2, title: "Gucci Bag", price: 255, stock: 1, image: i2 },
    { id: 3, title: "Gucci Bag", price: 255, stock: 1, image: i3 },
    { id: 4, title: "Gucci Bag", price: 255, stock: 0, image: i4 },
    { id: 5, title: "Gucci Bag", price: 255, stock: 1, image: i1 },
    { id: 6, title: "Gucci Bag", price: 255, stock: 1, image: i2 },
    { id: 7, title: "Gucci Bag", price: 255, stock: 1, image: i3 },
    { id: 8, title: "Gucci Bag", price: 255, stock: 1, image: i4 }
  ];

  return (
    <div className=" md:mx-auto bg-slate-200 flex flex-col justify-center items-center gap-7  px-4 py-10">
      {/* Heading */}
      <h2 className="md:max-w-lvw  mx-auto px-1 text-2xl text-start font-semibold mb-6">New In</h2>
      {/* Show some New ins items */}
      <div className="md:max-w-lvw mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {newInData.map((item) => (
          <div key={item.id} className="p-[6px]  bg-white  overflow-hidden   transition">
            <div className="relative w-full h-[80%] overflow-hidden group">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" >
              </img>
               {!item.stock && (
                <div className="absolute inset-0 top-[45%] flex items-center bg-black bg-opacity-60 h-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className=" h-[25px] animate-marquee whitespace-nowrap flex items-center justify-center">
                    <p className="text-white text-3xl font-extrabold mx-4">
                      {"Oops! Sold ".repeat(20)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-gray-600">${item.price}</p>
            </div>
          </div>
        ))}
      </div>
      {/* View More Button */}
      <div className='text-center'>
        <Link className="px-8 py-3 text-white bg-black rounded-md ">view All</Link>
      </div>
      {/* information div */}
      <div className='md:w-[80%] mx-auto flex flex-col sm:flex-row items-center  justify-center gap-2 bg-white h-full p-4'>
        <InfoDiv 
          textdetail={`Lorem ipsum dolor sit amet consectetur
             adipisicing elit. Dolorem 
             dolor tempora excepturi ut sequi.`}
          btnText={"Learn More"}
          heading={"How Selling Works"}
          linktext={'/#'}
          className="w-[50%]"
        />
        <div className='hodden h-[1px] sm:h-[268px]  sm:w-[1px] w-[80%] blur-[0.5px] bg-stone-300'></div>
        <InfoDiv 
          textdetail={`Lorem ipsum dolor sit amet consectetur
             adipisicing elit. Dolorem 
             dolor tempora excepturi ut sequi.`}
          btnText={"Learn More"}
          heading={"How Selling Works"}
          linktext={'/#'}
          className="w-[50%]"
        />
      </div>
      {/* Instagram Feed */}
      {/* <div className='md:w-[80%]'>
        <InstagramSlider />
      </div> */}
    </div>
  );
};

export default NewInItems;

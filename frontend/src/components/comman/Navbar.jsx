import React from 'react'
import { GoSearch } from "react-icons/go";
import { BsPerson } from "react-icons/bs";
import { PiBag } from "react-icons/pi";
import { IoIosLogIn } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import logo from '../../assets/logo.svg'
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../services/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = ()=>{
    dispatch(logout());
    navigate('/auth');
  }
  const {accessToken} = useSelector((state)=>state.auth);
  return (
    <div className='px-[32px] fixed top-0 z-50 w-dvw py-[28px] bg-white flex justify-between md:px-10   items-center '>
      <div className='hidden md:flex gap-10  text-3xl justify-center'>
        <Link to={'/shop'} className=' '>Shop</Link>
        <Link to={'/'}>New</Link>
        <Link to={'/'} >Designer</Link>
        <Link to={'/'}>Sale</Link>
      </div>
      <div>
        <div><a href='/ ' ><img src={logo} /></a></div>
      </div>
      <div className='flex text-[1rem] gap-6 justify-center items-center'>
        <div className='hidden font-bold md:flex gap-10 justify-between items-center'>
            <GoSearch className='text-3xl' />
            {
              accessToken==null?(
                <Link to={'/auth'} ><IoIosLogIn className='text-3xl' /></Link>
              )
              :(
                <div className='flex items-center justify-between gap-5'>
                  <Link to={'/profile'} ><BsPerson className='text-3xl' /></Link>
                  <CiLogout 
                    onClick={()=>handleLogout()}
                    className='text-3xl'
                  />
                </div>
              )
            }
        </div>
        
        <div className='flex justify-baseline items-center gap-4' >
            <PiBag className='text-3xl' /><div className='text-3xl pb-1'>8</div>
        </div>
      </div>
    </div>
  )
}

export default Navbar

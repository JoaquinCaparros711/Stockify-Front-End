import React from 'react'
import {NavLink} from 'react-router-dom';
import { RxHamburgerMenu} from "react-icons/rx";
import { MdOutlineAddHomeWork } from "react-icons/md";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";

const SideBar = () => {
    return (
        <div className='sidebar bg-light'>
            <ul>
                <li>
                    <NavLink to="/" exact className='text-dark rounded py-2 w-100 d-inline-block px-3' activeClassName="active">
                        <RxHamburgerMenu className='me-2'/> Inicio
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/products" exact className='text-dark rounded py-2 w-100 d-inline-block px-3' activeClassName="active">
                        <MdOutlineProductionQuantityLimits className='me-2' /> Productos
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/branchs" exact className='text-dark rounded py-2 w-100 d-inline-block px-3' activeClassName="active">
                        <MdOutlineAddHomeWork className='me-2' /> Clientes
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default SideBar

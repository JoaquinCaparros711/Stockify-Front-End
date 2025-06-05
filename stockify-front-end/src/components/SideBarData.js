import React from "react";
import * as AiIcons from "react-icons/ai";
import *as HiIcons from "react-icons/hi";
import * as MdIcons from "react-icons/md";



export const SideBarData = [
    {
        title: 'Inicio',
        path: '/',
        icon: <AiIcons.AiFillHome />,
        cName: 'nav-text'
    },
    {
        title: 'Productos',
        path: '/products',
        icon: <AiIcons.AiOutlineProduct />,
        cName: 'nav-text'
    },
    {
        title: 'Movimientos',
        path: '/movimientos',
        icon: <MdIcons.MdMoveUp />,
        cName: 'nav-text'
    },
    {
        title: 'Stock',
        path: '/stock',
        icon: <AiIcons.AiOutlineStock />,
        cName: 'nav-text'
    },
    {
        title: 'Sucursales',
        path: '/sucursales',
        icon: <MdIcons.MdOutlineAddHomeWork />,
        cName: 'nav-text'
    },
    {
        title: 'Usuarios',
        path: '/Usuarios',
        icon: <HiIcons.HiOutlineUserAdd />,
        cName: 'nav-text'
    },
]



import { FaHome } from "react-icons/fa";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { MdMoveUp } from "react-icons/md";
import { AiOutlineStock } from "react-icons/ai";
import { MdOutlineAddHomeWork } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";
import { BsBoxArrowLeft } from "react-icons/bs";


export const sidebarItems = [
  { path: '/', icon: <FaHome />, text: 'Inicio' },
  { path: '/productos', icon: <MdOutlineProductionQuantityLimits  />, text: 'Productos' },
  { path: '/movimientos', icon: <MdMoveUp />, text: 'Movimientos' },
  { path: '/stock', icon: <AiOutlineStock />, text: 'Stock' },
  { path: '/sucursales', icon: <MdOutlineAddHomeWork />, text: 'Sucursales' },
  { path: '/usuarios', icon: <HiOutlineUserAdd />, text: 'Usuarios' },
];

export const logoutItem = {
    icon: <BsBoxArrowLeft />,
    text: 'Cerrar Sesión'
};
import { FaHome } from "react-icons/fa";
import { MdOutlineProductionQuantityLimits, MdOutlineAddHomeWork, MdMoveUp } from "react-icons/md";
import { AiOutlineStock } from "react-icons/ai";
import { HiOutlineUserAdd } from "react-icons/hi";
import { BsFileEarmarkText, BsBuilding, BsBoxSeam, BsGraphUp, BsBoxArrowLeft } from 'react-icons/bs';


export const sidebarItems = [
  { path: '/', icon: <FaHome />, text: 'Inicio' },
  { path: '/productos', icon: <MdOutlineProductionQuantityLimits  />, text: 'Productos' },
  { path: '/movimientos', icon: <MdMoveUp />, text: 'Movimientos' },
  { path: '/stock', icon: <AiOutlineStock />, text: 'Stock' },
  { path: '/sucursales', icon: <MdOutlineAddHomeWork />, text: 'Sucursales' },
  { path: '/usuarios', icon: <HiOutlineUserAdd />, text: 'Usuarios' },
  { path: '/reportes', icon: <BsFileEarmarkText />, adminOnly: true, text: 'Reportes' },
  { path: '/empresa', icon: <BsBuilding />, adminOnly: true, text: 'Mi Empresa' },
];

export const logoutItem = {
    icon: <BsBoxArrowLeft />,
    text: 'Cerrar Sesión'
};
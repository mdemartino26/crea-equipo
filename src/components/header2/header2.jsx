import React from 'react';
import './header2.css'; // Importa tu archivo CSS para los estilos del header
import logo from "../../assets/img/logo.png";

function Header2() {
  return (
    <header className='header2'>
      
      <img src={logo} alt="" />
    </header>
  );
}

export default Header2;
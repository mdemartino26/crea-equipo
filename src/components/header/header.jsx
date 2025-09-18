import React from 'react';
import './header.css'; // Importa tu archivo CSS para los estilos del header
import logo from "../../assets/img/logo.png";

function Header() {
  return (
    <header>
      
      <img src={logo} alt="" className='fotoLogo'/>
    </header>
  );
}

export default Header;
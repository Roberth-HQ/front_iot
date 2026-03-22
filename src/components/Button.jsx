import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary" }) => {
  // Estilos base
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: '0.3s',
    width: '100%'
  };

  // Colores según la variante
  const variants = {
    primary: { backgroundColor: '#2563eb', color: 'white' },
    secondary: { backgroundColor: '#64748b', color: 'white' },
    blockchain: { backgroundColor: '#10b981', color: 'white' }, // Verde para éxito/blockchain
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

export default Button;
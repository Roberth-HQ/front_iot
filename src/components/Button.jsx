// src/components/Button.jsx
const Button = ({ children, type = "button", onClick }) => {
  return (
    <button 
      type={type} 
      onClick={onClick}
      style={{
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        width: '100%',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      {children}
    </button>
  );
};

export default Button;
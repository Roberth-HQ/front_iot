import React from 'react';

const Input = ({ label, type, value, onChange, placeholder }) => {
  return (
    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
      <label style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '5px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

export default Input;
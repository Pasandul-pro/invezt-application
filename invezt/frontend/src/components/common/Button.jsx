const Button = ({ children, variant = 'primary', className = '', onClick, ...props }) => {
  const variants = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    danger: 'btn bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
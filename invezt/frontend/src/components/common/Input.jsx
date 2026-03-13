const Input = ({ label, type = 'text', placeholder, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`input ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
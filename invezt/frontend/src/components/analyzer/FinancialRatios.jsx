const FinancialRatios = ({ ratios }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex justify-center items-center gap-1 text-2xl">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">½</span>}
      </div>
    );
  };

  const getRatingClass = (rating) => {
    if (rating >= 4.5) return 'bg-green-50 border-l-4 border-r-4 border-green-500';
    if (rating >= 3.5) return 'bg-blue-50 border-l-4 border-r-4 border-blue-500';
    return 'bg-red-50 border-l-4 border-r-4 border-red-500';
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-primary mb-6 border-b-2 border-gray-200 pb-3">
        Key Financial Ratios
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratios.map((ratio, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-xl shadow-md hover:shadow-xl transition-all ${getRatingClass(ratio.rating)}`}
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">{ratio.name}</h4>
              <div className="mb-3">{renderStars(ratio.rating)}</div>
              <p className="text-sm text-gray-600 font-medium">{ratio.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialRatios;
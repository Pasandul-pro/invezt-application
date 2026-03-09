const StockCharts = ({ companies }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-primary mt-12 mb-6 border-b-2 border-gray-200 pb-3">
        Stock Performance Charts
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <StockChart key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

const StockChart = ({ company }) => {
  const isPositive = company.change >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">
            {company.name}
          </h4>
          <p className="text-xs text-gray-500">({company.ticker})</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-green-600">
            LKR {company.currentPrice.toFixed(2)}
          </div>
          <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{company.change}%
          </div>
        </div>
      </div>
      
      {/* Simple Chart Visualization */}
      <div className="h-32 bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-lg flex items-end p-4 relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-2">
          {[40, 60, 45, 70, 85, 75, 90, 95, 85, 100].map((height, i) => (
            <div
              key={i}
              className={`w-2 rounded-t transition-all hover:opacity-80 ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Price Up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Price Down</span>
        </div>
      </div>
    </div>
  );
};

export default StockCharts;
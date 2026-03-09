const PortfolioTable = ({ items, onRemove }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Company</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Shares</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Avg. Cost (LKR)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Current Price (LKR)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Value (LKR)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Gain/Loss (%)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{item.company}</td>
              <td className="px-4 py-3 text-sm">{item.shares}</td>
              <td className="px-4 py-3 text-sm">{item.avgCost.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm">{item.currentPrice.toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-semibold">
                {(item.shares * item.currentPrice).toFixed(2)}
              </td>
              <td className={`px-4 py-3 text-sm font-bold ${item.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.gain >= 0 ? '+' : ''}{item.gain}%
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onRemove(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-xs font-semibold"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
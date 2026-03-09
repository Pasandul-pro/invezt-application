const CompanyInfo = ({ company }) => {
  return (
    <div className="bg-secondary text-white rounded-2xl p-8 mb-6 shadow-lg hover:shadow-2xl transition-shadow">
      <h3 className="text-2xl font-bold mb-6">
        {company.name} ({company.ticker})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Founded" value={company.founded} />
        <InfoItem label="Market Cap" value={company.marketCap} />
        <InfoItem label="CEO" value={company.ceo} />
        <InfoItem label="Sector" value={company.sector} />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-white text-gray-900 rounded-lg p-4 hover:scale-105 transition-transform">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-xl font-bold text-primary">{value}</div>
  </div>
);

export default CompanyInfo;
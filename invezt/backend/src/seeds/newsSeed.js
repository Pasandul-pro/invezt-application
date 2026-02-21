const mongoose = require('mongoose');
const News = require('../models/News');

/**
 * Seed script to populate the database with sample news articles
 * that match the wireframe design
 */
const seedNews = async () => {
  try {
    // Clear existing news
    await News.deleteMany({});
    console.log('🗑️  Existing news cleared');

    // Sample news data matching your wireframe exactly
    const newsData = [
      {
        title: "John Keells Holdings Reports Strong Q3 Earnings",
        summary: "JKH posts 25% growth in quarterly profits driven by robust performance in leisure and transportation sectors. The company's diversified portfolio continues to show resilience in the current economic climate.",
        content: "Full article content here. John Keells Holdings (JKH) reported consolidated revenue of LKR 45.2 billion for the third quarter, representing a 25% increase year-over-year. The Leisure sector showed remarkable recovery with revenue up 40%, while Transportation contributed LKR 12.5 billion. The company's diversified portfolio continues to demonstrate resilience amid challenging economic conditions. Management remains optimistic about future growth prospects, citing strong performance across all business segments.",
        date: new Date("2024-11-07"),
        category: "Earnings Report",
        imageUrl: "https://via.placeholder.com/300x200/1e3a8a/ffffff?text=JKH+Earnings",
        readMoreLink: "#",
        isFeatured: true,
        views: 1250,
        tags: ["JKH", "Earnings", "Growth", "Q3"],
        relatedStocks: [
          { ticker: "JKH.N0000", companyName: "John Keells Holdings" }
        ]
      },
      {
        title: "Commercial Bank Expands Digital Banking Services",
        summary: "COMB launches new mobile banking features targeting youth market, expects 30% digital transaction growth. The bank is investing heavily in technology to capture the growing digital banking segment.",
        content: "Full article content here. Commercial Bank of Ceylon (COMB) unveiled a suite of new digital banking features aimed at the youth market. The new mobile app includes features such as instant account opening, peer-to-peer payments, and gamified savings goals. The bank expects digital transaction volume to grow by 30% over the next 12 months. 'We are committed to leading the digital transformation in Sri Lankan banking,' said the CEO.",
        date: new Date("2024-11-06"),
        category: "Company News",
        imageUrl: "https://via.placeholder.com/300x200/3b82f6/ffffff?text=COMB+Digital",
        readMoreLink: "#",
        isFeatured: true,
        views: 980,
        tags: ["COMB", "Banking", "Digital", "Mobile"],
        relatedStocks: [
          { ticker: "COMB.N0000", companyName: "Commercial Bank of Ceylon" }
        ]
      },
      {
        title: "Hatton National Bank Announces Dividend Increase",
        summary: "HNB board approves 15% dividend hike citing strong capital adequacy and improved asset quality. This marks the third consecutive year of dividend increases for the banking giant.",
        content: "Full article content here. Hatton National Bank (HNB) announced a 15% increase in its dividend payout, raising it to LKR 15.50 per share. The decision comes on the back of strong capital adequacy ratios and improved asset quality metrics. This marks the third consecutive year of dividend increases for the bank. 'Our robust financial position allows us to reward shareholders while maintaining adequate capital buffers,' stated the Chairman.",
        date: new Date("2024-11-05"),
        category: "Earnings Report",
        imageUrl: "https://via.placeholder.com/300x200/10b981/ffffff?text=HNB+Dividend",
        readMoreLink: "#",
        isFeatured: true,
        views: 1100,
        tags: ["HNB", "Dividend", "Banking", "Shareholder"],
        relatedStocks: [
          { ticker: "HNB.N0000", companyName: "Hatton National Bank" }
        ]
      },
      {
        title: "ASPI Reaches 12,500 Points Amid Economic Recovery",
        summary: "Colombo Stock Exchange main index climbs to 12-month high as foreign investors return to Sri Lankan markets. The benchmark index has gained 18% year-to-date.",
        content: "Full article content here. The All Share Price Index (ASPI) surged past 12,500 points for the first time in 12 months, driven by renewed foreign investor interest and positive economic indicators. The index has gained 18% since January, with banking and manufacturing sectors leading the rally. Market capitalization crossed LKR 4.5 trillion. Analysts attribute the momentum to improving macroeconomic conditions and corporate earnings growth.",
        date: new Date("2024-11-04"),
        category: "Market News",
        imageUrl: "https://via.placeholder.com/300x200/f59e0b/ffffff?text=ASPI+12500",
        readMoreLink: "#",
        isFeatured: false,
        views: 2100,
        tags: ["ASPI", "CSE", "Market", "Stocks"],
        relatedStocks: []
      },
      {
        title: "Manufacturing Sector Shows Strong Export Growth",
        summary: "Export-oriented manufacturing companies report 18% revenue growth in Q3, led by textile and rubber products. The sector is benefiting from improved global demand and competitive exchange rates.",
        content: "Full article content here. Sri Lanka's manufacturing sector recorded 18% revenue growth in Q3 2024, driven by strong performance in textiles, rubber products, and food processing. Export earnings reached LKR 350 billion, the highest in two years. The textile sector grew 22% year-over-year, while rubber products increased by 15%. Industry leaders attribute the growth to improved global demand and competitive pricing.",
        date: new Date("2024-11-03"),
        category: "Economic Update",
        imageUrl: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Manufacturing",
        readMoreLink: "#",
        isFeatured: false,
        views: 760,
        tags: ["Manufacturing", "Exports", "Economy", "Growth"],
        relatedStocks: []
      },
      {
        title: "Insurance Sector Regulatory Changes Announced",
        summary: "CBSL introduces new capital requirements for insurance companies, effective from next financial year. The move aims to strengthen the sector's resilience amid economic uncertainties.",
        content: "Full article content here. The Central Bank of Sri Lanka (CBSL) announced new capital adequacy requirements for insurance companies, set to take effect from the next financial year. The minimum capital requirement will increase by 40% over two years. The move is aimed at strengthening the sector's resilience and protecting policyholders. Insurance companies will need to raise additional capital or merge to meet the new requirements.",
        date: new Date("2024-11-02"),
        category: "Regulatory",
        imageUrl: "https://via.placeholder.com/300x200/ef4444/ffffff?text=Insurance+Regs",
        readMoreLink: "#",
        isFeatured: false,
        views: 540,
        tags: ["Insurance", "Regulation", "CBSL", "Capital"],
        relatedStocks: []
      }
    ];

    // Insert the data
    await News.insertMany(newsData);
    console.log(`✅ Successfully seeded ${newsData.length} news articles`);
    console.log('\n📰 Seeded news articles:');
    newsData.forEach((news, index) => {
      console.log(`   ${index + 1}. ${news.title} (${news.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding news:', error.message);
  }
};

// If running this script directly
if (require.main === module) {
  // Connect to database
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invezt', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('📦 Connected to MongoDB');
    await seedNews();
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
}

module.exports = seedNews;
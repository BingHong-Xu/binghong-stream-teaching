import fs from 'fs';

const portfolioData = JSON.parse(fs.readFileSync('data/portfolio_data.json', 'utf-8'));
const specialFeatures = JSON.parse(fs.readFileSync('data/special_features.json', 'utf-8'));
const threePillars = JSON.parse(fs.readFileSync('data/three_teaching_pillars.json', 'utf-8'));
const sustainabilityAward = JSON.parse(fs.readFileSync('data/sustainability_award.json', 'utf-8'));

const jsContent = `/**
 * 徐秉鴻老師教學成果典藏庫 - 完整資料集
 */
window.PORTFOLIO_DATA = ${JSON.stringify(portfolioData)};

window.SPECIAL_FEATURES = ${JSON.stringify(specialFeatures)};

window.THREE_PILLARS = ${JSON.stringify(threePillars)};

window.SUSTAINABILITY_AWARD = ${JSON.stringify(sustainabilityAward)};
`;

fs.writeFileSync('js/data.js', jsContent, 'utf-8');
console.log(`Successfully updated js/data.js with SUSTAINABILITY_AWARD, THREE_PILLARS and ${portfolioData.items.length} items!`);

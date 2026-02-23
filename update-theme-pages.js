const fs = require('fs');
const path = require('path');

function replaceMarketplaceFile() {
    const filePath = path.join(__dirname, 'apps/web/app/marketplace/page.tsx');
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace generic background
    content = content.replace(/bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/g, 'bg-[#050505]');
    content = content.replace(/bg-\[radial-gradient\(ellipse_at_center,rgba\(59,130,246,0\.1\),transparent_70%\)\]/g, 'bg-[radial-gradient(ellipse_at_center,rgba(45,235,232,0.1),transparent_70%)]');

    // Header labels
    content = content.replace(/bg-gradient-to-r from-purple-500\/20 to-blue-500\/20 border border-purple-500\/30/g, 'bg-stellar-teal/10 border border-stellar-teal/30');
    content = content.replace(/text-purple-400/g, 'text-stellar-teal');
    content = content.replace(/text-purple-300/g, 'text-stellar-teal');
    content = content.replace(/from-white via-blue-100 to-purple-200/g, 'from-white via-white to-gray-400');
    content = content.replace(/text-4xl md:text-5xl font-bold/g, 'text-5xl md:text-7xl font-black tracking-tighter');

    // Input shadow
    content = content.replace(/focus:border-purple-500\/50/g, 'focus:border-stellar-teal');
    content = content.replace(/focus:ring-purple-500\/50/g, 'focus:ring-stellar-teal/50');
    content = content.replace(/bg-slate-800\/50 border border-slate-700/g, 'bg-white/5 border border-white/10 glass-panel');

    // Cards
    content = content.replace(/from-purple-500\/10 to-blue-500\/10/g, 'from-transparent to-transparent');
    content = content.replace(/border-purple-500\/20/g, 'border-white/10 glass-panel');
    content = content.replace(/hover:border-purple-500\/40/g, 'hover:border-stellar-teal/50');
    content = content.replace(/bg-yellow-500\/20 text-yellow-300/g, 'bg-stellar-yellow/20 text-stellar-yellow');

    // Stats
    content = content.replace(/text-3xl font-bold text-white/g, 'text-4xl font-black font-mono text-stellar-teal animate-pulse-slow');
    content = content.replace(/text-sm text-slate-400/g, 'text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Marketplace updated.');
}


function replaceStrategiesFile() {
    const filePath = path.join(__dirname, 'apps/web/app/strategies/page.tsx');
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Redesigning strategy cards
    content = content.replace(/bg-gradient-to-br \$\{strat\.color\}/g, 'bg-white/5 border-b border-white/5');
    // Replace the inner bg element of strategy cover
    content = content.replace(/<div className="absolute inset-0 bg-black\/20 backdrop-blur-\[2px\]"><\/div>/g, '<div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>');
    // Make font bigger
    content = content.replace(/<h3 className="text-xl font-bold tracking-tight">/g, '<h3 className="text-2xl font-black tracking-tighter text-white">');
    // Align risk tags
    content = content.replace(/className={`text-xs px-2 py-1/g, 'className={`text-[10px] px-2 py-1');
    content = content.replace(/className="text-sm text-gray-400 mb-3 flex-1 leading-relaxed"/g, 'className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed"');

    // Improve grid 
    content = content.replace(/grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8');

    // Improve top hero
    content = content.replace(/text-4xl font-bold mb-4/g, 'text-5xl md:text-7xl font-black tracking-tighter mb-6');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Strategies updated.');
}

replaceMarketplaceFile();
replaceStrategiesFile();

import { useState } from 'react';
import { Printer, Download, Trash2, Layout } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface AdminAnalyticsProps {
  analytics: any;
}

export default function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const handleDownloadCard = async (tableNum: number) => {
    const cardElement = document.getElementById(`table-card-${tableNum}`);
    if (!cardElement) return;

    try {
      const dataUrl = await toPng(cardElement, {
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
            return false;
          }
          return true;
        }
      });
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `Table-${tableNum}-${orientation}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Failed to download card image:', err);
    }
  };

  const handleDownloadAllCards = async () => {
    setIsDownloading(true);
    for (let table = 1; table <= 12; table++) {
      await handleDownloadCard(table);
      await new Promise(r => setTimeout(r, 250));
    }
    setIsDownloading(false);
  };

  const handleClearOrders = async () => {
    if (!window.confirm('Are you sure you want to clear all order history from the system? This action cannot be undone.')) return;
    
    try {
      const apiHost = window.location.origin.includes(':5173') ? 'http://localhost:3000' : window.location.origin;
      const res = await fetch(`${apiHost}/api/analytics/clear-orders`, { method: 'DELETE' });
      if (res.ok) {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('restaurant_order_history') || key.includes('restaurant_active_order') || key.includes('restaurant_cart')) {
            localStorage.removeItem(key);
          }
        });
        alert('Order history cleared successfully!');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to clear order history:', err);
      alert('Failed to clear order history.');
    }
  };

  if (showPreview) {
    return (
      <div className="bg-white min-h-screen font-sans p-8 print:p-0">
        <style>
          {`
            @media print {
              @page { margin: 0.5cm; size: ${orientation === 'landscape' ? 'landscape' : 'portrait'}; }
              body, html, #root, main { 
                background-color: white !important; 
                background: white !important; 
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}
        </style>

        <div className="max-w-7xl mx-auto print:hidden flex flex-wrap justify-between items-center mb-8 gap-4">
          <button
            onClick={() => setShowPreview(false)}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-300">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 flex items-center gap-1">
              <Layout size={14} /> Format:
            </span>
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orientation === 'landscape' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              Landscape (23×15 cm)
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                orientation === 'portrait' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              Portrait (15×23 cm)
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadAllCards}
              disabled={isDownloading}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg disabled:opacity-50"
            >
              <Download size={20} />
              {isDownloading ? 'Downloading...' : 'Download All PNGs'}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c19b2e] transition-colors shadow-lg"
            >
              <Printer size={20} />
              Print QR Codes
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[2cm] py-4 bg-white">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(table => {
            const url = `${window.location.origin}/table/${table}`;
            return orientation === 'landscape' ? (
              <div
                key={table}
                id={`table-card-${table}`}
                className="relative overflow-hidden flex flex-row items-center justify-between border-[6px] border-[#d4af37] rounded-3xl p-10 shadow-2xl text-black"
                style={{
                  width: '23cm',
                  height: '15cm',
                  pageBreakInside: 'avoid',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fdfcf7 40%, #f7f1df 100%)'
                }}
              >
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.06] mix-blend-multiply">
                  <img src="/logo.png" alt="Watermark" className="w-[70%] h-[70%] object-contain grayscale" />
                </div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#d4af37] to-transparent opacity-20 rounded-bl-full z-0" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#d4af37] to-transparent opacity-20 rounded-tr-full z-0" />
                <div className="w-[55%] flex flex-col justify-center h-full z-10 pr-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#d4af37] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {table}
                    </div>
                    <div>
                      <h2 className="text-gray-500 uppercase tracking-widest text-sm font-bold">Table Number</h2>
                      <h1 className="text-5xl font-bold font-['Playfair_Display']">TABLE {table}</h1>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-[#d4af37] pb-2 inline-block font-['Playfair_Display']">Scan & Order</h3>
                    <ul className="text-xl space-y-4 font-medium text-gray-700 list-decimal pl-6 marker:text-[#d4af37] marker:font-bold">
                      <li>Open your phone's camera</li>
                      <li>Point it at the QR code</li>
                      <li>Browse our digital menu</li>
                      <li>Order and enjoy!</li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Best Khmer Restaurant</p>
                  </div>
                </div>
                <div className="w-[45%] flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300 pl-8 h-full z-10">
                  <div className="bg-white p-4 border-4 border-[#d4af37] rounded-3xl shadow-xl transform transition-transform hover:scale-105 relative group">
                    <QRCodeSVG id={`qr-svg-${table}`} value={url} size={220} level="H" fgColor="#000000" />
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <button
                      onClick={() => handleDownloadCard(table)}
                      className="print:hidden mb-2 bg-[#222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-gray-700 shadow"
                    >
                      <Download size={14} /> Download Card PNG
                    </button>
                    <p className="font-bold text-lg text-gray-800 tracking-wider">Wi-Fi: <span className="text-[#d4af37]">Best Khmer</span></p>
                    <p className="font-bold text-sm text-gray-600 tracking-wider mt-1">Pass: <span className="text-[#d4af37]">Bkr@0168</span></p>
                    <p className="text-sm text-gray-500 font-mono mt-1">{url.replace('https://', '').replace('http://', '')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={table}
                id={`table-card-${table}`}
                className="relative overflow-hidden flex flex-col items-center justify-between border-[6px] border-[#d4af37] rounded-3xl p-8 shadow-2xl text-black"
                style={{
                  width: '15cm',
                  height: '23cm',
                  pageBreakInside: 'avoid',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fdfcf7 40%, #f7f1df 100%)'
                }}
              >
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.06] mix-blend-multiply">
                  <img src="/logo.png" alt="Watermark" className="w-[85%] h-[85%] object-contain grayscale" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#d4af37] to-transparent opacity-20 rounded-bl-full z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#d4af37] to-transparent opacity-20 rounded-tr-full z-0" />
                <div className="flex flex-col items-center z-10 w-full text-center">
                  <div className="w-16 h-16 rounded-full bg-[#d4af37] flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-2">
                    {table}
                  </div>
                  <h2 className="text-gray-500 uppercase tracking-widest text-xs font-bold">Table Number</h2>
                  <h1 className="text-4xl font-bold font-['Playfair_Display']">TABLE {table}</h1>
                </div>
                <div className="flex flex-col items-center justify-center z-10 my-4">
                  <div className="bg-white p-4 border-4 border-[#d4af37] rounded-3xl shadow-xl transform transition-transform hover:scale-105">
                    <QRCodeSVG id={`qr-svg-${table}`} value={url} size={210} level="H" fgColor="#000000" />
                  </div>
                  <button
                    onClick={() => handleDownloadCard(table)}
                    className="print:hidden mt-3 bg-[#222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-gray-700 shadow"
                  >
                    <Download size={14} /> Download Card PNG
                  </button>
                </div>
                <div className="w-full flex flex-col items-center z-10 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-[#d4af37] pb-1 mb-3 font-['Playfair_Display']">Scan & Order</h3>
                  <ol className="text-sm font-medium text-gray-700 space-y-1 mb-4 text-left max-w-xs">
                    <li>1. Open your phone's camera</li>
                    <li>2. Point it at the QR code</li>
                    <li>3. Browse our digital menu & order</li>
                  </ol>
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-300 shadow-sm w-full">
                    <p className="font-bold text-base text-gray-800 tracking-wider">Wi-Fi: <span className="text-[#d4af37]">Best Khmer</span></p>
                    <p className="font-bold text-xs text-gray-600 tracking-wider mt-0.5">Pass: <span className="text-[#d4af37]">Bkr@0168</span></p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Best Khmer Restaurant</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden max-w-7xl mx-auto pb-12">
        <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Sales Analytics Dashboard</h1>

        {analytics ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Sales Revenue</p>
                <h3 className="text-3xl font-bold text-[#d4af37]">${analytics.totalRevenue?.toFixed(2) || '0.00'}</h3>
              </div>
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Orders Completed</p>
                <h3 className="text-3xl font-bold text-white">{analytics.totalOrders || 0}</h3>
              </div>
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Average Order Value</p>
                <h3 className="text-3xl font-bold text-[#d4af37]">
                  ${analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2) : '0.00'}
                </h3>
              </div>
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Categories</p>
                <h3 className="text-3xl font-bold text-white">18</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg h-96 flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-white">Revenue (Last 7 Days)</h3>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.salesChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#d4af37', r: 6 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg h-96 flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-[#d4af37]">Top Selling Items</h3>
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topItems} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                      <XAxis type="number" stroke="#888" />
                      <YAxis dataKey="name" type="category" stroke="#fff" width={120} tick={{ fill: '#ccc', fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Bar dataKey="quantity" fill="#d4af37" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
              <h3 className="text-xl font-bold mb-6 text-white">Recent Order History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders?.map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">{order.id}</td>
                        <td className="py-3 px-4 font-bold text-[#d4af37] text-right">${order.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Print Table QR Codes</h3>
                  <p className="text-gray-400 mb-6">Need new QR codes for your tables? Click below to preview, toggle between Landscape (23×15cm) and Portrait (15×23cm), and print or download.</p>
                </div>
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-3 hover:scale-105"
                >
                  <Printer size={20} />
                  Preview & Print QR Codes
                </button>
              </div>

              <div className="bg-gray-900/60 p-8 rounded-3xl border border-red-900/40 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-red-400">Clear Order History</h3>
                  <p className="text-gray-400 mb-6">Want to reset your order logs and sales statistics for a fresh start? This will clear all recorded orders from the database.</p>
                </div>
                <button
                  onClick={handleClearOrders}
                  className="bg-red-500/20 text-red-400 border border-red-500/50 font-bold px-8 py-4 rounded-xl hover:bg-red-500/30 transition-colors shadow-lg flex items-center justify-center gap-3 hover:scale-105"
                >
                  <Trash2 size={20} />
                  Clear All Order History
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
          </div>
        )}
      </div>
    </>
  );
}

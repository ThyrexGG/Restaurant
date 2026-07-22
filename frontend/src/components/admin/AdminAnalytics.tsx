import { useState } from 'react';
import { Printer, Download, Trash2, Layout } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface AdminAnalyticsProps {
  analytics: any;
  backendUrl?: string;
  setAnalytics?: (data: any) => void;
}

export default function AdminAnalytics({ analytics, backendUrl, setAnalytics }: AdminAnalyticsProps) {
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
      const apiHost = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${apiHost}/api/analytics/clear-orders`, { method: 'DELETE' });
      if (res.ok) {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('restaurant_order_history') || key.includes('restaurant_active_order') || key.includes('restaurant_cart')) {
            localStorage.removeItem(key);
          }
        });
        if (setAnalytics) {
          setAnalytics({
            totalRevenue: 0,
            totalOrders: 0,
            recentOrders: [],
            topItems: [],
            salesChart: []
          });
        }
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
              /* LANDSCAPE FORMAT (23cm x 15cm) - UNMISSABLE HIGH-IMPACT DESIGN */
              <div
                key={table}
                id={`table-card-${table}`}
                className="relative overflow-hidden flex flex-row items-center justify-between border-[8px] border-[#d4af37] rounded-3xl p-8 shadow-2xl text-black"
                style={{
                  width: '23cm',
                  height: '15cm',
                  pageBreakInside: 'avoid',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fffdf5 50%, #f7eee0 100%)'
                }}
              >
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.05] mix-blend-multiply">
                  <img src="/logo.png" alt="Watermark" className="w-[70%] h-[70%] object-contain grayscale" />
                </div>

                {/* Accents */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#d4af37] to-transparent opacity-25 rounded-bl-full z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#d4af37] to-transparent opacity-25 rounded-tr-full z-0" />

                {/* Left Side: Table & Instructions */}
                <div className="w-[52%] flex flex-col justify-between h-full z-10 pr-2">
                  {/* Table Badge & Header */}
                  <div>
                    <div className="inline-flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-full shadow-lg border border-[#d4af37] mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold text-lg">
                        {table}
                      </div>
                      <span className="font-['Playfair_Display'] font-bold text-xl tracking-wider text-[#d4af37]">TABLE {table}</span>
                    </div>
                    
                    <h1 className="text-4xl font-black font-['Playfair_Display'] text-gray-900 tracking-tight leading-tight">
                      SCAN FOR <br />
                      <span className="text-[#b08d29] underline decoration-[#d4af37] decoration-4 underline-offset-4">DIGITAL MENU</span>
                    </h1>
                  </div>

                  {/* 3 Step Visual Guide */}
                  <div className="space-y-2.5 my-auto">
                    <div className="flex items-center gap-3 bg-white/90 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="w-8 h-8 rounded-xl bg-[#d4af37]/20 text-[#b08d29] font-black flex items-center justify-center text-sm border border-[#d4af37]/40 flex-shrink-0">1</span>
                      <span className="font-bold text-base text-gray-800">Open your Phone Camera</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/90 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="w-8 h-8 rounded-xl bg-[#d4af37]/20 text-[#b08d29] font-black flex items-center justify-center text-sm border border-[#d4af37]/40 flex-shrink-0">2</span>
                      <span className="font-bold text-base text-gray-800">Point at the QR Code</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/90 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="w-8 h-8 rounded-xl bg-[#d4af37]/20 text-[#b08d29] font-black flex items-center justify-center text-sm border border-[#d4af37]/40 flex-shrink-0">3</span>
                      <span className="font-bold text-base text-gray-800">Order & Enjoy Fresh Food</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Best Khmer Restaurant</span>
                  </div>
                </div>

                {/* Right Side: Big QR Code */}
                <div className="w-[48%] flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300/80 pl-6 h-full z-10">
                  {/* Scan Me Floating Badge */}
                  <div className="mb-2 bg-black text-[#d4af37] text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#d4af37] shadow-md flex items-center gap-1.5">
                    <span>📷</span> SCAN ME TO ORDER
                  </div>

                  <div className="bg-white p-3.5 border-[6px] border-[#d4af37] rounded-3xl shadow-[0_15px_35px_rgba(212,175,55,0.25)] relative group">
                    <QRCodeSVG id={`qr-svg-${table}`} value={url} size={235} level="H" fgColor="#000000" />
                  </div>

                  <div className="mt-3 flex flex-col items-center w-full">
                    <button
                      onClick={() => handleDownloadCard(table)}
                      className="print:hidden mb-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-[#d4af37] shadow hover:bg-gray-800"
                    >
                      <Download size={14} /> Download Card PNG
                    </button>
                    
                    <div className="bg-black text-white p-3 rounded-2xl border-2 border-[#d4af37] w-full text-center shadow-lg">
                      <div className="flex justify-around items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">📶 Free Wi-Fi</span>
                          <span className="font-black text-lg text-[#d4af37] tracking-wide">Best Khmer</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-700"></div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">🔑 Password</span>
                          <span className="font-black text-lg text-white font-mono tracking-wider">Bkr@0168</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PORTRAIT FORMAT (15cm x 23cm) - UNMISSABLE HIGH-IMPACT DESIGN */
              <div
                key={table}
                id={`table-card-${table}`}
                className="relative overflow-hidden flex flex-col items-center justify-between border-[8px] border-[#d4af37] rounded-3xl p-8 shadow-2xl text-black"
                style={{
                  width: '15cm',
                  height: '23cm',
                  pageBreakInside: 'avoid',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fffdf5 50%, #f7eee0 100%)'
                }}
              >
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.05] mix-blend-multiply">
                  <img src="/logo.png" alt="Watermark" className="w-[85%] h-[85%] object-contain grayscale" />
                </div>

                {/* Accents */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#d4af37] to-transparent opacity-25 rounded-bl-full z-0" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#d4af37] to-transparent opacity-25 rounded-tr-full z-0" />

                {/* Top: Header & Table Number Badge */}
                <div className="flex flex-col items-center z-10 w-full text-center">
                  <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full shadow-lg border border-[#d4af37] mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#d4af37] text-black flex items-center justify-center font-bold text-base">
                      {table}
                    </div>
                    <span className="font-['Playfair_Display'] font-bold text-lg tracking-wider text-[#d4af37]">TABLE {table}</span>
                  </div>

                  <h1 className="text-3xl font-black font-['Playfair_Display'] text-gray-900 tracking-tight">
                    SCAN TO ORDER
                  </h1>
                </div>

                {/* Center: High-Impact QR Code */}
                <div className="flex flex-col items-center justify-center z-10 my-2">
                  <div className="mb-2 bg-black text-[#d4af37] text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full border border-[#d4af37] shadow-md flex items-center gap-1">
                    <span>📷</span> POINT CAMERA HERE
                  </div>

                  <div className="bg-white p-3 border-[6px] border-[#d4af37] rounded-3xl shadow-[0_15px_35px_rgba(212,175,55,0.25)]">
                    <QRCodeSVG id={`qr-svg-${table}`} value={url} size={230} level="H" fgColor="#000000" />
                  </div>
                  
                  <button
                    onClick={() => handleDownloadCard(table)}
                    className="print:hidden mt-3 bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-[#d4af37] shadow hover:bg-gray-800"
                  >
                    <Download size={14} /> Download Card PNG
                  </button>
                </div>

                {/* Bottom: Visual Steps & Wi-Fi */}
                <div className="w-full flex flex-col items-center z-10 text-center">
                  <div className="w-full space-y-1.5 mb-3 text-left">
                    <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-gray-200 shadow-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#d4af37]/20 text-[#b08d29] font-black flex items-center justify-center text-xs border border-[#d4af37]/40 flex-shrink-0">1</span>
                      <span className="font-bold text-xs text-gray-800">Open Camera & Scan QR</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-gray-200 shadow-sm">
                      <span className="w-6 h-6 rounded-lg bg-[#d4af37]/20 text-[#b08d29] font-black flex items-center justify-center text-xs border border-[#d4af37]/40 flex-shrink-0">2</span>
                      <span className="font-bold text-xs text-gray-800">Browse Menu & Order</span>
                    </div>
                  </div>

                  <div className="bg-black text-white p-3 rounded-2xl border-2 border-[#d4af37] w-full text-center shadow-lg">
                    <div className="flex justify-around items-center">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">📶 Wi-Fi</span>
                        <span className="font-black text-base text-[#d4af37] tracking-wide">Best Khmer</span>
                      </div>
                      <div className="w-[1px] h-7 bg-gray-700"></div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">🔑 Password</span>
                        <span className="font-black text-base text-white font-mono tracking-wider">Bkr@0168</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Best Khmer Restaurant</p>
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
                <p className="text-xs font-bold text-gray-500 mt-1">({Math.round((analytics.totalRevenue || 0) * 4000).toLocaleString()} ៛)</p>
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
                <p className="text-xs font-bold text-gray-500 mt-1">
                  ({analytics.totalOrders > 0 ? Math.round(((analytics.totalRevenue / analytics.totalOrders) * 4000)).toLocaleString() : '0'} ៛)
                </p>
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
                        <td className="py-3 px-4 font-bold text-[#d4af37] text-right">
                          ${order.totalPrice.toFixed(2)} <span className="text-xs text-gray-400 font-normal">({Math.round(order.totalPrice * 4000).toLocaleString()} ៛)</span>
                        </td>
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

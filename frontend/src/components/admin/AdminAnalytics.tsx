import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';

interface AdminAnalyticsProps {
  analytics: any;
}

export default function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      downloadLink.download = `Table-${tableNum}-Card.png`;
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

  if (showPreview) {
    return (
      <div className="bg-white min-h-screen font-sans p-8 print:p-0">
        <style>
          {`
            @media print {
              @page { margin: 0.5cm; size: auto; }
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
          <div className="flex gap-3">
            <button
              onClick={handleDownloadAllCards}
              disabled={isDownloading}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg disabled:opacity-50"
            >
              <Download size={20} />
              {isDownloading ? 'Downloading All...' : 'Download All Cards (PNG)'}
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
            return (
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
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.06] mix-blend-multiply">
                  <img src="/logo.png" alt="Watermark" className="w-[70%] h-[70%] object-contain grayscale" />
                </div>

                {/* Accents */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#d4af37] to-transparent opacity-20 rounded-bl-full z-0" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#d4af37] to-transparent opacity-20 rounded-tr-full z-0" />

                {/* Left Side: Instructions */}
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

                {/* Right Side: QR Code */}
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
            )
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
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <p className="text-gray-400 mb-2 font-bold tracking-wider uppercase text-sm">Total Revenue</p>
                <p className="text-6xl font-bold text-[#d4af37]">${(analytics.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <p className="text-gray-400 mb-2 font-bold tracking-wider uppercase text-sm">Total Orders</p>
                <p className="text-6xl font-bold text-white">{analytics.totalOrders}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales By Day Chart */}
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg h-96 flex flex-col">
                <h3 className="text-xl font-bold mb-6 text-white">Sales Over Time (Last 7 Days)</h3>
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

              {/* Top Items Leaderboard */}
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

            <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 shadow-lg mt-8">
              <h3 className="text-2xl font-bold mb-2 text-white">Print Table QR Codes</h3>
              <p className="text-gray-400 mb-6">Need new QR codes for your tables? Click below to preview and print a high-quality sheet of codes for all 12 tables.</p>
              <button
                onClick={() => setShowPreview(true)}
                className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105"
              >
                <Printer size={20} />
                Preview & Print QR Codes
              </button>
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

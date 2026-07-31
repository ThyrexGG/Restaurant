import React, { useState, useMemo } from 'react';
import { Printer, Download, Layout, Lock, ChevronDown, ChevronUp, Clock, Utensils, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { printOrderReceipt } from '../../utils/printer';

interface AdminAnalyticsProps {
  analytics: any;
  backendUrl?: string;
  setAnalytics?: (data: any) => void;
}

export default function AdminAnalytics({ analytics, backendUrl, setAnalytics }: AdminAnalyticsProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  const ordersGroupedByDay = useMemo(() => {
    if (!analytics || !analytics.recentOrders) return {};
    
    const groups: Record<string, any[]> = {};
    analytics.recentOrders.forEach((order: any) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(order);
    });
    return groups;
  }, [analytics]);

  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    return Object.keys(ordersGroupedByDay);
  }, [ordersGroupedByDay]);

  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedHistoryDate) {
      setSelectedHistoryDate(availableDates[0]);
    }
  }, [availableDates, selectedHistoryDate]);

  const getOrderItemsList = (order: any) => {
    if (order.items && order.items.length > 0) {
      return order.items.map((i: any) => ({
        name: i.menuItem?.name || i.name || 'Unknown',
        quantity: i.quantity || 1,
        price: i.priceAtTime || i.price || 0,
        notes: i.notes || ''
      }));
    }
    
    if (order.notes) {
      try {
        const parsed = JSON.parse(order.notes);
        if (Array.isArray(parsed)) {
          return parsed.map((i: any) => ({
            name: i.name || 'Unknown',
            quantity: i.quantity || 1,
            price: i.price || 0,
            notes: i.notes || ''
          }));
        }
      } catch (e) {
        // Not JSON notes
      }
    }
    return [];
  };

  const handleReprint = (order: any) => {
    const items = getOrderItemsList(order);
    const formattedOrder = {
      id: order.id,
      table: order.table || 'N/A',
      type: order.type || order.diningType || 'DINE_IN',
      items: items,
      total: order.totalPrice || order.total || 0,
      timestamp: order.createdAt
    };
    printOrderReceipt(formattedOrder);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const passcode = window.prompt('Enter Admin Passcode to delete this order:');
    if (!passcode) return;
    if (passcode !== 'Bkr@0168') {
      alert('Unauthorized: Invalid passcode.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) return;

    try {
      const apiHost = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${apiHost}/api/analytics/order/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Order deleted successfully!');
        window.location.reload();
      } else {
        alert('Failed to delete order.');
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order.');
    }
  };

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
    const passcode = window.prompt('Enter Admin Passcode to unlock clearing history:');
    if (!passcode) return;
    if (passcode !== 'Bkr@0168') {
      alert('Unauthorized: Invalid passcode.');
      return;
    }

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
            {/* Top Cards: Loyverse Financial Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Gross sales */}
              <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider block mb-2">Gross sales</span>
                <span className="text-2xl font-black text-white block">${analytics.totalRevenue?.toFixed(2) || '0.00'}</span>
                <span className="text-[10px] text-gray-500 font-bold block mt-1">Today: ${(analytics.todayRevenue || 0).toFixed(2)}</span>
              </div>
              
              {/* Refunds */}
              <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider block mb-2">Refunds</span>
                <span className="text-2xl font-black text-gray-600 block">$0.00</span>
                <span className="text-[10px] text-gray-600 font-bold block mt-1">$0.00 (0%)</span>
              </div>

              {/* Discounts */}
              <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider block mb-2">Discounts</span>
                <span className="text-2xl font-black text-gray-600 block">$0.00</span>
                <span className="text-[10px] text-gray-600 font-bold block mt-1">$0.00 (0%)</span>
              </div>

              {/* Net sales */}
              <div className="bg-gray-900/80 p-5 rounded-2xl border border-[#54b948]/25 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#54b948]" />
                <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider block mb-2 pl-1">Net sales</span>
                <span className="text-2xl font-black text-white block pl-1">${analytics.totalRevenue?.toFixed(2) || '0.00'}</span>
                <span className="text-[10px] text-gray-500 font-bold block mt-1 pl-1">Today: ${(analytics.todayRevenue || 0).toFixed(2)}</span>
              </div>

              {/* Gross profit */}
              <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <span className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider block mb-2">Gross profit</span>
                <span className="text-2xl font-black text-white block">${analytics.totalRevenue?.toFixed(2) || '0.00'}</span>
                <span className="text-[10px] text-gray-500 font-bold block mt-1">Today: ${(analytics.todayRevenue || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/60 p-5 sm:p-6 rounded-3xl border border-gray-800 shadow-lg h-[320px] sm:h-96 flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white font-['Playfair_Display']">Gross sales (Last 7 Days)</h3>
                <div className="flex-1 w-full h-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.salesChart}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#54b948" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#54b948" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#54b948' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#54b948" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        dot={{ fill: '#54b948', r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-900/60 p-5 sm:p-6 rounded-3xl border border-gray-800 shadow-lg h-[320px] sm:h-96 flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white font-['Playfair_Display']">Top Selling Items</h3>
                <div className="flex-1 w-full h-full overflow-y-auto pr-1 space-y-4">
                  {analytics.topItems && analytics.topItems.length > 0 ? (
                    analytics.topItems.map((item: any, idx: number) => {
                      const maxQty = analytics.topItems[0]?.quantity || 1;
                      const pct = Math.max(8, (item.quantity / maxQty) * 100);
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <div className="flex items-center gap-2 truncate max-w-[70%]">
                              <span className="w-5 h-5 rounded-md bg-gray-800 text-gray-400 font-extrabold flex items-center justify-center text-[10px] flex-shrink-0">
                                #{idx + 1}
                              </span>
                              <span className="text-gray-200 truncate">{item.name}</span>
                            </div>
                            <span className="text-[#54b948] font-black whitespace-nowrap">{item.quantity} sold</span>
                          </div>
                          <div className="w-full bg-gray-950/80 h-3 rounded-full overflow-hidden border border-gray-850 shadow-inner relative">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-[#54b948] rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(84,185,72,0.4)]" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                      No sales data available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Breakdown by Date */}
            {analytics.dailyBreakdown && analytics.dailyBreakdown.length > 0 && (
              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center justify-between">
                  <span>Daily Sales Records (Past Days Preserved)</span>
                  <span className="text-xs text-gray-400 font-normal">New day starts fresh record automatically</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Customers</th>
                        <th className="py-3 px-4 text-center">Orders</th>
                        <th className="py-3 px-4 text-right text-[#54b948]">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dailyBreakdown.map((row: any, idx: number) => {
                        const revStr = `$${row.revenue.toFixed(2)}`;
                        const rielStr = `(${(row.revenue * 4000).toLocaleString()} ៛)`;
                        return (
                          <tr key={idx} className="border-b border-gray-850 hover:bg-gray-800/20 text-xs">
                            <td className="py-3.5 px-4 font-bold text-gray-200">{row.date}</td>
                            <td className="py-3.5 px-4 text-center text-gray-300 font-bold">
                              {row.ordersCount} <span className="text-[10px] text-gray-500 font-normal ml-0.5">receipt(s)</span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-gray-300 font-bold">
                              {row.itemsCount || row.ordersCount} <span className="text-[10px] text-gray-500 font-normal ml-0.5">dish(es)</span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-[#54b948] font-black">
                              {revStr} <span className="block text-[9px] text-emerald-600/80 font-semibold mt-0.5">{rielStr}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Orders List grouped and selectable by day */}
            <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Playfair_Display']">Order History</h3>
                  <p className="text-xs text-gray-400 mt-1">Select a date to view orders. Click any order row to inspect details.</p>
                </div>
                {availableDates.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <select
                      value={selectedHistoryDate}
                      onChange={(e) => {
                        setSelectedHistoryDate(e.target.value);
                        setSelectedOrderId(null);
                      }}
                      className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 text-[#d4af37] font-bold py-2.5 px-4 rounded-xl text-xs outline-none transition-all cursor-pointer appearance-none pr-10"
                    >
                      {availableDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {availableDates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm font-bold">No Order History Found</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] hide-scrollbar border border-gray-800 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-950/40">
                        <th className="py-3 px-5">Time</th>
                        <th className="py-3 px-5">Order ID</th>
                        <th className="py-3 px-5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ordersGroupedByDay[selectedHistoryDate] || []).map((order: any) => {
                        const isExpanded = selectedOrderId === order.id;
                        const items = getOrderItemsList(order);
                        return (
                          <React.Fragment key={order.id}>
                            <tr 
                              onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}
                              className={`border-b border-gray-850 hover:bg-gray-800/20 text-xs transition-colors cursor-pointer ${isExpanded ? 'bg-gray-800/10' : ''}`}
                            >
                              <td className="py-3.5 px-5 whitespace-nowrap text-gray-300 font-bold flex items-center gap-2">
                                {isExpanded ? <ChevronUp size={12} className="text-[#d4af37]" /> : <ChevronDown size={12} className="text-gray-500" />}
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                              </td>
                              <td className="py-3.5 px-5 text-[10px] font-mono text-gray-500 select-all" title={order.id}>
                                {order.id.slice(-8)} (expand)
                              </td>
                              <td className="py-3.5 px-5 font-black text-[#d4af37] text-right whitespace-nowrap">
                                ${order.totalPrice.toFixed(2)} <span className="text-[10px] text-gray-400 font-normal ml-1">({Math.round(order.totalPrice * 4000).toLocaleString()} ៛)</span>
                              </td>
                            </tr>
                            
                            {isExpanded && (
                              <tr className="bg-black/40 border-b border-gray-850">
                                <td colSpan={3} className="py-4 px-5">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    {/* Left Details */}
                                    <div className="space-y-2 border-r border-gray-850/80 pr-4">
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={12} />
                                        <span>Ordered: {new Date(order.createdAt).toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <Utensils size={12} />
                                        <span>Type: <strong className="text-gray-200">{order.diningType || order.type || 'DINE_IN'}</strong> {order.table ? `(Table ${order.table})` : ''}</span>
                                      </div>
                                      <div className="text-[9px] text-gray-500 font-mono">
                                        Full ID: {order.id}
                                      </div>
                                      <div className="pt-2 flex flex-col sm:flex-row gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReprint(order);
                                          }}
                                          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-700 text-[10px] w-full sm:w-auto"
                                        >
                                          <Printer size={12} /> Reprint Receipt Ticket
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteOrder(order.id);
                                          }}
                                          className="bg-red-950/40 hover:bg-red-900/60 text-red-400 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-900/40 text-[10px] w-full sm:w-auto"
                                        >
                                          <Trash2 size={12} /> Delete Order
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Right Items */}
                                    <div className="space-y-2">
                                      <span className="font-bold text-gray-400 block mb-1">Ordered Items ({items.length}):</span>
                                      <div className="bg-black/50 p-3 rounded-xl space-y-2 border border-gray-850/80 max-h-[150px] overflow-y-auto">
                                        {items.length === 0 ? (
                                          <span className="text-gray-500 italic block">No item details saved.</span>
                                        ) : (
                                          items.map((it: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-start text-[11px] border-b border-gray-800/50 last:border-0 pb-1.5 last:pb-0">
                                              <div>
                                                <span className="font-extrabold text-blue-400 mr-1.5">{it.quantity}x</span>
                                                <span className="font-bold text-gray-200">{it.name}</span>
                                                {it.notes && (
                                                  <span className="block text-[10px] text-yellow-500/80 italic ml-5">Note: {it.notes}</span>
                                                )}
                                              </div>
                                              <span className="font-bold text-gray-400">${(it.price * it.quantity).toFixed(2)}</span>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
                  className="bg-red-500/10 text-red-400 border border-red-500/30 font-bold px-8 py-4 rounded-xl hover:bg-red-500/20 transition-colors shadow-lg flex items-center justify-center gap-3 hover:scale-105"
                >
                  <Lock size={20} className="text-red-400" />
                  Clear All Order History (Passcode Locked)
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

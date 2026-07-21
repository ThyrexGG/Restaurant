import React from 'react';
import { Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';

interface AdminAnalyticsProps {
  analytics: any;
}

export default function AdminAnalytics({ analytics }: AdminAnalyticsProps) {
  return (
    <>
      <div className="max-w-7xl mx-auto pb-12">
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
              <p className="text-gray-400 mb-6">Need new QR codes for your tables? Click below to print a high-quality sheet of codes for all 12 tables.</p>
              <button 
                onClick={() => window.print()} 
                className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105"
              >
                <Printer size={20} />
                Print All QR Codes
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY VIEW: QR CODES */}
      <div className="hidden print:block bg-white text-black min-h-screen">
        <h1 className="text-4xl font-bold text-center py-8 border-b-2 border-black mb-8 font-['Playfair_Display']">Scan to Order</h1>
        <div className="grid grid-cols-3 gap-8 px-8">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(table => {
            const url = `${window.location.origin}/table/${table}`;
            return (
              <div key={table} className="border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center rounded-xl break-inside-avoid">
                <h2 className="text-3xl font-bold mb-6">Table {table}</h2>
                <QRCodeSVG value={url} size={180} level="H" />
                <p className="text-xs text-gray-500 mt-6 font-mono text-center break-all">{url}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
}

import React from 'react';
import { History, Grid2X2, CheckCircle, Printer } from 'lucide-react';
import { printOrderReceipt } from '../../utils/printer';

interface AdminLiveOrdersProps {
  kitchenOrders: any[];
  activeTables: Record<string, { orders: any[], total: number }>;
  updateStatus: (orderId: string, status: string) => void;
}

export default function AdminLiveOrders({ kitchenOrders, activeTables, updateStatus }: AdminLiveOrdersProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 h-full min-h-[80vh]">
      
      {/* LEFT SIDE: LIVE ORDER FEED */}
      <div className="flex flex-col border border-gray-800 rounded-3xl bg-gray-900/30 backdrop-blur-md overflow-hidden shadow-2xl h-[80vh] xl:h-auto">
        <div className="bg-gray-900/80 p-5 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold font-['Playfair_Display'] text-white flex items-center gap-3">
              <History className="text-blue-400" />
              Live Order Feed
            </h3>
            <p className="text-sm text-gray-400 mt-1">Recent orders sent to the printer. No action required.</p>
          </div>
          <div className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full font-bold border border-blue-500/50">
            {kitchenOrders.length} Recent
          </div>
        </div>

        <div className="p-4 lg:p-6 overflow-y-auto flex-1">
          {kitchenOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
              <CheckCircle size={48} className="mb-4 opacity-30" />
              <p className="text-xl font-bold">No new orders</p>
              <p className="text-sm">Waiting for customers to order...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
              {kitchenOrders.map((order, idx) => (
                <div key={order.id || idx} className="p-5 bg-gray-900/80 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[#d4af37] font-bold text-2xl">Table {order.table}</h3>
                      <span className="text-xs px-3 py-1 rounded font-bold border bg-gray-800 text-gray-400 border-gray-700">
                        #{order.dailyOrderNumber || (order.id ? order.id.toString().slice(-4) : 'NEW')}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="text-sm border-b border-gray-800/50 last:border-0 pb-2 last:pb-0">
                          <p className="font-bold text-gray-200"><span className="text-blue-400 mr-2">{item.quantity}x</span> {item.name}</p>
                          {item.notes && <p className="text-yellow-500/80 text-xs italic ml-6 mt-1">Note: {item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-800">
                    <button 
                      onClick={() => printOrderReceipt(order)} 
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-700"
                    >
                      <Printer size={16} /> Reprint Ticket
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'READY')} 
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-blue-500/30"
                      title="Clear from this feed"
                    >
                      <CheckCircle size={16} /> Mark as Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: TABLE CHECKOUT HUB */}
      <div className="flex flex-col border border-gray-800 rounded-3xl bg-gray-900/30 backdrop-blur-md overflow-hidden shadow-2xl h-[80vh] xl:h-auto">
        <div className="bg-gray-900/80 p-5 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold font-['Playfair_Display'] text-white flex items-center gap-3">
              <Grid2X2 className="text-green-400" />
              Table Checkout Hub
            </h3>
            <p className="text-sm text-gray-400 mt-1">Occupied tables. Mark as Paid when customers checkout.</p>
          </div>
          <div className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full font-bold border border-green-500/50">
            {Object.keys(activeTables).length} Occupied
          </div>
        </div>

        <div className="p-4 lg:p-6 overflow-y-auto flex-1">
          {Object.keys(activeTables).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
              <Grid2X2 size={48} className="mb-4 opacity-30" />
              <p className="text-xl font-bold">No Active Tables</p>
              <p className="text-sm">The restaurant is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {Object.keys(activeTables).map((tableNum) => {
                const tableData = activeTables[tableNum];
                return (
                  <div key={tableNum} className="bg-gray-900/80 p-5 lg:p-6 rounded-2xl border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-4 py-1 rounded-bl-lg shadow-lg">
                      Active Bill
                    </div>
                    
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-3xl font-bold text-white">Table {tableNum}</h3>
                      <span className="font-bold text-green-400 text-2xl">${tableData.total.toFixed(2)}</span>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-gray-400 mb-3 font-bold">{tableData.orders.length} Active Order(s)</p>
                      <div className="space-y-2 mb-6 flex-1">
                        {tableData.orders.map((o: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm bg-black/50 p-3 rounded-lg text-gray-300 border border-gray-800">
                            <span>Order #{o.id.toString().slice(-4)} <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${o.status === 'READY' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{o.status}</span></span>
                            <span className="font-bold">${o.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-auto flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            const combinedOrder = {
                              id: `BILL-${Date.now().toString().slice(-4)}`,
                              table: tableNum,
                              type: 'TABLE BILL',
                              total: tableData.total,
                              items: tableData.orders.flatMap((o: any) => o.items)
                            };
                            printOrderReceipt(combinedOrder);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2"
                        >
                          <Printer size={16} /> Print Bill
                        </button>

                        <button 
                          onClick={() => {
                            if (window.confirm(`Mark Table ${tableNum} as Paid? Total: $${tableData.total.toFixed(2)}`)) {
                              // Print combined receipt
                              const combinedOrder = {
                                id: `CHECKOUT-${Date.now().toString().slice(-4)}`,
                                table: tableNum,
                                type: 'TABLE CHECKOUT',
                                total: tableData.total,
                                items: tableData.orders.flatMap((o: any) => o.items)
                              };
                              printOrderReceipt(combinedOrder);
                              
                              tableData.orders.forEach((o: any) => updateStatus(o.id, 'PAID'));
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-[0_4px_20px_rgba(22,163,74,0.3)] hover:shadow-[0_4px_25px_rgba(22,163,74,0.5)] hover:scale-[1.02]"
                        >
                          Checkout & Clear Table
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Plus, Edit2, Check, X, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Activity } from 'lucide-react';

// Dữ liệu mẫu ban đầu (Tháng 7 và Tháng 8)
const initialData = [
  { id: '1', month: '2023-07', trade: 5000, btcSpot: 12000, copy: 3000, shares: 8000, xaubit: 4000, cash: 10000 },
  { id: '2', month: '2023-08', trade: 5200, btcSpot: 11500, copy: 3300, shares: 8500, xaubit: 4100, cash: 9000 },
].map(item => ({
  ...item,
  total: item.trade + item.btcSpot + item.copy + item.shares + item.xaubit + item.cash
}));

const CATEGORIES = [
  { key: 'trade', label: 'Trade', color: '#3b82f6' },      // Blue
  { key: 'btcSpot', label: 'BTC Spot', color: '#f59e0b' }, // Amber
  { key: 'copy', label: 'Copy', color: '#10b981' },        // Emerald
  { key: 'shares', label: 'Shares', color: '#8b5cf6' },    // Violet
  { key: 'xaubit', label: 'XAUBIT', color: '#ef4444' },    // Red
  { key: 'cash', label: 'Cash', color: '#64748b' }         // Slate
];

export default function App() {
  const [data, setData] = useState(initialData);
  
  // State cho form thêm tháng mới
  const [newEntry, setNewEntry] = useState({
    month: '', trade: '', btcSpot: '', copy: '', shares: '', xaubit: '', cash: ''
  });

  // State cho tính năng chỉnh sửa trực tiếp (Inline Editing)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Tính toán dữ liệu phân tích biến động (Tháng hiện tại vs Tháng trước)
  const performanceAnalysis = useMemo(() => {
    if (data.length < 2) return null;
    
    // Đảm bảo dữ liệu được sắp xếp theo thời gian
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
    const currentMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData[sortedData.length - 2];

    const analysis = CATEGORIES.map(cat => {
      const currentVal = currentMonth[cat.key];
      const prevVal = previousMonth[cat.key];
      const diff = currentVal - prevVal;
      const percentChange = prevVal !== 0 ? (diff / prevVal) * 100 : 0;
      
      return {
        ...cat,
        currentVal,
        prevVal,
        diff,
        percentChange
      };
    });

    const totalDiff = currentMonth.total - previousMonth.total;
    const totalPercentChange = (totalDiff / previousMonth.total) * 100;

    return {
      currentMonth: currentMonth.month,
      previousMonth: previousMonth.month,
      details: analysis,
      totalDiff,
      totalPercentChange
    };
  }, [data]);

  // Dữ liệu cho biểu đồ tròn (Tháng mới nhất)
  const latestData = useMemo(() => {
    if (data.length === 0) return [];
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
    const latest = sortedData[sortedData.length - 1];
    return CATEGORIES.map(cat => ({
      name: cat.label,
      value: latest[cat.key],
      color: cat.color
    })).filter(item => item.value > 0);
  }, [data]);

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  // --- Handlers cho Thêm Mới ---
  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!newEntry.month) return alert('Vui lòng chọn tháng!');

    const trade = Number(newEntry.trade) || 0;
    const btcSpot = Number(newEntry.btcSpot) || 0;
    const copy = Number(newEntry.copy) || 0;
    const shares = Number(newEntry.shares) || 0;
    const xaubit = Number(newEntry.xaubit) || 0;
    const cash = Number(newEntry.cash) || 0;
    const total = trade + btcSpot + copy + shares + xaubit + cash;

    const entry = {
      id: Date.now().toString(),
      month: newEntry.month,
      trade, btcSpot, copy, shares, xaubit, cash, total
    };

    // Kiểm tra xem tháng đã tồn tại chưa
    const existingIndex = data.findIndex(d => d.month === newEntry.month);
    if (existingIndex >= 0) {
      if(window.confirm('Tháng này đã tồn tại. Bạn có muốn ghi đè không?')) {
        const newData = [...data];
        newData[existingIndex] = entry;
        setData(newData);
      }
    } else {
      setData(prev => [...prev, entry].sort((a, b) => a.month.localeCompare(b.month)));
    }

    setNewEntry({ month: '', trade: '', btcSpot: '', copy: '', shares: '', xaubit: '', cash: '' });
  };

  // --- Handlers cho Chỉnh Sửa Trực Tiếp ---
  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    const trade = Number(editForm.trade) || 0;
    const btcSpot = Number(editForm.btcSpot) || 0;
    const copy = Number(editForm.copy) || 0;
    const shares = Number(editForm.shares) || 0;
    const xaubit = Number(editForm.xaubit) || 0;
    const cash = Number(editForm.cash) || 0;
    const total = trade + btcSpot + copy + shares + xaubit + cash;

    const updatedData = data.map(item => 
      item.id === editingId 
        ? { ...editForm, trade, btcSpot, copy, shares, xaubit, cash, total } 
        : item
    );

    // Sắp xếp lại theo tháng đề phòng người dùng đổi tháng
    updatedData.sort((a, b) => a.month.localeCompare(b.month));
    
    setData(updatedData);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-blue-600" /> Theo Dõi Danh Mục Đầu Tư
            </h1>
            <p className="text-slate-500 mt-1">Quản lý và phân tích biến động tài sản hàng tháng</p>
          </div>
          {data.length > 0 && (
            <div className="mt-4 md:mt-0 text-right bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Tổng tài sản hiện tại ({latestData.length > 0 ? data[data.length-1].month : ''})</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(data[data.length - 1]?.total || 0)}
              </p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột trái: Form thêm dữ liệu & Phân tích */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Cập nhật tháng mới */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> Cập Nhật Tháng Mới
              </h2>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Chọn Tháng</label>
                  <input 
                    type="month" 
                    name="month"
                    value={newEntry.month}
                    onChange={handleNewEntryChange}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{cat.label}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input 
                          type="number"
                          name={cat.key}
                          value={newEntry[cat.key]}
                          onChange={handleNewEntryChange}
                          className="w-full pl-7 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4" /> Thêm Dữ Liệu
                </button>
              </form>
            </div>

            {/* Phân Tích Biến Động */}
            {performanceAnalysis && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Phân Tích Biến Động
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  So sánh {performanceAnalysis.currentMonth} với {performanceAnalysis.previousMonth}
                </p>
                
                <div className="space-y-3">
                  {/* Tổng quan */}
                  <div className={`p-3 rounded-lg border ${performanceAnalysis.totalDiff >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">Tổng Danh Mục</span>
                      <span className={`font-bold flex items-center gap-1 ${performanceAnalysis.totalDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {performanceAnalysis.totalDiff >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                        {Math.abs(performanceAnalysis.totalPercentChange).toFixed(2)}%
                      </span>
                    </div>
                    <div className={`text-sm ${performanceAnalysis.totalDiff >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {performanceAnalysis.totalDiff >= 0 ? '+' : ''}{formatCurrency(performanceAnalysis.totalDiff)}
                    </div>
                  </div>

                  {/* Từng danh mục */}
                  <div className="pt-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chi tiết từng mảng</h3>
                    {performanceAnalysis.details.map(item => (
                      <div key={item.key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${item.diff > 0 ? 'text-emerald-600' : item.diff < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                            {item.diff > 0 ? '+' : ''}{formatCurrency(item.diff)}
                          </div>
                          <div className={`text-xs ${item.diff > 0 ? 'text-emerald-500' : item.diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {item.diff > 0 ? '+' : ''}{item.percentChange.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Biểu đồ & Bảng Lịch sử */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Đồ thị trực quan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" /> Đồ Thị Trực Quan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Biểu đồ xu hướng */}
                <div className="h-64">
                  <h3 className="text-sm font-medium text-slate-500 text-center mb-2">Xu Hướng Tổng Tài Sản</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#64748b'}}
                        tickFormatter={(value) => `$${value/1000}k`}
                        width={60}
                      />
                      <RechartsTooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="total" name="Tổng tài sản" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Biểu đồ phân bổ */}
                <div className="h-64">
                  <h3 className="text-sm font-medium text-slate-500 text-center mb-2">Cơ Cấu Hiện Tại ({latestData.length > 0 ? data[data.length-1].month : ''})</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={latestData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {latestData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bảng Dữ Liệu Chi Tiết có thể chỉnh sửa */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-slate-500" /> Lịch Sử Dữ Liệu
                </h2>
                <p className="text-xs text-slate-400 italic">* Nhấn biểu tượng bút chì để sửa số liệu</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tháng</th>
                      {CATEGORIES.map(cat => (
                         <th key={cat.key} className="px-4 py-3 font-medium text-right">{cat.label}</th>
                      ))}
                      <th className="px-4 py-3 font-bold text-right text-slate-700">Tổng</th>
                      <th className="px-4 py-3 font-medium text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => {
                      const isEditing = editingId === row.id;

                      return (
                        <tr key={row.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${isEditing ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                            {isEditing ? (
                              <input 
                                type="month" 
                                name="month" 
                                value={editForm.month} 
                                onChange={handleEditChange}
                                className="w-32 px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            ) : (
                              row.month
                            )}
                          </td>
                          
                          {CATEGORIES.map(cat => (
                            <td key={cat.key} className="px-4 py-3 text-right tabular-nums text-slate-600">
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  name={cat.key} 
                                  value={editForm[cat.key]} 
                                  onChange={handleEditChange}
                                  className="w-24 px-2 py-1 border rounded text-right focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                              ) : (
                                formatCurrency(row[cat.key])
                              )}
                            </td>
                          ))}
                          
                          <td className="px-4 py-3 text-right font-bold text-blue-700 tabular-nums bg-blue-50/30">
                            {formatCurrency(row.total)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Lưu">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={cancelEditing} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hủy">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => startEditing(row)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {data.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                          Chưa có dữ liệu. Vui lòng cập nhật tháng mới.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
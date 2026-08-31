import React, { useState } from 'react';
import { Drug } from '../types';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Plus, 
  TrendingUp,
  Layers,
  ArrowDownRight
} from 'lucide-react';

interface InventoryManagerProps {
  drugs: Drug[];
  onUpdateStock: (drugId: string, newStock: number) => void;
  onUpdatePrice: (drugId: string, newPrice: number) => void;
}

interface CartItem {
  drug: Drug;
  quantity: number;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  drugs,
  onUpdateStock,
  onUpdatePrice,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastSaleSuccess, setLastSaleSuccess] = useState(false);

  // Statistics
  const totalUnits = drugs.reduce((acc, d) => acc + d.stockCount, 0);
  const totalValuationYER = drugs.reduce((acc, d) => acc + d.stockCount * d.priceYER, 0);
  const lowStockDrugs = drugs.filter((d) => d.stockCount <= d.minStockAlert && d.stockCount > 0);
  const outOfStockDrugs = drugs.filter((d) => d.stockCount === 0);

  // Filtered List
  const filteredDrugs = drugs.filter((d) => {
    if (filterMode === 'low' && (d.stockCount > d.minStockAlert || d.stockCount === 0)) return false;
    if (filterMode === 'out' && d.stockCount > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.tradeNameAr.includes(q) ||
        d.tradeNameEn.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Cart operations
  const handleAddToCart = (drug: Drug) => {
    if (drug.stockCount <= 0) return;
    const existing = cart.find((item) => item.drug.id === drug.id);
    if (existing) {
      if (existing.quantity >= drug.stockCount) return;
      setCart(cart.map((i) => (i.drug.id === drug.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { drug, quantity: 1 }]);
    }
  };

  const handleUpdateCartQty = (drugId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.drug.id === drugId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutSale = () => {
    if (cart.length === 0) return;
    // Deduct stock for all items
    cart.forEach((item) => {
      onUpdateStock(item.drug.id, Math.max(0, item.drug.stockCount - item.quantity));
    });
    setCart([]);
    setLastSaleSuccess(true);
    setTimeout(() => setLastSaleSuccess(false), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.drug.priceYER * item.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                إدارة المخزون والأسعار ونقطة البيع السريعة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة نواقص الأدوية، تحديث الكميات والأسعار، وإصدار فواتير البيع الفورية
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block">إجمالي العبوات بالمخزون</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalUnits.toLocaleString()} <span className="text-xs font-normal text-slate-400">عبوة</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-bold block">القيمة التقديرية للمخزون</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {totalValuationYER.toLocaleString()} <span className="text-xs font-normal text-slate-400">ريال</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-amber-600 font-bold block">أصناف قاربت على النفاد (نواقص)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {lowStockDrugs.length} <span className="text-xs font-normal text-slate-400">صنف</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-rose-600 font-bold block">أصناف منتهية الرصيد تماماً</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {outOfStockDrugs.length} <span className="text-xs font-normal text-slate-400">صنف</span>
            </div>
          </div>
        </div>

        {/* Layout: Main Inventory Table + POS Quick Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Inventory Master Table */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو المادة..."
                  className="w-full pl-2 pr-9 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  الكل ({drugs.length})
                </button>
                <button
                  onClick={() => setFilterMode('low')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'low'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  النواقص ({lowStockDrugs.length})
                </button>
                <button
                  onClick={() => setFilterMode('out')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterMode === 'out'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  منتهي ({outOfStockDrugs.length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">اسم الدواء والشركة</th>
                    <th className="p-3">السعر (YER)</th>
                    <th className="p-3">الرصيد بالمخزن</th>
                    <th className="p-3 text-center">نقطة البيع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredDrugs.map((drug) => (
                    <tr key={drug.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {drug.tradeNameAr} <span className="text-[11px] text-slate-400 font-normal">({drug.tradeNameEn})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {drug.manufacturer.split('(')[0]} • {drug.strength}
                        </div>
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          value={drug.priceYER}
                          onChange={(e) => onUpdatePrice(drug.id, Math.max(0, Number(e.target.value)))}
                          className="w-20 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border text-center font-bold text-emerald-600"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateStock(drug.id, Math.max(0, drug.stockCount - 1))}
                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={drug.stockCount}
                            onChange={(e) => onUpdateStock(drug.id, Math.max(0, Number(e.target.value)))}
                            className="w-14 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border text-center font-bold"
                          />
                          <button
                            onClick={() => onUpdateStock(drug.id, drug.stockCount + 1)}
                            className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleAddToCart(drug)}
                          disabled={drug.stockCount <= 0}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 disabled:opacity-40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 mx-auto"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>إضافة للبيع</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* POS Quick Register / Cart */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>سلة البيع السريع (POS)</span>
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {cart.length} أصناف
                </span>
              </div>

              {lastSaleSuccess && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم إتمام البيع بنجاح وتحديث كميات المخزون!</span>
                </div>
              )}

              {/* Cart items list */}
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    السلة فارغة. انقر على زر "إضافة للبيع" في جدول المخزون لإجراء عملية بيع سريعة.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.drug.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.drug.tradeNameAr}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.drug.priceYER.toLocaleString()} YER × {item.quantity}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateCartQty(item.drug.id, -1)}
                          className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-black px-1 text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartQty(item.drug.id, 1)}
                          className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total & Checkout */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-600 dark:text-slate-400">الإجمالي المستحق:</span>
                <span className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                  {cartTotal.toLocaleString()} ريال يمني
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  disabled={cart.length === 0}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                  title="طباعة الفاتورة"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCheckoutSale}
                  disabled={cart.length === 0}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-xs transition-colors"
                >
                  إتمام البيع وخصم المخزون
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

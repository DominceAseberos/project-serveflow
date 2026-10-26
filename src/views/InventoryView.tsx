import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { ContentHeader } from '../components/layout/ContentHeader';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { productRepository } from '../repositories/productRepository';
import { inventoryService } from '../services/inventoryService';
import type { Product, Category, InventoryMovementType } from '../types';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  // Adjust stock modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<InventoryMovementType>('restock');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Add new product modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('CAT-COFFEE');
  const [newProductPrice, setNewProductPrice] = useState('120');
  const [newProductStock, setNewProductStock] = useState('20');
  const [newProductThreshold, setNewProductThreshold] = useState('5');
  const [newProductSku, setNewProductSku] = useState('');

  const loadData = async () => {
    const allProducts = await productRepository.getAll();
    const allCats = await productRepository.getCategories();
    setProducts(allProducts);
    setCategories(allCats);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustQty(10);
    setAdjustType('restock');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const delta = adjustType === 'restock' ? Math.abs(adjustQty) : -Math.abs(adjustQty);
      await inventoryService.adjustStock(selectedProduct.id, delta, adjustType, adjustNotes);
      setIsAdjustModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Adjustment error: ${err.message}`);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productRepository.create({
        name: newProductName.trim(),
        categoryId: newProductCategory,
        price: parseFloat(newProductPrice) || 0,
        stock: parseInt(newProductStock, 10) || 0,
        lowStockThreshold: parseInt(newProductThreshold, 10) || 5,
        sku: newProductSku.trim() || `SF-${Date.now().toString().slice(-4)}`,
        isAvailable: true,
      });

      setIsAddModalOpen(false);
      setNewProductName('');
      await loadData();
    } catch (err: any) {
      alert(`Could not create product: ${err.message}`);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.categoryId === selectedCat;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ContentHeader
        title="Inventory & Stock Management"
        subtitle="Track ingredient stock, log deliveries, and manage product catalog"
        breadcrumbs={[{ label: 'Home' }, { label: 'Inventory', active: true }]}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search items by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCat('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
              selectedCat === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 ${
                selectedCat === c.id ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <Card title="Product Catalog & Current Stock" variant="primary">
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Stock Level</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;
                const isOut = p.stock <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 text-sm block">{p.name}</span>
                      {p.description && <span className="text-[11px] text-slate-400 block line-clamp-1">{p.description}</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{p.sku}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {p.categoryId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">₱{p.price.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-800">{p.stock}</span>
                        <span className="text-[10px] text-slate-400">units</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center w-fit">
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                          Low ({p.stock} left)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenAdjust(p)}
                        className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name}`}
        subtitle={`Current stock: ${selectedProduct?.stock} units`}
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Movement Type</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as InventoryMovementType)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="restock">Restock / Delivery (+)</option>
              <option value="adjustment">Count Adjustment (+/-)</option>
              <option value="waste">Damaged / Expired Waste (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={adjustQty}
              onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
              className="w-full text-sm font-bold bg-white border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
            <input
              type="text"
              placeholder="e.g. Supplier PO-1092, damaged box, morning recount"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Menu Item"
        subtitle="Register new product into offline Dexie database"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Iced Hazelnut Oat Latte"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₱)</label>
              <input
                type="number"
                step="0.01"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Starting Stock</label>
              <input
                type="number"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Low Alert Level</label>
              <input
                type="number"
                value={newProductThreshold}
                onChange={(e) => setNewProductThreshold(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={newProductSku}
                onChange={(e) => setNewProductSku(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

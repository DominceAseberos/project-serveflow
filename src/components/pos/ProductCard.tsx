import React from 'react';
import type { Product } from '../../types';
import { Plus, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isLowStock = product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onAddToCart(product)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between select-none ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
          : 'cursor-pointer border-slate-200/80 hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-b from-white to-slate-50/40'
      }`}
    >
      {/* Category Pill */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200/60">
            {product.categoryId}
          </span>
          {isLowStock && !isOutOfStock && (
            <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
              {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Out of stock
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Footer Price & Add Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-end justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PRICE
          </span>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            ₱{product.price.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center transition-colors shadow-xs"
          title="Add to cart"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

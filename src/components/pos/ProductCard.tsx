import React, { useState } from 'react';
import type { Product } from '../../types';
import { Plus, AlertTriangle, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onPreviewImage?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onPreviewImage,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isLowStock = product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreviewImage) onPreviewImage(product);
  };

  return (
    <div
      onClick={handleAdd}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between select-none shadow-xs hover:shadow-lg ${
        isOutOfStock
          ? 'opacity-55 cursor-not-allowed border-slate-200 bg-slate-50'
          : 'cursor-pointer border-slate-200/90 hover:border-emerald-600 hover:-translate-y-1 active:translate-y-0'
      }`}
    >
      {/* Product Image Banner */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
            <span className="text-3xl font-black mb-1 opacity-40">SF</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {product.categoryId}
            </span>
          </div>
        )}

        {/* Floating Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
            {product.categoryId.replace('CAT-', '')}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-slate-950" />
              {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Image Preview Action Overlay */}
        {product.image && !imgError && onPreviewImage && (
          <button
            type="button"
            onClick={handlePreview}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
            title="Preview Full Image"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer: Price & Touch Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              PRICE
            </span>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              ₱{product.price.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs ${
              justAdded
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white active:scale-95'
            }`}
            title="Add item to current order"
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

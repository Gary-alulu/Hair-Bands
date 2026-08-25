'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, X, Save, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
  slug: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Maya Body Wave', category: 'wigs', basePrice: 18500, stock: 5, status: 'ACTIVE', slug: 'maya-body-wave' },
  { id: 'p2', name: 'Amara Straight', category: 'wigs', basePrice: 15600, stock: 4, status: 'ACTIVE', slug: 'amara-straight' },
  { id: 'p3', name: 'Naomi Deep Wave', category: 'wigs', basePrice: 11200, stock: 2, status: 'ACTIVE', slug: 'naomi-deep-wave' },
  { id: 'p4', name: 'Luxury Clip-In Extensions 20"', category: 'extensions', basePrice: 8400, stock: 0, status: 'OUT_OF_STOCK', slug: 'luxury-clip-in-20' },
  { id: 'p5', name: 'Silk Press Serum 100ml', category: 'haircare', basePrice: 800, stock: 45, status: 'ACTIVE', slug: 'silk-press-serum' },
  { id: 'p6', name: 'Hydrating Edge Control', category: 'haircare', basePrice: 650, stock: 30, status: 'DRAFT', slug: 'hydrating-edge-control' },
];

const CATEGORIES = ['wigs', 'extensions', 'haircare', 'accessories'];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-900/20 border-green-800/30',
  DRAFT: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
  OUT_OF_STOCK: 'text-red-400 bg-red-900/20 border-red-800/30',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'wigs', basePrice: '', stock: '', status: 'ACTIVE' as Product['status']
  });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingProduct(null);
    setForm({ name: '', category: 'wigs', basePrice: '', stock: '', status: 'ACTIVE' });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      basePrice: product.basePrice.toString(),
      stock: product.stock.toString(),
      status: product.status,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    if (editingProduct) {
      setProducts((prev) => prev.map((p) =>
        p.id === editingProduct.id
          ? { ...p, name: form.name, category: form.category, basePrice: Number(form.basePrice), stock: Number(form.stock), status: form.status }
          : p
      ));
    } else {
      const newProduct: Product = {
        id: `p${Date.now()}`,
        name: form.name,
        category: form.category,
        basePrice: Number(form.basePrice),
        stock: Number(form.stock),
        status: form.status,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 text-luxury-cream">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-script text-2xl text-luxury-champagne">catalog</span>
          <h1 className="font-serif text-xl tracking-widest uppercase text-luxury-cream font-light">Product Manager</h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center px-4 py-3 bg-luxury-champagne/10 border border-luxury-champagne/30 text-luxury-champagne hover:bg-luxury-champagne/20 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
        >
          <Plus size={12} className="mr-2" /> Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-luxury-espresso/60 border border-luxury-cream/10 rounded-sm overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-luxury-cream/10">
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Product</th>
              <th className="text-left px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-right px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Price</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Stock</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Status</th>
              <th className="text-center px-4 py-3 text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-luxury-cream/5 hover:bg-luxury-cream/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-luxury-cream">{product.name}</div>
                  <div className="text-luxury-cream/30 text-[8px] mt-0.5 hidden sm:block">{product.slug}</div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-luxury-cream/50 capitalize">{product.category}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-serif font-bold text-luxury-champagne">KES {product.basePrice.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${product.stock === 0 ? 'text-red-400' : product.stock < 5 ? 'text-yellow-400' : 'text-luxury-cream'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[8px] px-2.5 py-1 rounded border font-bold uppercase tracking-wider ${STATUS_BADGE[product.status]}`}>
                    {product.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 text-luxury-cream/40 hover:text-luxury-champagne transition-colors"
                      title="Edit"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="p-1.5 text-luxury-cream/40 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-luxury-espresso border border-luxury-cream/10 rounded-sm p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-base tracking-widest uppercase text-luxury-cream font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-luxury-cream/40 hover:text-luxury-cream transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full bg-luxury-espresso/80 border border-luxury-cream/10 rounded-sm p-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50 placeholder:text-luxury-cream/20"
                    placeholder="e.g. Maya Body Wave 22&quot;"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Category</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full bg-luxury-espresso/80 border border-luxury-cream/10 rounded-sm p-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50 appearance-none capitalize"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c} className="bg-luxury-espresso capitalize">{c}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-cream/30 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Status</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}
                        className="w-full bg-luxury-espresso/80 border border-luxury-cream/10 rounded-sm p-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50 appearance-none"
                      >
                        <option value="ACTIVE" className="bg-luxury-espresso">Active</option>
                        <option value="DRAFT" className="bg-luxury-espresso">Draft</option>
                        <option value="OUT_OF_STOCK" className="bg-luxury-espresso">Out of Stock</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-cream/30 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Base Price (KES)</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      required min="0"
                      className="w-full bg-luxury-espresso/80 border border-luxury-cream/10 rounded-sm p-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50"
                      placeholder="18500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] tracking-widest uppercase text-luxury-cream/40 font-semibold">Stock Qty</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      required min="0"
                      className="w-full bg-luxury-espresso/80 border border-luxury-cream/10 rounded-sm p-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-champagne/50"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-3 border border-luxury-cream/10 text-luxury-cream/50 hover:text-luxury-cream text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-luxury-champagne/10 border border-luxury-champagne/30 text-luxury-champagne hover:bg-luxury-champagne/20 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                  >
                    <Save size={11} className="mr-2" />
                    {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-luxury-espresso border border-red-800/30 rounded-sm p-8 w-full max-w-sm text-center space-y-4"
            >
              <Trash2 size={28} className="text-red-400 mx-auto" />
              <h3 className="font-serif text-sm tracking-widest uppercase text-luxury-cream">Delete Product?</h3>
              <p className="text-[10px] text-luxury-cream/50 tracking-wider">This action cannot be undone.</p>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border border-luxury-cream/10 text-luxury-cream/50 hover:text-luxury-cream text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-900/30 border border-red-800/30 text-red-400 hover:bg-red-900/50 text-[9px] uppercase font-bold tracking-widest rounded-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

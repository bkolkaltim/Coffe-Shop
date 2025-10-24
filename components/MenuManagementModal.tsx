import React, { useState, useEffect } from 'react';
import type { MenuItem, Discount } from '../types';
import { formatCurrency } from '../constants';
import { TrashIcon, PlusIcon } from './Icons';
import MenuItemForm from './MenuItemForm';

interface MenuManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (id: number) => void;
  taxRate: number;
  onUpdateTaxRate: (newRate: number) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  discounts: Discount[];
  onSaveDiscount: (discount: Omit<Discount, 'id'> | Discount) => void;
  onDeleteDiscount: (id: number) => void;
}

const CategoryManager = ({ categories, onAddCategory, onDeleteCategory, menuItems }) => {
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        onAddCategory(newCategory);
        setNewCategory('');
    };

    const isCategoryInUse = (category: string) => menuItems.some(item => item.category === category);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kelola Kategori</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nama kategori baru"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
                <button onClick={handleAdd} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Tambah
                </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide -mr-2">
                {categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                        <span className="text-slate-300">{cat}</span>
                        <button 
                            onClick={() => onDeleteCategory(cat)} 
                            disabled={isCategoryInUse(cat)}
                            className="p-1 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                            title={isCategoryInUse(cat) ? "Kategori sedang digunakan" : "Hapus kategori"}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DiscountManager = ({ discounts, onSaveDiscount, onDeleteDiscount }) => {
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [formState, setFormState] = useState({ name: '', percentage: '' });

    useEffect(() => {
        if (editingDiscount) {
            setFormState({
                name: editingDiscount.name,
                percentage: (editingDiscount.percentage * 100).toString(),
            });
        } else {
            setFormState({ name: '', percentage: '' });
        }
    }, [editingDiscount]);
    
    const handleSave = () => {
        const percentage = parseFloat(formState.percentage);
        if (formState.name.trim() === '' || isNaN(percentage)) {
            alert('Nama dan persentase diskon harus diisi.');
            return;
        }
        
        const payload = {
            name: formState.name.trim(),
            percentage: percentage / 100,
        };

        if (editingDiscount) {
            onSaveDiscount({ ...payload, id: editingDiscount.id });
        } else {
            onSaveDiscount(payload);
        }
        setEditingDiscount(null);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kelola Diskon</h3>
            <div className="bg-slate-700/50 p-3 rounded-lg space-y-3">
                <h4 className="text-md font-semibold text-slate-200">{editingDiscount ? 'Edit Diskon' : 'Tambah Diskon Baru'}</h4>
                <div className="flex gap-2">
                     <input
                        type="text"
                        value={formState.name}
                        onChange={(e) => setFormState(s => ({...s, name: e.target.value}))}
                        placeholder="Nama diskon"
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm"
                    />
                    <input
                        type="number"
                        value={formState.percentage}
                        onChange={(e) => setFormState(s => ({...s, percentage: e.target.value}))}
                        placeholder="%"
                        className="w-20 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {editingDiscount && (
                        <button onClick={() => setEditingDiscount(null)} className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-1 px-3 rounded-md">
                            Batal
                        </button>
                    )}
                    <button onClick={handleSave} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold py-1 px-3 rounded-md">
                        Simpan Diskon
                    </button>
                </div>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide -mr-2">
                {discounts.map(d => (
                    <div key={d.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                        <span className="text-slate-300">{d.name} ({d.percentage * 100}%)</span>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingDiscount(d)} className="text-xs text-slate-400 hover:text-amber-400">Edit</button>
                            <button onClick={() => onDeleteDiscount(d.id)} className="p-1 rounded-full text-slate-500 hover:text-red-400">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MenuManagementModal: React.FC<MenuManagementModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  taxRate,
  onUpdateTaxRate,
  categories,
  onAddCategory,
  onDeleteCategory,
  discounts,
  onSaveDiscount,
  onDeleteDiscount,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'settings'

  if (!isOpen) return null;

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormVisible(true);
    setActiveTab('items');
  };
  
  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormVisible(true);
    setActiveTab('items');
  };

  const handleSave = (item: Omit<MenuItem, 'id'> | MenuItem) => {
    if ('id' in item) {
      onUpdateItem(item);
    } else {
      onAddItem(item);
    }
    setIsFormVisible(false);
    setEditingItem(null);
  };
  
  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingItem(null);
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseFloat(e.target.value);
    if (!isNaN(newPercentage)) {
      onUpdateTaxRate(newPercentage / 100);
    }
  };

  const renderItemsList = () => (
    <>
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-hide -mr-2 mb-4">
          <div className="space-y-2">
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-4" />
                <div className="flex-grow">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-slate-400">{formatCurrency(item.price)}</p>
                </div>
                <div className="text-sm text-slate-300 mr-4">
                  Stok: <span className="font-bold">{item.stock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-amber-400">Edit</button>
                  <button onClick={() => onDeleteItem(item.id)} className="p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-700">
             <button
                onClick={handleAddNew}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Tambah Item Baru
            </button>
        </div>
    </>
  );

  const renderSettings = () => (
     <div className="flex-grow overflow-y-auto pr-2 scrollbar-hide -mr-2 space-y-6">
        <CategoryManager 
            categories={categories} 
            onAddCategory={onAddCategory} 
            onDeleteCategory={onDeleteCategory}
            menuItems={menuItems}
        />
         <DiscountManager
            discounts={discounts}
            onSaveDiscount={onSaveDiscount}
            onDeleteDiscount={onDeleteDiscount}
        />
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Pajak</h3>
          <label htmlFor="taxRate" className="block text-sm font-medium text-slate-300">Tarif Pajak (%)</label>
          <input
            type="number"
            id="taxRate"
            value={(taxRate * 100).toFixed(0)}
            onChange={handleTaxRateChange}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          />
       </div>
    </div>
  );


  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl m-4 flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-white">Kelola Menu & Pengaturan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        {isFormVisible ? (
          <MenuItemForm item={editingItem} onSave={handleSave} onCancel={handleCancel} categories={categories} />
        ) : (
          <>
            <div className="mb-4 border-b border-slate-700">
                <nav className="flex -mb-px space-x-6">
                    <button 
                        onClick={() => setActiveTab('items')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
                    >
                        Item Menu
                    </button>
                    <button 
                         onClick={() => setActiveTab('settings')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
                    >
                        Pengaturan
                    </button>
                </nav>
            </div>
            <div className="flex flex-col flex-grow overflow-hidden">
                {activeTab === 'items' ? renderItemsList() : renderSettings()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
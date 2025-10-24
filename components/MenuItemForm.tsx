// FIX: Removed invalid CDATA wrapper.
import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../types';

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSave: (item: Omit<MenuItem, 'id'> | MenuItem) => void;
  onCancel: () => void;
  categories: string[];
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, onSave, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: categories[0] || '',
    imageUrl: '',
    stock: '100',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        imageUrl: item.imageUrl,
        stock: item.stock.toString(),
      });
      setImagePreview(item.imageUrl);
    } else {
      setFormData({ name: '', price: '', category: categories[0] || '', imageUrl: '', stock: '100' });
      setImagePreview(null);
    }
  }, [item, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({...prev, imageUrl: base64String}));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        alert("Please select an image.");
        return;
    }
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
    };
    if (item) {
      onSave({ ...payload, id: item.id });
    } else {
      onSave(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
        />
      </div>
       <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-300">Price (IDR)</label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-slate-300">Stok</label>
            <input
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            />
          </div>
       </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
        <select
          name="category"
          id="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Gambar</label>
        <div className="mt-2 flex items-center gap-x-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md bg-slate-700" />
          ) : (
            <div className="h-16 w-16 bg-slate-700 rounded-md flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25-2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <label htmlFor="imageUpload" className="cursor-pointer rounded-md bg-slate-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 transition-colors">
            <span>{imagePreview ? 'Ubah' : 'Pilih file'}</span>
            <input id="imageUpload" name="imageUpload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleImageChange} />
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
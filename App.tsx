import React, { useState, useEffect, useCallback } from 'react';
import { CashierScreen } from './screens/CashierScreen';
import { KitchenDisplayScreen } from './screens/KitchenDisplayScreen';
import { LoginScreen } from './components/LoginScreen';
import { TransactionLogScreen } from './screens/TransactionLogScreen';
import { CashierManagementScreen } from './screens/CashierManagementScreen';
import { ManagerDashboardScreen } from './screens/ManagerDashboardScreen';
import { MenuManagementModal } from './components/MenuManagementModal';
import { CustomerOrderingScreen } from './screens/CustomerOrderingScreen';
import * as db from './services/db';
import type { User, MenuItem, Discount } from './types';
import { DEFAULT_TAX_RATE, DEFAULT_CATEGORIES, DEFAULT_DISCOUNTS } from './constants';
import { CoffeeIcon } from './components/Icons';

type Screen = 'login' | 'cashier' | 'dashboard' | 'kitchen' | 'transactions' | 'manageCashiers' | 'customerOrdering';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse currentUser from sessionStorage", e);
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const storedUser = sessionStorage.getItem('currentUser');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        if (user.role === 'manager') return 'dashboard';
        if (user.role === 'cashier') return 'cashier';
        if (user.role === 'kitchen') return 'kitchen';
        if (user.role === 'customer') return 'customerOrdering';
      }
    } catch (e) { /* fallback */ }
    return 'login';
  });

  const navigate = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);
  
  useEffect(() => {
    if (!currentUser) {
        if (currentScreen !== 'login') navigate('login');
        return;
    }

    // User is logged in, handle role-based permissions and redirects
    const staffScreens: Screen[] = ['dashboard', 'manageCashiers', 'transactions', 'kitchen', 'cashier'];
    const customerOnlyScreens: Screen[] = ['customerOrdering'];

    // Redirect customers from unauthorized staff pages
    if (currentUser.role === 'customer' && staffScreens.includes(currentScreen)) {
        navigate('customerOrdering');
    } 
    // Redirect staff from customer page
    else if (['manager', 'cashier', 'kitchen'].includes(currentUser.role) && customerOnlyScreens.includes(currentScreen)) {
        if (currentUser.role === 'manager') navigate('dashboard');
        if (currentUser.role === 'cashier') navigate('cashier');
        if (currentUser.role === 'kitchen') navigate('kitchen');
    }

    // If a logged-in user somehow lands on the login screen, redirect them to their home screen
    if (currentScreen === 'login') {
        if (currentUser.role === 'manager') navigate('dashboard');
        else if (currentUser.role === 'cashier') navigate('cashier');
        else if (currentUser.role === 'kitchen') navigate('kitchen');
        else if (currentUser.role === 'customer') navigate('customerOrdering');
    }
  }, [currentScreen, currentUser, navigate]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuManagementOpen, setIsMenuManagementOpen] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(() => parseFloat(localStorage.getItem('taxRate') || String(DEFAULT_TAX_RATE)));
  const [categories, setCategories] = useState<string[]>(() => JSON.parse(localStorage.getItem('categories') || JSON.stringify(DEFAULT_CATEGORIES)));
  const [discounts, setDiscounts] = useState<Discount[]>(() => JSON.parse(localStorage.getItem('discounts') || JSON.stringify(DEFAULT_DISCOUNTS)));
  
  const fetchAllMenuRelatedData = useCallback(async () => {
    try {
      const items = await db.getAllMenuItems();
      setMenuItems(items);
      setCategories(JSON.parse(localStorage.getItem('categories') || JSON.stringify(DEFAULT_CATEGORIES)));
      setDiscounts(JSON.parse(localStorage.getItem('discounts') || JSON.stringify(DEFAULT_DISCOUNTS)));
      setTaxRate(parseFloat(localStorage.getItem('taxRate') || String(DEFAULT_TAX_RATE)));
    } catch (error) {
      console.error("Failed to fetch menu related data:", error);
    }
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        await db.initializeDb();
        await fetchAllMenuRelatedData();
      } catch (error) {
        console.error("Failed to initialize the application:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, [fetchAllMenuRelatedData]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    if (user.role === 'manager') navigate('dashboard');
    else if (user.role === 'cashier') navigate('cashier');
    else if (user.role === 'kitchen') navigate('kitchen');
    else if (user.role === 'customer') navigate('customerOrdering');
  };

  const handleLogout = () => {
    const activeUser = currentUser;
    // Clear any active customer session on logout
    if (activeUser?.role === 'customer') {
        sessionStorage.removeItem(`customerSession_${activeUser.id}`);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    navigate('login');
  };
  
  const handleUserUpdate = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleSaveDiscount = (discount: Omit<Discount, 'id'> | Discount) => {
    let newDiscounts: Discount[];
    if ('id' in discount) { newDiscounts = discounts.map(d => d.id === discount.id ? discount : d); } 
    else { newDiscounts = [...discounts, { ...discount, id: Date.now() }]; }
    setDiscounts(newDiscounts);
    localStorage.setItem('discounts', JSON.stringify(newDiscounts));
  };
  const handleDeleteDiscount = (id: number) => {
      const newDiscounts = discounts.filter(d => d.id !== id);
      setDiscounts(newDiscounts);
      localStorage.setItem('discounts', JSON.stringify(newDiscounts));
  };
   const handleUpdateTaxRate = (newRate: number) => {
    setTaxRate(newRate);
    localStorage.setItem('taxRate', String(newRate));
  };
   const handleAddCategory = (newCategory: string) => {
    const newCategories = [...categories, newCategory.trim()];
    setCategories(newCategories);
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };
  const handleDeleteCategory = (categoryToDelete: string) => {
    const newCategories = categories.filter(c => c !== categoryToDelete);
    setCategories(newCategories);
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };
  const handleAddMenuItem = async (item: Omit<MenuItem, 'id'>) => { await db.addMenuItem(item); fetchAllMenuRelatedData(); };
  const handleUpdateMenuItem = async (item: MenuItem) => { await db.updateMenuItem(item); fetchAllMenuRelatedData(); };
  const handleDeleteMenuItem = async (id: number) => { await db.deleteMenuItem(id); fetchAllMenuRelatedData(); };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-300">
        <CoffeeIcon className="w-16 h-16 text-amber-500 animate-pulse" />
        <p className="mt-4 text-lg text-slate-400">Menyiapkan kios...</p>
      </div>
    );
  }

  const renderContent = () => {
    // The protective useEffect handles redirection, so we can render based on currentScreen.
    // We also check currentUser to prevent rendering components with incomplete props during the split-second of a redirect.
    if (!currentUser) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentScreen) {
      case 'kitchen':
        return <KitchenDisplayScreen currentUser={currentUser} onLogout={handleLogout} />;
      case 'cashier':
        return <CashierScreen currentUser={currentUser} onLogout={handleLogout} onOpenMenuManagement={() => setIsMenuManagementOpen(true)} />;
      case 'customerOrdering':
          return <CustomerOrderingScreen currentUser={currentUser} onLogout={handleLogout} />;
      case 'transactions':
        return <TransactionLogScreen onBack={() => navigate('dashboard')} currentUser={currentUser} onLogout={handleLogout} />;
      case 'dashboard':
        return (
            <ManagerDashboardScreen
              currentUser={currentUser}
              onLogout={handleLogout}
              onNavigateToCashierManagement={() => navigate('manageCashiers')}
              onNavigateToTransactionLog={() => navigate('transactions')}
              onNavigateToCashierScreen={() => navigate('cashier')}
              onNavigateToKitchenScreen={() => navigate('kitchen')}
              onOpenMenuManagement={() => setIsMenuManagementOpen(true)}
              onBack={handleLogout}
              onUserUpdate={handleUserUpdate}
            />
          );
      case 'manageCashiers':
         return <CashierManagementScreen currentUser={currentUser} onBack={() => navigate('dashboard')} onLogout={handleLogout} />;
      case 'login':
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-300">
      {renderContent()}

      {currentUser?.role === 'manager' && (
        <MenuManagementModal 
          isOpen={isMenuManagementOpen}
          onClose={() => setIsMenuManagementOpen(false)}
          menuItems={menuItems}
          onAddItem={handleAddMenuItem}
          onUpdateItem={handleUpdateMenuItem}
          onDeleteItem={handleDeleteMenuItem}
          taxRate={taxRate}
          onUpdateTaxRate={handleUpdateTaxRate}
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          discounts={discounts}
          onSaveDiscount={handleSaveDiscount}
          onDeleteDiscount={handleDeleteDiscount}
        />
      )}
    </div>
  );
}

export default App;
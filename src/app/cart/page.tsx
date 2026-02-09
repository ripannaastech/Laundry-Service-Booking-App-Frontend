'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartGroup {
  serviceType: string;
  serviceId?: string;
  items: CartItem[];
}

const CartPage = () => {
  const router = useRouter();
  
  // Initialize cart data from localStorage
  const initializeCart = () => {
    if (typeof window === 'undefined') return [];
    
    // Try new cartGroups format first
    const savedGroups = localStorage.getItem('cartGroups');
    if (savedGroups) {
      try {
        const groups = JSON.parse(savedGroups);
        if (Array.isArray(groups) && groups.length > 0) {
          return groups.map((g: { serviceType: string; serviceId?: string; items: CartItem[] }) => ({
            serviceType: g.serviceType,
            serviceId: g.serviceId || '',
            items: g.items,
          }));
        }
      } catch {
        // fall through to legacy format
      }
    }
    
    // Fallback: legacy single-group format
    const savedItems = localStorage.getItem('cartItems');
    const serviceType = localStorage.getItem('serviceType') || 'Wash & Fold';
    const serviceId = localStorage.getItem('serviceId') || '';
    
    if (savedItems) {
      const items: CartItem[] = JSON.parse(savedItems);
      const groups = [{ serviceType, serviceId, items }];
      // Migrate to new format
      localStorage.setItem('cartGroups', JSON.stringify(groups));
      return groups;
    }
    return [];
  };
  
  const [cartGroups, setCartGroups] = useState<CartGroup[]>(initializeCart);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (cartGroups.length > 0) {
      localStorage.setItem('cartGroups', JSON.stringify(cartGroups));
    } else {
      localStorage.removeItem('cartGroups');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('serviceType');
      localStorage.removeItem('serviceId');
    }
  }, [cartGroups]);
  
  // Initialize selections
  const initializeSelections = () => {
    const groups = new Set<number>();
    const items = new Set<string>();
    
    const initialGroups = initializeCart();
    initialGroups.forEach((group, groupIndex) => {
      groups.add(groupIndex);
      group.items.forEach((item) => {
        items.add(`${groupIndex}-${item.id}`);
      });
    });
    
    return { groups, items };
  };
  
  const { groups: initialGroups, items: initialItems } = initializeSelections();
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(initialGroups);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(initialItems);

  const handleQuantityChange = (groupIndex: number, itemId: string | number, delta: number) => {
    setCartGroups((prev) => {
      const newGroups = [...prev];
      const group = newGroups[groupIndex];
      const itemIndex = group.items.findIndex((item) => item.id === itemId);
      
      if (itemIndex !== -1) {
        const newQuantity = group.items[itemIndex].quantity + delta;
        if (newQuantity <= 0) {
          group.items = group.items.filter((item) => item.id !== itemId);
        } else {
          group.items[itemIndex].quantity = newQuantity;
        }
      }

      // Remove empty groups
      return newGroups.filter((g) => g.items.length > 0);
    });
  };

  const handleDeleteItem = (groupIndex: number, itemId: string | number) => {
    setCartGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex].items = newGroups[groupIndex].items.filter(
        (item) => item.id !== itemId
      );
      return newGroups.filter((g) => g.items.length > 0);
    });
  };

  const handleDeleteGroup = (groupIndex: number) => {
    setCartGroups((prev) => prev.filter((_, index) => index !== groupIndex));
  };

  const handleGroupCheckbox = (groupIndex: number, checked: boolean) => {
    const newSelectedGroups = new Set(selectedGroups);
    const newSelectedItems = new Set(selectedItems);
    
    if (checked) {
      newSelectedGroups.add(groupIndex);
      // Select all items in this group
      cartGroups[groupIndex].items.forEach((item) => {
        newSelectedItems.add(`${groupIndex}-${item.id}`);
      });
    } else {
      newSelectedGroups.delete(groupIndex);
      // Deselect all items in this group
      cartGroups[groupIndex].items.forEach((item) => {
        newSelectedItems.delete(`${groupIndex}-${item.id}`);
      });
    }
    
    setSelectedGroups(newSelectedGroups);
    setSelectedItems(newSelectedItems);
  };

  const handleItemCheckbox = (groupIndex: number, itemId: string | number, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    const itemKey = `${groupIndex}-${itemId}`;
    
    if (checked) {
      newSelectedItems.add(itemKey);
      
      // Check if all items in group are now selected
      const allItemsSelected = cartGroups[groupIndex].items.every((item) =>
        newSelectedItems.has(`${groupIndex}-${item.id}`)
      );
      
      if (allItemsSelected) {
        const newSelectedGroups = new Set(selectedGroups);
        newSelectedGroups.add(groupIndex);
        setSelectedGroups(newSelectedGroups);
      }
    } else {
      newSelectedItems.delete(itemKey);
      
      // Uncheck group checkbox
      const newSelectedGroups = new Set(selectedGroups);
      newSelectedGroups.delete(groupIndex);
      setSelectedGroups(newSelectedGroups);
    }
    
    setSelectedItems(newSelectedItems);
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(10);
      setAppliedCoupon(couponCode);
    } else if (couponCode.toUpperCase() === 'SAVE20') {
      setDiscount(20);
      setAppliedCoupon(couponCode);
    } else {
      setDiscount(0);
      setAppliedCoupon('');
      alert('Invalid coupon code');
    }
  };

  const calculateSubtotal = () => {
    return cartGroups.reduce((total, group, groupIndex) => {
      return total + group.items.reduce((sum, item) => {
        const isSelected = selectedItems.has(`${groupIndex}-${item.id}`);
        return sum + (isSelected ? item.price * item.quantity : 0);
      }, 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryCost = subtotal > 0 ? 5 : 0;
  const discountAmount = (subtotal * discount) / 100;
  const totalPayable = subtotal + deliveryCost - discountAmount;

  const handleCheckout = () => {
    const orderData = {
      cartGroups,
      subtotal,
      deliveryCost,
      discount: discountAmount,
      total: totalPayable,
    };
    localStorage.setItem('orderData', JSON.stringify(orderData));
    router.push('/checkout');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cartGroups.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center animate-fade-in-up">
                  <p className="text-[#5a6a7a] text-sm sm:text-base mb-4">Your cart is empty</p>
                  <Link
                    href="/services"
                    className="inline-block bg-[#0F7BA0] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#0d6a8a] transition-colors"
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                cartGroups.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm animate-fade-in-up"
                    style={{ animationDelay: `${groupIndex * 100}ms` }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(groupIndex)}
                          onChange={(e) => handleGroupCheckbox(groupIndex, e.target.checked)}
                          className="w-5 h-5 sm:w-5 sm:h-5 text-[#0F2744] rounded-lg focus:ring-[#0F2744] focus:ring-2 cursor-pointer accent-[#0F2744]"
                        />
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#0f2744]">
                          {group.serviceType} ({group.items.length})
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(groupIndex)}
                        className="flex items-center gap-1 text-red-500 text-xs sm:text-sm hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item) => {
                        const itemKey = `${groupIndex}-${item.id}`;
                        const isSelected = selectedItems.has(itemKey);
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-opacity ${
                              !isSelected ? 'opacity-40' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleItemCheckbox(groupIndex, item.id, e.target.checked)}
                              className="w-5 h-5 sm:w-5 sm:h-5 text-[#0F2744] rounded-lg focus:ring-[#0F2744] focus:ring-2 mt-1 sm:mt-0 cursor-pointer accent-[#0F2744]"
                            />

                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[#5a6a7a] text-xs sm:text-sm">
                                  {item.quantity} X
                                </span>
                                <span className="text-[#0f2744] text-sm sm:text-base font-medium truncate">
                                  {item.name}
                                </span>
                              </div>
                            </div>

                            {/* Price & Controls */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className={`font-bold text-sm sm:text-base ${
                                isSelected ? 'text-[#0f2744]' : 'text-gray-400 line-through'
                              }`}>
                                $ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleQuantityChange(groupIndex, item.id, -1)}
                                className="p-1 sm:p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                              >
                                <FiMinus className="w-3 h-3 sm:w-4 sm:h-4 text-[#0f2744]" />
                              </button>
                              <span className="text-sm font-medium min-w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(groupIndex, item.id, 1)}
                                className="p-1 sm:p-1.5 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                              >
                                <FiPlus className="w-3 h-3 sm:w-4 sm:h-4 text-[#0f2744]" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteItem(groupIndex, item.id)}
                              className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                      })}
                    </div>

                    {/* Add More Items */}
                    <div className="p-4 sm:p-5 border-t border-gray-100">
                      <Link
                        href="/services"
                        className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-200 rounded-lg text-[#5a6a7a] text-xs sm:text-sm font-medium hover:border-[#0F7BA0] hover:text-[#0F7BA0] transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add More Item
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm sticky top-24 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {/* Coupon */}
                <div className="mb-6">
                  <h3 className="text-sm sm:text-base font-bold text-[#0f2744] mb-3">Coupon Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code here"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#0F7BA0] focus:ring-2 focus:ring-[#0F7BA0]/20"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0F2744] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#1a3a5c] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-green-600 text-xs sm:text-sm mt-2 animate-fade-in">
                      Coupon &quot;{appliedCoupon}&quot; applied! {discount}% off
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 sm:space-y-4 mb-6">
                  <h3 className="text-sm sm:text-base font-bold text-[#0f2744]">Order Summary</h3>
                  
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#5a6a7a]">Sub Total</span>
                    <span className="text-[#0f2744] font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#5a6a7a]">Delivery Cost</span>
                    <span className="text-[#0f2744] font-medium">${deliveryCost.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-green-600">Discount ({discount}%)</span>
                      <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 sm:pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base font-bold text-[#0f2744]">Total Payable</span>
                      <span className="text-base sm:text-lg font-bold text-[#0F7BA0]">${totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cartGroups.length === 0 || subtotal === 0}
                  className="w-full bg-[#0F2744] text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-[#1a3a5c] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go To Check Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CartPage;

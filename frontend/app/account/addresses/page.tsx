'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, X, Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { addressesApi } from '@/lib/api';
import type { Address, CreateAddressData } from '@/lib/api/addresses';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Ladakh', 'Jammu and Kashmir',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
];

const emptyForm: CreateAddressData = {
  label: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

interface FormErrors {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

function validateForm(data: CreateAddressData): FormErrors {
  const errors: FormErrors = {};
  if (!data.label.trim()) errors.label = 'Label is required (e.g. Home, Work)';
  if (!data.street.trim()) errors.street = 'Street address is required';
  if (!data.city.trim()) errors.city = 'City is required';
  if (!data.state.trim()) errors.state = 'State is required';
  if (!data.postalCode.trim()) {
    errors.postalCode = 'PIN code is required';
  } else if (!/^\d{6}$/.test(data.postalCode.trim())) {
    errors.postalCode = 'Enter a valid 6-digit PIN code';
  }
  return errors;
}

export default function AddressesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAddressData>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressesApi.getAddresses();
      if (res.success && res.addresses) {
        setAddresses(res.addresses);
      } else {
        setAddresses([]);
      }
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message || 'Failed to load addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India',
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const updateField = (field: keyof CreateAddressData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on field change
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await addressesApi.updateAddress(editingId, formData);
      } else {
        await addressesApi.createAddress(formData);
      }
      closeForm();
      await fetchAddresses();
    } catch (err: any) {
      console.error('Error saving address:', err);
      setError(err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await addressesApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error('Error deleting address:', err);
      setError(err.message || 'Failed to delete address.');
    } finally {
      setDeletingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-textSecondary text-sm">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors mb-6"
              >
                <ArrowLeft size={14} />
                My Account
              </Link>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
                My Addresses
              </h1>
              <p className="text-textSecondary font-light text-sm mt-2">
                Manage your saved delivery addresses
              </p>
            </div>
            {!showForm && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={openAddForm}
                className="inline-flex items-center gap-2 border border-gold text-gold px-6 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
              >
                <Plus size={14} />
                Add Address
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 border border-red-500/30 bg-red-500/5 p-4 flex items-center justify-between"
            >
              <p className="text-red-400 text-sm font-light">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <X size={16} />
              </button>
            </motion.div>
          )}

          {/* Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-10"
              >
                <div className="border border-border bg-[#0f0d0a] p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-serif font-bold text-textPrimary">
                      {editingId ? 'Edit Address' : 'New Address'}
                    </h2>
                    <button
                      onClick={closeForm}
                      className="text-textSecondary hover:text-gold transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Label */}
                      <div>
                        <label className="block text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                          Label <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.label}
                          onChange={(e) => updateField('label', e.target.value)}
                          placeholder="e.g. Home, Work, Office"
                          className={`w-full bg-background border ${formErrors.label ? 'border-red-500' : 'border-border'} text-textPrimary px-4 py-3 text-sm font-light focus:border-gold focus:outline-none transition-colors`}
                        />
                        {formErrors.label && (
                          <p className="text-red-400 text-xs mt-1 font-light">{formErrors.label}</p>
                        )}
                      </div>

                      {/* Postal Code */}
                      <div>
                        <label className="block text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                          PIN Code <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6-digit PIN code"
                          maxLength={6}
                          className={`w-full bg-background border ${formErrors.postalCode ? 'border-red-500' : 'border-border'} text-textPrimary px-4 py-3 text-sm font-light focus:border-gold focus:outline-none transition-colors`}
                        />
                        {formErrors.postalCode && (
                          <p className="text-red-400 text-xs mt-1 font-light">{formErrors.postalCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Street */}
                    <div>
                      <label className="block text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                        Street Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => updateField('street', e.target.value)}
                        placeholder="House/Flat No., Building, Street, Area"
                        className={`w-full bg-background border ${formErrors.street ? 'border-red-500' : 'border-border'} text-textPrimary px-4 py-3 text-sm font-light focus:border-gold focus:outline-none transition-colors`}
                      />
                      {formErrors.street && (
                        <p className="text-red-400 text-xs mt-1 font-light">{formErrors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* City */}
                      <div>
                        <label className="block text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                          City <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="City / Town"
                          className={`w-full bg-background border ${formErrors.city ? 'border-red-500' : 'border-border'} text-textPrimary px-4 py-3 text-sm font-light focus:border-gold focus:outline-none transition-colors`}
                        />
                        {formErrors.city && (
                          <p className="text-red-400 text-xs mt-1 font-light">{formErrors.city}</p>
                        )}
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                          State <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => updateField('state', e.target.value)}
                          className={`w-full bg-background border ${formErrors.state ? 'border-red-500' : 'border-border'} text-textPrimary px-4 py-3 text-sm font-light focus:border-gold focus:outline-none transition-colors appearance-none`}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {formErrors.state && (
                          <p className="text-red-400 text-xs mt-1 font-light">{formErrors.state}</p>
                        )}
                      </div>
                    </div>

                    {/* Default toggle */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 border ${formData.isDefault ? 'border-gold bg-gold' : 'border-border'} flex items-center justify-center transition-colors`}
                      >
                        {formData.isDefault && <Check size={12} className="text-background" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isDefault || false}
                        onChange={(e) => updateField('isDefault', e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-sm text-textSecondary font-light group-hover:text-textPrimary transition-colors">
                        Set as default address
                      </span>
                    </label>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gold text-background px-8 py-3 text-xs font-light uppercase tracking-widest hover:bg-goldHover transition-colors disabled:opacity-50"
                      >
                        {isSubmitting
                          ? 'Saving...'
                          : editingId
                            ? 'Update Address'
                            : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={closeForm}
                        className="text-xs text-textSecondary font-light uppercase tracking-wider hover:text-gold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Addresses List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="animate-pulse border border-border p-6 bg-[#0f0d0a]">
                  <div className="h-4 bg-[#1a1815] w-24 mb-3" />
                  <div className="h-3 bg-[#1a1815] w-full mb-2" />
                  <div className="h-3 bg-[#1a1815] w-3/4 mb-2" />
                  <div className="h-3 bg-[#1a1815] w-1/2" />
                </div>
              ))}
            </div>
          ) : addresses.length === 0 && !showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <MapPin className="w-16 h-16 text-gold/20 mx-auto" />
              <h2 className="text-2xl font-serif font-bold text-textPrimary">
                No Saved Addresses
              </h2>
              <p className="text-sm text-textSecondary font-light max-w-md mx-auto">
                Add a delivery address for faster checkout.
              </p>
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
              >
                <Plus size={14} />
                Add Your First Address
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  className="border border-border rounded-none p-6 bg-[#0f0d0a] hover:border-gold/40 transition-colors duration-300 relative"
                >
                  {/* Default badge */}
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 inline-block px-2 py-1 bg-gold/20 text-gold text-xs rounded-none font-light">
                      Default
                    </span>
                  )}

                  {/* Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-gold" />
                    <p className="text-sm font-serif font-bold text-textPrimary uppercase">
                      {address.label}
                    </p>
                  </div>

                  {/* Address details */}
                  <div className="space-y-1 mb-6">
                    <p className="text-sm text-textSecondary font-light">{address.street}</p>
                    <p className="text-sm text-textSecondary font-light">
                      {address.city}, {address.state} - {address.postalCode}
                    </p>
                    <p className="text-sm text-textSecondary font-light">{address.country}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <button
                      onClick={() => openEditForm(address)}
                      className="inline-flex items-center gap-1 text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="inline-flex items-center gap-1 text-xs text-red-400 font-light uppercase tracking-wider hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deletingId === address.id ? (
                        <>
                          <div className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

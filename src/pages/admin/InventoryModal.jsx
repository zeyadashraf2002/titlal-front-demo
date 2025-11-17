// frontend/src/pages/admin/InventoryModal.jsx - NEW FILE
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { inventoryAPI } from '../../services/api';

const InventoryModal = ({ isOpen, onClose, item, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: item || {}
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (item) {
      reset(item);
    } else {
      reset({
        name: '',
        category: 'fertilizer',
        sku: '',
        description: '',
        unit: 'kg',
        branch: '',
        quantity: {
          current: 0,
          minimum: 10,
          maximum: 1000
        },
        price: {
          cost: 0,
          selling: 0
        },
        supplier: {
          name: '',
          contact: '',
          email: ''
        }
      });
    }
  }, [item, reset]);

  const fetchBranches = async () => {
    try {
      // Assuming you have a branches API endpoint
      // const response = await branchesAPI.getBranches();
      // setBranches(response.data.data || []);
      
      // For now, mock data:
      setBranches([
        { _id: '6910b1c1a3e82a5b6b079a63', name: 'Main Branch' }
      ]);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      // ✅ Ensure branch is included
      if (!data.branch) {
        setError('Branch is required');
        setLoading(false);
        return;
      }

      if (item) {
        await inventoryAPI.updateInventoryItem(item._id, data);
      } else {
        await inventoryAPI.createInventoryItem(data);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? t('common.edit') : t('common.add')}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.inventory.itemName')}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            required
          />

          <Input
            label="SKU"
            {...register('sku')}
            placeholder="AUTO-001"
          />

          <Select
            label="Category"
            {...register('category')}
            options={[
              { value: 'fertilizer', label: 'Fertilizer' },
              { value: 'pesticide', label: 'Pesticide' },
              { value: 'seeds', label: 'Seeds' },
              { value: 'tools', label: 'Tools' },
              { value: 'equipment', label: 'Equipment' },
              { value: 'other', label: 'Other' }
            ]}
            required
          />

          <Select
            label={t('admin.inventory.unit')}
            {...register('unit')}
            options={[
              { value: 'kg', label: t('units.kg') },
              { value: 'liter', label: t('units.liter') },
              { value: 'piece', label: t('units.piece') },
              { value: 'bag', label: t('units.bag') },
              { value: 'box', label: t('units.box') },
              { value: 'meter', label: t('units.meter') }
            ]}
            required
          />
        </div>

        {/* ✅ FIXED: Branch Selection */}
        <Select
          label="Branch"
          {...register('branch', { required: 'Branch is required' })}
          error={errors.branch?.message}
          options={branches.map(b => ({ value: b._id, label: b.name }))}
          placeholder="Select branch"
          required
        />

        {/* Quantity */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label={t('admin.inventory.quantity')}
            type="number"
            {...register('quantity.current', { required: true })}
            min="0"
            required
          />

          <Input
            label={t('admin.inventory.minStock')}
            type="number"
            {...register('quantity.minimum', { required: true })}
            min="0"
            required
          />

          <Input
            label="Max Stock"
            type="number"
            {...register('quantity.maximum')}
            min="0"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost Price"
            type="number"
            {...register('price.cost')}
            min="0"
            step="0.01"
          />

          <Input
            label="Selling Price"
            type="number"
            {...register('price.selling')}
            min="0"
            step="0.01"
          />
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('admin.inventory.supplier')} Info
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Supplier Name"
              {...register('supplier.name')}
            />
            <Input
              placeholder="Contact"
              {...register('supplier.contact')}
            />
            <Input
              placeholder="Email"
              type="email"
              {...register('supplier.email')}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            maxLength={500}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryModal;
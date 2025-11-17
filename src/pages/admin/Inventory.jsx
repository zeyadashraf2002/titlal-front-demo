// frontend/src/pages/admin/Inventory.jsx - FIXED
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import InventoryModal from './InventoryModal';
import Loading from '../../components/common/Loading';

const Inventory = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getInventory({ search: searchTerm });
      setInventory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to fetch inventory. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await inventoryAPI.deleteInventoryItem(id);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert(error.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSuccess = () => {
    fetchInventory();
  };

  const getStockStatus = (item) => {
    const current = item.quantity?.current || 0;
    const minimum = item.quantity?.minimum || 0;

    if (current === 0) return { label: 'Out of Stock', color: 'text-red-600' };
    if (current <= minimum) return { label: 'Low Stock', color: 'text-yellow-600' };
    return { label: 'In Stock', color: 'text-green-600' };
  };

  const columns = [
    {
      header: '',
      render: (row) => {
        const status = getStockStatus(row);
        return status.label === 'Low Stock' || status.label === 'Out of Stock' ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : null;
      }
    },
    { header: t('admin.inventory.itemName'), accessor: 'name' },
    {
      header: t('admin.inventory.quantity'),
      render: (row) => {
        const status = getStockStatus(row);
        return (
          <span className={status.color}>
            {row.quantity?.current || 0} {row.unit}
          </span>
        );
      }
    },
    {
      header: t('admin.inventory.minStock'),
      render: (row) => `${row.quantity?.minimum || 0} ${row.unit}`
    },
    {
      header: 'Branch',
      render: (row) => row.branch?.name || 'N/A'
    },
    { 
      header: t('admin.inventory.supplier'), 
      render: (row) => row.supplier?.name || 'N/A'
    },
    {
      header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)} 
            className="text-blue-600 hover:text-blue-800 p-1"
            title={t('common.edit')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(row._id)} 
            className="text-red-600 hover:text-red-800 p-1"
            title={t('common.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('admin.inventory.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('common.subtitle')} {inventory.length} items
          </p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          {t('common.add')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredInventory} />
        )}
      </Card>

      {/* Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        item={selectedItem}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Inventory;
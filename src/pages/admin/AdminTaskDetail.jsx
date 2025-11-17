import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, DollarSign, Eye, EyeOff, CheckCircle, XCircle, FileText } from 'lucide-react';
import { tasksAPI, invoicesAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const AdminTaskDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pricing
  const [laborCost, setLaborCost] = useState(0);
  const [materialsCost, setMaterialsCost] = useState(0);
  
  // Image visibility
  const [selectedBeforeImages, setSelectedBeforeImages] = useState([]);
  const [selectedAfterImages, setSelectedAfterImages] = useState([]);
  
  // Admin review
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task) {
      setLaborCost(task.cost?.labor || 0);
      setMaterialsCost(task.cost?.materials || 0);
      setReviewStatus(task.adminReview?.status || 'pending');
      setReviewComments(task.adminReview?.comments || '');
      
      // Select all visible images by default
      setSelectedBeforeImages(
        task.images?.before?.filter(img => img.isVisibleToClient).map(img => img._id) || []
      );
      setSelectedAfterImages(
        task.images?.after?.filter(img => img.isVisibleToClient).map(img => img._id) || []
      );
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      setTask(response.data.data);
    } catch (error) {
      console.error('Error fetching task:', error);
      alert('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const toggleImageVisibility = async (imageId, imageType, currentlyVisible) => {
    try {
      // This would need a backend endpoint to toggle visibility
      // For now, just update local state
      if (imageType === 'before') {
        setSelectedBeforeImages(prev => 
          currentlyVisible 
            ? prev.filter(id => id !== imageId)
            : [...prev, imageId]
        );
      } else {
        setSelectedAfterImages(prev => 
          currentlyVisible 
            ? prev.filter(id => id !== imageId)
            : [...prev, imageId]
        );
      }
      
      alert('Image visibility updated');
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleSavePricing = async () => {
    try {
      setSaving(true);
      
      await tasksAPI.updateTask(id, {
        cost: {
          labor: parseFloat(laborCost),
          materials: parseFloat(materialsCost),
          total: parseFloat(laborCost) + parseFloat(materialsCost)
        }
      });
      
      alert('Pricing saved successfully');
      fetchTask();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReview = async () => {
    try {
      setSaving(true);
      
      await tasksAPI.updateTask(id, {
        adminReview: {
          status: reviewStatus,
          comments: reviewComments,
          reviewedBy: null, // Backend will set this
          reviewedAt: new Date()
        },
        status: reviewStatus === 'approved' ? 'completed' : 'review'
      });
      
      alert('Review saved successfully');
      fetchTask();
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      if (!task.cost || task.cost.total === 0) {
        alert('Please set pricing before generating invoice');
        return;
      }

      setSaving(true);
      
      const invoiceData = {
        task: task._id,
        client: task.client._id,
        branch: task.branch._id,
        selectedImages: [
          ...selectedBeforeImages,
          ...selectedAfterImages
        ]
      };

      await invoicesAPI.createInvoice(invoiceData);
      
      alert('Invoice generated successfully');
      navigate('/admin/invoices');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';

  return (
    <div className="space-y-6">
      <Button
        variant="secondary"
        icon={ArrowLeft}
        onClick={() => navigate('/admin/tasks')}
      >
        Back to Tasks
      </Button>

      {/* Header */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {t(`status.${task.status}`)}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing */}
          <Card title="💰 Pricing & Cost">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Labor Cost ($)"
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Materials Cost ($)"
                  type="number"
                  value={materialsCost}
                  onChange={(e) => setMaterialsCost(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-900">Total Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(parseFloat(laborCost) + parseFloat(materialsCost)).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSavePricing} 
                disabled={saving}
                icon={DollarSign}
              >
                {saving ? 'Saving...' : 'Save Pricing'}
              </Button>
            </div>
          </Card>

          {/* Before Images */}
          {task.images?.before && task.images.before.length > 0 && (
            <Card title="📷 Before Photos">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {task.images.before.map((img) => (
                  <div key={img._id} className="relative group">
                    <img
                      src={`${img.url}`}
                      alt="Before"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => toggleImageVisibility(img._id, 'before', selectedBeforeImages.includes(img._id))}
                      className={`absolute top-2 right-2 p-2 rounded-full ${
                        selectedBeforeImages.includes(img._id)
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-700'
                      } shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      {selectedBeforeImages.includes(img._id) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedBeforeImages.length} of {task.images.before.length} visible to client
              </p>
            </Card>
          )}

          {/* After Images */}
          {task.images?.after && task.images.after.length > 0 && (
            <Card title="✅ After Photos">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {task.images.after.map((img) => (
                  <div key={img._id} className="relative group">
                    <img
                      src={`${img.url}`}
                      alt="After"
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => toggleImageVisibility(img._id, 'after', selectedAfterImages.includes(img._id))}
                      className={`absolute top-2 right-2 p-2 rounded-full ${
                        selectedAfterImages.includes(img._id)
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-700'
                      } shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      {selectedAfterImages.includes(img._id) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedAfterImages.length} of {task.images.after.length} visible to client
              </p>
            </Card>
          )}

          {/* Admin Review */}
          <Card title="🔍 Admin Review">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add review comments..."
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveReview} 
                  disabled={saving}
                  variant={reviewStatus === 'approved' ? 'success' : 'primary'}
                  icon={reviewStatus === 'approved' ? CheckCircle : XCircle}
                >
                  {saving ? 'Saving...' : 'Save Review'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card title="ℹ️ Task Information">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Client</p>
                <p className="font-semibold">{task.client?.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Worker</p>
                <p className="font-semibold">{task.worker?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-gray-500">Scheduled Date</p>
                <p className="font-semibold">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              {task.completedAt && (
                <div>
                  <p className="text-gray-500">Completed At</p>
                  <p className="font-semibold">
                    {new Date(task.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card title="⚡ Quick Actions">
            <div className="space-y-3">
              <Button 
                className="w-full"
                variant="success"
                icon={FileText}
                onClick={handleGenerateInvoice}
                disabled={saving || task.invoice || !task.cost || task.cost.total === 0}
              >
                {task.invoice ? 'Invoice Generated' : 'Generate Invoice'}
              </Button>
              
              {task.invoice && (
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate('/admin/invoices')}
                >
                  View Invoice
                </Button>
              )}
            </div>
          </Card>

          {/* Materials */}
          {task.materials && task.materials.length > 0 && (
            <Card title="📦 Materials Used">
              <div className="space-y-2">
                {task.materials.map((material, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{material.name}</span>
                    <span className="font-semibold">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetail;
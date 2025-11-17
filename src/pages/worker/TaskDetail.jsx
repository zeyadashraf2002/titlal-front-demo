// frontend/src/pages/worker/TaskDetail.jsx - FIXED Materials
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Camera, Upload, CheckCircle, Clock, X, Plus, Minus } from 'lucide-react';
import { tasksAPI, inventoryAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const TaskDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [beforePreviews, setBeforePreviews] = useState([]);
  const [afterPreviews, setAfterPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // ✅ NEW: Materials Management
  const [availableInventory, setAvailableInventory] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchInventory();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      setTask(response.data.data);
      
      // Load existing materials
      if (response.data.data.materials) {
        setSelectedMaterials(response.data.data.materials.map(m => ({
          item: m.item?._id || m.item,
          name: m.name || m.item?.name,
          quantity: m.quantity,
          unit: m.unit || m.item?.unit,
          confirmed: m.confirmed || false
        })));
      }
      
      // Load existing images
      if (response.data.data.images?.before) {
        setBeforePreviews(response.data.data.images.before.map(img => ({
          url: img.url,
          existing: true
        })));
      }
      if (response.data.data.images?.after) {
        setAfterPreviews(response.data.data.images.after.map(img => ({
          url: img.url,
          existing: true
        })));
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      alert('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getInventory();
      setAvailableInventory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // ✅ NEW: Material Management Functions
  const handleAddMaterial = (inventoryItem) => {
    const existing = selectedMaterials.find(m => m.item === inventoryItem._id);
    if (existing) {
      alert('Material already added');
      return;
    }

    setSelectedMaterials([...selectedMaterials, {
      item: inventoryItem._id,
      name: inventoryItem.name,
      quantity: 1,
      unit: inventoryItem.unit,
      confirmed: false
    }]);
    setShowAddMaterial(false);
  };

  const handleUpdateMaterialQuantity = (index, change) => {
    const updated = [...selectedMaterials];
    updated[index].quantity = Math.max(1, updated[index].quantity + change);
    setSelectedMaterials(updated);
  };

  const handleRemoveMaterial = (index) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleConfirmMaterials = async () => {
    try {
      await tasksAPI.updateTask(id, {
        materials: selectedMaterials.map(m => ({
          ...m,
          confirmed: true,
          confirmedAt: new Date()
        }))
      });
      
      alert('Materials confirmed successfully');
      fetchTask();
    } catch (error) {
      console.error('Error confirming materials:', error);
      alert('Failed to confirm materials');
    }
  };

  const handleImageChange = (type, event) => {
    const files = Array.from(event.target.files);
    
    if (type === 'before') {
      if (beforeImages.length + files.length > 50) {
        alert('Maximum 50 images allowed');
        return;
      }
      setBeforeImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBeforePreviews(prev => [...prev, { url: reader.result, file }]);
        };
        reader.readAsDataURL(file);
      });
    } else {
      if (afterImages.length + files.length > 50) {
        alert('Maximum 50 images allowed');
        return;
      }
      setAfterImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAfterPreviews(prev => [...prev, { url: reader.result, file }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (type, index) => {
    if (type === 'before') {
      setBeforeImages(prev => prev.filter((_, i) => i !== index));
      setBeforePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterImages(prev => prev.filter((_, i) => i !== index));
      setAfterPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStartTask = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await tasksAPI.startTask(id, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          fetchTask();
        }, (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location');
        });
      }
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Failed to start task');
    }
  };

  const handleFinishTask = async () => {
    try {
      // Validation
      if (beforeImages.length === 0 && beforePreviews.filter(p => !p.existing).length === 0) {
        alert('Please upload at least one before photo');
        return;
      }
      if (afterImages.length === 0 && afterPreviews.filter(p => !p.existing).length === 0) {
        alert('Please upload at least one after photo');
        return;
      }
      if (selectedMaterials.length === 0) {
        alert('Please add materials used');
        return;
      }
      if (selectedMaterials.some(m => !m.confirmed)) {
        alert('Please confirm all materials');
        return;
      }

      setUploading(true);

      // Upload before images
      if (beforeImages.length > 0) {
        const beforeFormData = new FormData();
        beforeImages.forEach(file => {
          beforeFormData.append('images', file);
        });
        beforeFormData.append('imageType', 'before');
        beforeFormData.append('isVisibleToClient', 'true');

        await tasksAPI.uploadTaskImages(id, beforeFormData);
      }

      // Upload after images
      if (afterImages.length > 0) {
        const afterFormData = new FormData();
        afterImages.forEach(file => {
          afterFormData.append('images', file);
        });
        afterFormData.append('imageType', 'after');
        afterFormData.append('isVisibleToClient', 'true');

        await tasksAPI.uploadTaskImages(id, afterFormData);
      }

      // Complete task with location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await tasksAPI.completeTask(id, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          alert('Task completed successfully!');
          navigate('/worker/tasks');
        }, async (error) => {
          console.error('Geolocation error:', error);
          await tasksAPI.completeTask(id, {});
          alert('Task completed successfully!');
          navigate('/worker/tasks');
        });
      }
    } catch (error) {
      console.error('Error finishing task:', error);
      alert(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setUploading(false);
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const materialsConfirmed = selectedMaterials.length > 0 && selectedMaterials.every(m => m.confirmed);

  return (
    <div className="space-y-6">
      <Button
        variant="secondary"
        icon={ArrowLeft}
        onClick={() => navigate('/worker/tasks')}
      >
        Back to Tasks
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                  {t(`status.${task.status}`)}
                </span>
              </div>

              <p className="text-gray-600">{task.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">{task.client?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{task.location?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-semibold">
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-semibold text-orange-600">
                    {t(`priority.${task.priority}`)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Photo Upload */}
          <Card title={t('worker.uploadPhotos')}>
            <div className="space-y-6">
              {/* Before Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('worker.beforePhoto')} ({beforePreviews.length}/50)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange('before', e)}
                    className="hidden"
                    id="before-photos"
                    disabled={task.status === 'completed'}
                  />
                  <label
                    htmlFor="before-photos"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload before photos
                    </span>
                  </label>
                </div>

                {beforePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {beforePreviews.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Before ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        {!img.existing && task.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => removeImage('before', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('worker.afterPhoto')} ({afterPreviews.length}/50)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange('after', e)}
                    className="hidden"
                    id="after-photos"
                    disabled={task.status === 'completed'}
                  />
                  <label
                    htmlFor="after-photos"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload after photos
                    </span>
                  </label>
                </div>

                {afterPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {afterPreviews.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`After ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        {!img.existing && task.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => removeImage('after', index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ✅ NEW: Materials Management */}
          <Card title={t('worker.materialsReceived')}>
            <div className="space-y-3">
              {selectedMaterials.map((material, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{material.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleUpdateMaterialQuantity(idx, -1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={task.status === 'completed'}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm px-2">{material.quantity} {material.unit}</span>
                      <button
                        onClick={() => handleUpdateMaterialQuantity(idx, 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={task.status === 'completed'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {!material.confirmed && task.status !== 'completed' && (
                    <button
                      onClick={() => handleRemoveMaterial(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {material.confirmed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}

              {task.status !== 'completed' && (
                <>
                  {!showAddMaterial ? (
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded hover:border-primary-500 text-sm text-gray-600 hover:text-primary-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Material
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <select
                        onChange={(e) => {
                          const item = availableInventory.find(i => i._id === e.target.value);
                          if (item) handleAddMaterial(item);
                        }}
                        className="w-full px-3 py-2 border rounded text-sm"
                      >
                        <option value="">Select material...</option>
                        {availableInventory.map(item => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.quantity.current} {item.unit})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowAddMaterial(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {selectedMaterials.length > 0 && !materialsConfirmed && (
                    <Button
                      className="w-full"
                      variant="success"
                      size="sm"
                      onClick={handleConfirmMaterials}
                    >
                      {t('worker.confirmMaterials')}
                    </Button>
                  )}
                </>
              )}

              {materialsConfirmed && (
                <div className="bg-green-50 p-2 rounded text-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-800">Materials Confirmed</p>
                </div>
              )}
            </div>
          </Card>

          {/* Task Time */}
          {task.startedAt && (
            <Card title={t('worker.taskTime')}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Started: {new Date(task.startedAt).toLocaleString()}</span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Completed: {new Date(task.completedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <div className="space-y-3">
              {task.status === 'assigned' && (
                <Button className="w-full" onClick={handleStartTask}>
                  {t('worker.startTask')}
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button 
                  className="w-full" 
                  variant="success" 
                  onClick={handleFinishTask}
                  disabled={uploading || !materialsConfirmed}
                >
                  {uploading ? 'Uploading...' : t('worker.finishTask')}
                </Button>
              )}
              {task.status === 'completed' && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-semibold">Task Completed!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { tasksAPI, clientsAPI, usersAPI, plantsAPI } from '../../services/api';

const TaskModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [referenceImages, setReferenceImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: task || {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (task) {
      reset(task);
      if (task.images?.reference) {
        setImagePreviews(task.images.reference.map(img => ({
          url: img.url,
          preview: `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001'}/${img.url}`
        })));
      }
    } else {
      reset({
        title: '',
        description: '',
        client: '',
        worker: '',
        category: 'lawn-mowing',
        priority: 'medium',
        scheduledDate: '',
        estimatedDuration: 2,
        plants: []
      });
    }
  }, [task, reset]);

  const fetchData = async () => {
    try {
      const [clientsRes, workersRes, plantsRes] = await Promise.all([
        clientsAPI.getClients(),
        usersAPI.getWorkers(),
        plantsAPI.getPlants()
      ]);
      
      setClients(clientsRes.data.data || []);
      setWorkers(workersRes.data.data || []);
      setPlants(plantsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 50) {
      alert('Maximum 50 images allowed');
      return;
    }

    setReferenceImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, {
          file,
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (task) {
        await tasksAPI.updateTask(task._id, data);
      } else {
        const response = await tasksAPI.createTask(data);
        
        // Upload reference images if any
        if (referenceImages.length > 0 && response.data.data._id) {
          const formData = new FormData();
          referenceImages.forEach(file => {
            formData.append('images', file);
          });
          formData.append('imageType', 'reference');
          
          await tasksAPI.uploadTaskImages(response.data.data._id, formData);
        }
      }

      onSuccess();
      onClose();
      reset();
      setImagePreviews([]);
      setReferenceImages([]);
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
      title={task ? t('common.edit') : t('admin.tasks.createTask')}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <Input
          label={t('admin.tasks.taskName')}
          {...register('title', { required: 'Task name is required' })}
          error={errors.title?.message}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.tasks.description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Client & Worker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('admin.tasks.client')}
            {...register('client', { required: 'Client is required' })}
            error={errors.client?.message}
            options={clients.map(c => ({ value: c._id, label: c.name }))}
            placeholder="Select client"
            required
          />

          <Select
            label={t('admin.tasks.assignedTo')}
            {...register('worker')}
            options={workers.map(w => ({ value: w._id, label: w.name }))}
            placeholder="Select worker (optional)"
          />
        </div>

        {/* Category, Priority, Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('admin.tasks.category')}
            {...register('category')}
            options={[
              { value: 'lawn-mowing', label: 'Lawn Mowing' },
              { value: 'tree-trimming', label: 'Tree Trimming' },
              { value: 'landscaping', label: 'Landscaping' },
              { value: 'irrigation', label: 'Irrigation' },
              { value: 'pest-control', label: 'Pest Control' },
              { value: 'other', label: 'Other' }
            ]}
          />

          <Select
            label={t('admin.tasks.priority')}
            {...register('priority')}
            options={[
              { value: 'low', label: t('priority.low') },
              { value: 'medium', label: t('priority.medium') },
              { value: 'high', label: t('priority.high') },
              { value: 'urgent', label: t('priority.urgent') }
            ]}
          />

          <Input
            label={t('admin.tasks.dueDate')}
            type="date"
            {...register('scheduledDate', { required: 'Date is required' })}
            error={errors.scheduledDate?.message}
            required
          />
        </div>

        {/* Plants Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('nav.plants')} (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
            {plants.map((plant) => (
              <label key={plant._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  value={plant._id}
                  {...register('plants')}
                  className="rounded text-green-600"
                />
                <span className="text-sm">{plant.name?.en || plant.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reference Images Upload (up to 50) */}
        {!task && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Images (Max 50)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="reference-images"
              />
              <label
                htmlFor="reference-images"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload images ({imagePreviews.length}/50)
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imagePreviews.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
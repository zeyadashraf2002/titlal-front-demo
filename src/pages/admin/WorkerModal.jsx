import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { usersAPI } from '../../services/api';

const WorkerModal = ({ isOpen, onClose, worker, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: worker || {}
  });

  useEffect(() => {
    if (worker) {
      reset(worker);
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'worker',
        workerDetails: {
          specialization: []
        }
      });
    }
  }, [worker, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      if (worker) {
        await usersAPI.updateUser(worker._id, data);
      } else {
        await usersAPI.createUser(data);
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

  const specializations = [
    'lawn-mowing',
    'tree-trimming',
    'landscaping',
    'irrigation',
    'pest-control',
    'maintenance'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={worker ? t('common.edit') : t('admin.workers.addWorker')}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.workers.name')}
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            required
          />

          <Input
            label={t('admin.workers.email')}
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
            required
          />

          {!worker && (
            <Input
              label={t('auth.password')}
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              error={errors.password?.message}
              required
            />
          )}

          <Input
            label={t('admin.workers.phone')}
            {...register('phone', { required: 'Phone is required' })}
            error={errors.phone?.message}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.workers.specialization')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {specializations.map((spec) => (
              <label key={spec} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={spec}
                  {...register('workerDetails.specialization')}
                  className="rounded text-green-600"
                />
                <span className="text-sm capitalize">{spec.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

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

export default WorkerModal;
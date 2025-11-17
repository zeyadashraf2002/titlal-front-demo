import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Clock, MapPin } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const MyTasks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, assigned, in-progress, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'assigned': 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-300',
      'completed': 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'assigned') return task.status === 'assigned';
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('worker.myTasks')}</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter(t => t.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'assigned' ? 'primary' : 'secondary'}
          onClick={() => setFilter('assigned')}
        >
          Assigned ({tasks.filter(t => t.status === 'assigned').length})
        </Button>
        <Button
          variant={filter === 'in-progress' ? 'primary' : 'secondary'}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({tasks.filter(t => t.status === 'in-progress').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </Button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {task.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                  {t(`status.${task.status}`)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {task.location?.address || task.client?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Due: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
                    {t(`priority.${task.priority}`)} Priority
                  </span>
                </div>
              </div>

              {task.materials && task.materials.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Materials:</p>
                  <div className="flex flex-wrap gap-1">
                    {task.materials.slice(0, 3).map((material, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {material.name}
                      </span>
                    ))}
                    {task.materials.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{task.materials.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                variant="primary"
                icon={Eye}
                onClick={() => navigate(`/worker/tasks/${task._id}`)}
              >
                {t('worker.taskDetails')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, CheckSquare, CheckCircle, DollarSign, FileText } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalWorkers: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });

  // Mock data for charts
  const taskData = [
    { month: 'Jan', completed: 45, pending: 12 },
    { month: 'Feb', completed: 52, pending: 8 },
    { month: 'Mar', completed: 61, pending: 15 },
    { month: 'Apr', completed: 58, pending: 10 },
    { month: 'May', completed: 70, pending: 6 },
    { month: 'Jun', completed: 65, pending: 9 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 25000 },
  ];

  useEffect(() => {
    // Mock data - replace with API call
    setStats({
      totalClients: 156,
      totalWorkers: 42,
      activeTasks: 28,
      completedTasks: 342,
      totalRevenue: 108000,
      pendingInvoices: 12,
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('admin.title')}</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('admin.stats.totalClients')}
          value={stats.totalClients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={t('admin.stats.totalWorkers')}
          value={stats.totalWorkers}
          icon={Briefcase}
          color="green"
        />
        <StatCard
          title={t('admin.stats.activeTasks')}
          value={stats.activeTasks}
          icon={CheckSquare}
          color="yellow"
        />
        <StatCard
          title={t('admin.stats.completedTasks')}
          value={stats.completedTasks}
          icon={CheckCircle}
          color="primary"
        />
        <StatCard
          title={t('admin.stats.totalRevenue')}
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title={t('admin.stats.pendingInvoices')}
          value={stats.pendingInvoices}
          icon={FileText}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('admin.reports.taskCompletion')}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#22c55e" name="Completed" />
              <Bar dataKey="pending" fill="#eab308" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t('admin.reports.revenueAnalysis')}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


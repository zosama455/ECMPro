import React, { useEffect, useState } from 'react';
import { FileText, Activity, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { RecentActivity, Task } from '../types';

export function Dashboard() {
  const { t } = useTranslation();
  const { currentDepartment } = useApp();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentActivity: 0,
    pendingTasks: 0,
    storageUsed: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (currentDepartment) {
      loadDashboardData();
    }
  }, [currentDepartment]);

  const loadDashboardData = async () => {
    if (!currentDepartment) return;

    const { data: allFiles } = await supabase
      .from('files')
      .select('file_size')
      .eq('department_id', currentDepartment.id);

    const { data: activityData } = await supabase
      .from('recent_activity')
      .select('*')
      .eq('department_id', currentDepartment.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('department_id', currentDepartment.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5);

    const totalStorage = allFiles?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0;

    setActivities(activityData || []);
    setTasks(taskData || []);
    setStats({
      totalDocuments: allFiles?.length || 0,
      recentActivity: activityData?.length || 0,
      pendingTasks: taskData?.length || 0,
      storageUsed: Math.round(totalStorage / (1024 * 1024)),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      titleKey: 'dashboard.totalDocuments',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-emerald-500',
      trend: '+12%',
    },
    {
      titleKey: 'dashboard.recentActivity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'bg-blue-500',
      trend: '+5%',
    },
    {
      titleKey: 'dashboard.pendingTasks',
      value: stats.pendingTasks,
      icon: CheckSquare,
      color: 'bg-amber-500',
      trend: '-3%',
    },
    {
      titleKey: 'dashboard.storageUsed',
      value: `${stats.storageUsed} MB`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+8%',
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome', { department: currentDepartment?.name })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.titleKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{card.trend}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{t(card.titleKey)}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('dashboard.recentActivity')}</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.noActivity')}</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('dashboard.pendingTasks')}</h2>
              <CheckSquare className="w-5 h-5 text-gray-400" />
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.noTasks')}</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(task.due_date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

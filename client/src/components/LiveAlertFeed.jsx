import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, BellRing } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { requestNotificationPermission, triggerPushNotification } from '../utils/notificationUtils';
import api from '../utils/api';
import toast from 'react-hot-toast';

const LiveAlertFeed = () => {
  const [alerts, setAlerts] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    // Request push notification permissions on mount
    requestNotificationPermission();

    const fetchInitial = async () => {
      try {
        const res = await api.analytics.getAlerts({ limit: 10 });
        if (res.data && res.data.length > 0) setAlerts(res.data);
      } catch (e) {
        setAlerts([
          { id: 1, type: 'attendance', severity: 'high', ngo_name: 'Delhi NGO', message: 'High attendance discrepancy detected.', created_at: new Date().toISOString() },
          { id: 2, type: 'compliance', severity: 'medium', ngo_name: 'Mumbai Support', message: 'Quarterly compliance audit pending.', created_at: new Date(Date.now() - 3600000).toISOString() },
        ]);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));

      // Trigger In-App Toast
      toast.error(`🚨 ${alert.ngo_name || 'NGO'}: ${alert.message}`, { duration: 6000 });

      // Trigger Browser Push Notification
      triggerPushNotification(`🚨 DoSJE Alert: ${alert.ngo_name || 'Institute'}`, {
        body: alert.message || 'High severity anomaly detected.',
        data: { alertId: alert.id }
      });
    };

    socket.on('new_alert', handleNewAlert);
    return () => socket.off('new_alert', handleNewAlert);
  }, [socket]);

  const markRead = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high': return { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', icon: AlertCircle, iconColor: 'text-rose-600' };
      case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-600' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[420px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
          </span>
          Live Anomaly Feed
        </h3>
        <button
          onClick={() => requestNotificationPermission()}
          className="text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
          title="Enable Push Notifications"
        >
          <BellRing className="w-3 h-3" /> Push Alerts
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-600">All Systems Clear</p>
            <p className="text-[11px] text-slate-400 mt-1">No unread anomaly alerts</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = styles.icon;
            const alertTime = alert.created_at || alert.timestamp || new Date();

            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={`p-3.5 rounded-xl border ${styles.border} ${styles.bg} cursor-pointer hover:shadow-xs transition-all`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-bold text-xs ${styles.text} truncate`}>{alert.ngo_name || 'Monitored Institute'}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {formatDistanceToNow(new Date(alertTime), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${styles.text} font-medium leading-tight opacity-90`}>{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveAlertFeed;

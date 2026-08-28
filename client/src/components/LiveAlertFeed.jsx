import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

const LiveAlertFeed = () => {
  const [alerts, setAlerts] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    // Mock initial fetch
    const fetchInitial = async () => {
      try {
        const res = await api.analytics.getAlerts({ limit: 10 });
        if (res.data) setAlerts(res.data);
      } catch (e) {
        setAlerts([
          { id: 1, type: 'anomaly', severity: 'high', ngo_name: 'Hope Foundation', message: 'Sudden drop in attendance detected.', timestamp: new Date(Date.now() - 60000) },
          { id: 2, type: 'compliance', severity: 'medium', ngo_name: 'Care India', message: 'Quarterly report delayed.', timestamp: new Date(Date.now() - 3600000) },
        ]);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    };

    socket.on('new_alert', handleNewAlert);
    return () => socket.off('new_alert', handleNewAlert);
  }, [socket]);

  const markRead = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, iconColor: 'text-red-500' };
      case 'medium': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, iconColor: 'text-orange-500' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500' };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Alerts
        </h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{alerts.length} updates</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-2" />
            <p>All clear! No active alerts.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const Icon = styles.icon;
            return (
              <div 
                key={alert.id} 
                onClick={() => markRead(alert.id)}
                className={`p-3 rounded-lg border ${styles.border} ${styles.bg} cursor-pointer hover:shadow-md transition-all animate-in slide-in-from-top-2`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${styles.iconColor}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold text-sm ${styles.text}`}>{alert.ngo_name}</span>
                      <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                    </div>
                    <p className={`text-sm mt-1 ${styles.text} opacity-90`}>{alert.message}</p>
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

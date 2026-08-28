import React from 'react';
import { Calendar, User, ArrowRight, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';

const InspectionCard = ({ inspection, onStart, onView }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{inspection.ngo_name}</h3>
          <p className="text-sm text-gray-500 mt-1">ID: #{inspection.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getPriorityStyles(inspection.priority)}`}>
            {inspection.priority}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getStatusStyles(inspection.status)}`}>
            {inspection.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          Scheduled: {format(new Date(inspection.scheduled_date), 'MMM dd, yyyy')}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          Inspector: {inspection.inspector_name}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        {inspection.status === 'pending' ? (
          <button
            onClick={() => onStart(inspection)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4" /> Start Inspection
          </button>
        ) : (
          <button
            onClick={() => onView(inspection)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default InspectionCard;

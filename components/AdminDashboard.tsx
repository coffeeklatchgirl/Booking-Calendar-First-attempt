import React from 'react';
import { AppointmentRequest, AppointmentSlot, AppointmentStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from './icons';

interface AdminDashboardProps {
  requests: AppointmentRequest[];
  onStatusChange: (requestId: string, slotId: string, newStatus: AppointmentStatus) => void;
  onBulkStatusChange: (requestId: string, newStatus: AppointmentStatus) => void;
}

const statusStyles: Record<AppointmentStatus, { bg: string, text: string, icon: React.ReactElement }> = {
  [AppointmentStatus.Pending]: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClockIcon className="w-5 h-5 text-yellow-500" /> },
  [AppointmentStatus.Accepted]: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircleIcon className="w-5 h-5 text-green-500" /> },
  [AppointmentStatus.Denied]: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircleIcon className="w-5 h-5 text-red-500" /> },
};

const SlotItem: React.FC<{
    slot: AppointmentSlot;
    requestId: string;
    onStatusChange: (requestId: string, slotId: string, newStatus: AppointmentStatus) => void;
}> = ({ slot, requestId, onStatusChange }) => {
    const { bg, text, icon } = statusStyles[slot.status];

    return (
        <div className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between ${bg}`}>
            <div className="flex items-start gap-3 mb-2 sm:mb-0">
                <div className="mt-1">{icon}</div>
                <div>
                    <p className={`font-semibold ${text}`}>
                        {slot.dateTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {slot.dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p className={`text-sm ${text} font-medium`}>
                        {slot.serviceType} &bull; {slot.numberOfPets} Pet{slot.numberOfPets > 1 ? 's' : ''}{slot.serviceDuration > 0 ? ` / ${slot.serviceDuration} min` : ''}
                    </p>
                     <p className={`text-lg font-bold ${text}`}>${slot.price.toFixed(2)}</p>
                </div>
            </div>
            {slot.status === AppointmentStatus.Pending && (
                <div className="flex gap-2 justify-end flex-shrink-0">
                    <button onClick={() => onStatusChange(requestId, slot.id, AppointmentStatus.Accepted)} className="px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition">Accept</button>
                    <button onClick={() => onStatusChange(requestId, slot.id, AppointmentStatus.Denied)} className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition">Deny</button>
                </div>
            )}
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onStatusChange, onBulkStatusChange }) => {
    const sortedRequests = [...requests].sort((a,b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-primary-dark">Administrator Dashboard</h1>
                <p className="text-neutral-600 mt-1">Review and manage all incoming appointment requests.</p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-neutral-800">No Pending Requests</h2>
                    <p className="text-neutral-500 mt-2">New appointment requests will appear here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedRequests.map(request => {
                        const isAllPending = request.slots.every(s => s.status === AppointmentStatus.Pending);
                        const totalRequestPrice = request.slots.reduce((sum, s) => sum + s.price, 0);

                        return (
                            <div key={request.id} className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="border-b border-neutral-200 pb-4 mb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900">{request.customerName}</h3>
                                        <p className="text-sm text-neutral-600">{request.customerEmail} &bull; {request.customerPhone}</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Submitted on {request.submittedAt.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-neutral-600">Total</p>
                                            <p className="text-2xl font-bold text-primary-dark">${totalRequestPrice.toFixed(2)}</p>
                                        </div>
                                        {isAllPending && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button onClick={() => onBulkStatusChange(request.id, AppointmentStatus.Accepted)} className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:opacity-90 transition">Accept All</button>
                                                <button onClick={() => onBulkStatusChange(request.id, AppointmentStatus.Denied)} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Deny All</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {request.slots.map(slot => (
                                        <SlotItem key={slot.id} slot={slot} requestId={request.id} onStatusChange={onStatusChange} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
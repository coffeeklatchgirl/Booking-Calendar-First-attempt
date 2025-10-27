import React, { useState, useCallback } from 'react';
import { CustomerForm } from './components/CustomerForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AppointmentRequest, View, AppointmentStatus } from './types';
import { CheckCircleIcon } from './components/icons';

const PinkPetPalLogo = () => (
    <div>
        <span className="text-3xl font-bold text-primary align-middle">
            Pink Pet Pal
            <sup className="text-sm font-bold text-neutral-900 ml-1">TM</sup>
        </span>
        <p className="text-sm text-neutral-600 -mt-1">Because Peace of Mind is Priceless!</p>
    </div>
);

const SubmissionSuccess: React.FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl mx-auto border-t-4 border-primary">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-neutral-800">Request Submitted!</h2>
        <p className="text-neutral-600 mt-2 text-lg">
            Thank you! We've received your appointment request and will get back to you shortly.
        </p>
        <button 
          onClick={onReset}
          className="mt-8 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          Book More Appointments
        </button>
    </div>
);


const App: React.FC = () => {
  const [view, setView] = useState<View>('customer');
  const [customerView, setCustomerView] = useState<'form' | 'success'>('form');
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);

  const handleRequestSubmit = useCallback((requestData: Omit<AppointmentRequest, 'id' | 'submittedAt'>) => {
    const newRequest: AppointmentRequest = {
      ...requestData,
      id: `req-${new Date().getTime()}`,
      submittedAt: new Date(),
    };
    setAppointmentRequests(prev => [...prev, newRequest]);
    setCustomerView('success');
    console.log("--- New Appointment Request ---");
    console.log("This simulates an email notification to the administrator.");
    console.log(JSON.stringify(newRequest, null, 2));
    console.log("-------------------------------");
  }, []);
  
  const handleStatusChange = useCallback((requestId: string, slotId: string, newStatus: AppointmentStatus) => {
    setAppointmentRequests(prev => 
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            slots: req.slots.map(slot => 
              slot.id === slotId ? { ...slot, status: newStatus } : slot
            ),
          };
        }
        return req;
      })
    );
  }, []);

  const handleBulkStatusChange = useCallback((requestId: string, newStatus: AppointmentStatus) => {
    setAppointmentRequests(prev => 
      prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            slots: req.slots.map(slot => ({ ...slot, status: newStatus })),
          };
        }
        return req;
      })
    );
  }, []);

  const handleViewChange = (newView: View) => {
    if (newView === 'customer') {
      setCustomerView('form');
    }
    setView(newView);
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                 <PinkPetPalLogo />
                 <div className="flex items-center space-x-2 bg-neutral-200 p-1 rounded-full">
                     <button
                        onClick={() => handleViewChange('customer')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${view === 'customer' ? 'bg-white text-primary-dark shadow' : 'text-neutral-700 hover:bg-neutral-300'}`}
                    >
                        Customer View
                    </button>
                    <button
                        onClick={() => handleViewChange('admin')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors relative ${view === 'admin' ? 'bg-white text-primary-dark shadow' : 'text-neutral-700 hover:bg-neutral-300'}`}
                    >
                        Admin View
                        {appointmentRequests.some(req => req.slots.some(s => s.status === AppointmentStatus.Pending)) && (
                             <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-accent ring-2 ring-white"></span>
                        )}
                    </button>
                 </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'customer' ? (
          customerView === 'form' ? (
            <CustomerForm onSubmit={handleRequestSubmit} />
          ) : (
            <SubmissionSuccess onReset={() => setCustomerView('form')} />
          )
        ) : (
          <AdminDashboard 
            requests={appointmentRequests} 
            onStatusChange={handleStatusChange}
            onBulkStatusChange={handleBulkStatusChange}
          />
        )}
      </main>
    </div>
  );
};

export default App;

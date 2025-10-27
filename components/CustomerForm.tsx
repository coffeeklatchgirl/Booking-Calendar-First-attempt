
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppointmentStatus, AppointmentRequest, AppointmentSlot } from '../types';
import { CalendarIcon, CheckCircleIcon, TrashIcon, UserIcon, ServiceIcon, DollarIcon } from './icons';

interface CustomerFormProps {
  onSubmit: (request: Omit<AppointmentRequest, 'id' | 'submittedAt'>) => void;
}

const timeCategories = {
  Morning: { start: 9, label: '9am - 12pm' },
  Midday: { start: 12, label: '12pm - 4pm' },
  Evening: { start: 16, label: '4pm - 8pm' },
} as const;

type TimeCategory = keyof typeof timeCategories;

const serviceData = {
  'Drop-In': [
    { numPets: 1, duration: 30, price: 25 }, { numPets: 1, duration: 45, price: 30 }, { numPets: 1, duration: 60, price: 35 },
    { numPets: 2, duration: 30, price: 30 }, { numPets: 2, duration: 45, price: 35 }, { numPets: 2, duration: 60, price: 40 },
    { numPets: 3, duration: 45, price: 40 }, { numPets: 3, duration: 60, price: 45 },
    { numPets: 4, duration: 60, price: 50 },
    { numPets: 5, duration: 60, price: 55 },
    { numPets: 6, duration: 60, price: 60 },
  ],
  'Overnight (8pm - 8am)': [
    { numPets: 1, price: 100 },
    { numPets: 2, price: 125 },
    { numPets: 3, price: 150 },
  ],
  'Daytime Care': [
    { numPets: 1, price: 120 },
    { numPets: 2, price: 145 },
  ],
  '24-Hour Care': [
    { numPets: 1, price: 165 },
    { numPets: 2, price: 190 },
  ]
};

type ServiceType = keyof typeof serviceData;
const serviceTypeOptions = Object.keys(serviceData) as ServiceType[];


const Calendar: React.FC<{
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    slotsWithDates: Set<string>;
}> = ({ selectedDate, setSelectedDate, slotsWithDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const daysInMonth = useMemo(() => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const days: (Date | null)[] = [];
        const firstDayOfWeek = date.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        while (date.getMonth() === currentMonth.getMonth()) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentMonth]);

    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + offset);
            return newMonth;
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-neutral-100">&lt;</button>
                <h3 className="font-bold text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-neutral-100">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-neutral-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-semibold">{day}</div>)}
                {daysInMonth.map((day, i) => (
                    day ? (
                        <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedDate(day)}
                            disabled={day < new Date(new Date().setDate(new Date().getDate() - 1))}
                            className={`p-2 rounded-full relative ${
                                day.toDateString() === selectedDate.toDateString() ? 'bg-primary text-white' : 
                                isToday(day) ? 'bg-pink-300 text-white' : 
                                'hover:bg-neutral-100'
                            } ${day < new Date(new Date().setDate(new Date().getDate() - 1)) ? 'text-neutral-300 cursor-not-allowed' : ''}`}
                        >
                            {day.getDate()}
                            {slotsWithDates.has(day.toDateString()) && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary"></span>}
                        </button>
                    ) : <div key={i}></div>
                ))}
            </div>
        </div>
    );
};

type SelectedSlot = {
    id: string;
    date: Date;
    category: TimeCategory;
    serviceType: string;
    numberOfPets: number;
    serviceDuration: number;
    price: number;
};

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [serviceType, setServiceType] = useState<ServiceType>('Drop-In');
  const [numPets, setNumPets] = useState<number>(1);
  const [duration, setDuration] = useState<number | ''>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const petOptions = useMemo(() => {
    const serviceOptions = serviceData[serviceType];
    const uniquePetCounts = [...new Set(serviceOptions.map(s => s.numPets))];
    
    if (serviceType === '24-Hour Care') {
      return [1, 2, 3, 4, 5, 6];
    }

    return uniquePetCounts.sort((a,b) => a - b);
  }, [serviceType]);

  const durationOptions = useMemo(() => {
    if (serviceType !== 'Drop-In') return [];
    const serviceOptions = serviceData[serviceType] as { numPets: number; duration: number; price: number }[];
    const relevantDurations = serviceOptions.filter(s => s.numPets === numPets).map(s => s.duration);
    return [...new Set(relevantDurations)].sort((a, b) => a - b);
  }, [numPets, serviceType]);

  useEffect(() => {
    const newPetOptions = petOptions;
    if (!newPetOptions.includes(numPets)) {
        setNumPets(newPetOptions[0] || 1);
    }
  }, [serviceType, petOptions]);

  useEffect(() => {
    if (serviceType === 'Drop-In') {
      const newDurationOptions = durationOptions;
      if (!newDurationOptions.includes(duration as number)) {
        setDuration(newDurationOptions[0] || '');
      }
    } else {
      setDuration('');
    }
  }, [serviceType, numPets, durationOptions]);

  useEffect(() => {
    const options = serviceData[serviceType];
    let price: number | null = null;

    if (serviceType === 'Drop-In') {
        const service = (options as { numPets: number; duration: number; price: number }[]).find(s => s.numPets === numPets && s.duration === duration);
        if (service) price = service.price;
    } else if (serviceType === '24-Hour Care') {
        const basePrice1Pet = 165;
        price = basePrice1Pet + (numPets - 1) * 25;
    } else {
        const service = (options as { numPets: number; price: number }[]).find(s => s.numPets === numPets);
        if (service) price = service.price;
    }
    
    setCurrentPrice(price);
  }, [serviceType, numPets, duration]);

  const selectedSlotsByDate = useMemo(() => {
    const dates = new Set<string>();
    selectedSlots.forEach(slot => dates.add(slot.date.toDateString()));
    return dates;
  }, [selectedSlots]);
  
  const handleRemoveSlotById = useCallback((id: string) => {
    setSelectedSlots(prev => prev.filter(s => s.id !== id));
  }, []);
  
  const handleToggleSlot = useCallback((category: TimeCategory) => {
    const slotIndex = selectedSlots.findIndex(slot =>
        slot.date.toDateString() === selectedDate.toDateString() && slot.category === category
    );

    if (slotIndex > -1) {
        handleRemoveSlotById(selectedSlots[slotIndex].id);
    } else {
        if (currentPrice !== null) {
            const newSlot: SelectedSlot = {
                id: `${Date.now()}-${Math.random()}`, date: selectedDate, category,
                serviceType, numberOfPets: numPets,
                serviceDuration: serviceType === 'Drop-In' && duration !== '' ? duration : 0,
                price: currentPrice,
            };
            setSelectedSlots(prev => [...prev, newSlot].sort((a, b) => a.date.getTime() - b.date.getTime()));
        }
    }
  }, [selectedDate, selectedSlots, handleRemoveSlotById, currentPrice, numPets, serviceType, duration]);

  const handleToggleFullDayService = useCallback(() => {
      const existingSlotIndex = selectedSlots.findIndex(s => s.date.toDateString() === selectedDate.toDateString() && s.serviceType === serviceType);

      if (existingSlotIndex > -1) {
          handleRemoveSlotById(selectedSlots[existingSlotIndex].id);
      } else {
          if (currentPrice !== null) {
              let categoryForTime: TimeCategory = 'Morning';
              if (serviceType.startsWith('Overnight')) {
                  categoryForTime = 'Evening';
              }
              const newSlot: SelectedSlot = {
                  id: `${Date.now()}-${Math.random()}`, date: selectedDate, category: categoryForTime,
                  serviceType, numberOfPets: numPets, serviceDuration: 0, price: currentPrice,
              };
              setSelectedSlots(prev => [...prev, newSlot].sort((a, b) => a.date.getTime() - b.date.getTime()));
          }
      }
  }, [selectedDate, selectedSlots, handleRemoveSlotById, currentPrice, numPets, serviceType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !street || !city || !state || !zip || selectedSlots.length === 0) {
      alert('Please fill in all fields and select at least one appointment slot.');
      return;
    }
    const request: Omit<AppointmentRequest, 'id' | 'submittedAt'> = {
      customerName, customerEmail, customerPhone,
      customerAddress: { street, city, state, zip },
      slots: selectedSlots.map(slot => {
        const dateTime = new Date(slot.date);
        dateTime.setHours(timeCategories[slot.category].start, 0, 0, 0);
        return {
          id: slot.id, dateTime: dateTime, status: AppointmentStatus.Pending,
          serviceType: slot.serviceType, numberOfPets: slot.numberOfPets,
          serviceDuration: slot.serviceDuration, price: slot.price,
        }
      }),
    };
    onSubmit(request);
    setCustomerName(''); setCustomerEmail(''); setCustomerPhone(''); setSelectedSlots([]);
    setStreet(''); setCity(''); setState(''); setZip('');
  };

  const totalPrice = useMemo(() => selectedSlots.reduce((sum, s) => sum + s.price, 0), [selectedSlots]);
  
  const isFullDayServiceAddedForDate = useMemo(() => {
    if (serviceType === 'Drop-In') return false;
    return selectedSlots.some(slot => slot.date.toDateString() === selectedDate.toDateString() && slot.serviceType === serviceType);
  }, [selectedDate, selectedSlots, serviceType]);

  const isFormInvalid = !customerName || !customerEmail || !customerPhone || !street || !city || !state || !zip || selectedSlots.length === 0;

  return (
    <div>
      <h1 className="text-4xl font-bold text-primary-dark mb-8 text-center">Request a Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-secondary p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2 text-primary"/> Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
            <input type="email" placeholder="Email Address" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
            <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <input type="text" placeholder="Street Address" value={street} onChange={e => setStreet(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
            <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
            <input type="text" placeholder="Zip Code" value={zip} onChange={e => setZip(e.target.value)} required className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                      <ServiceIcon className="w-6 h-6 mr-2 text-primary"/> Select Service
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="flex flex-col">
                          <label className="text-sm font-semibold mb-1 text-neutral-600">Service Type</label>
                          <select value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                              {serviceTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                      </div>
                      <div className="flex flex-col">
                          <label className="text-sm font-semibold mb-1 text-neutral-600">Number of Pets</label>
                          <select value={numPets} onChange={e => setNumPets(Number(e.target.value))} className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition">
                             {petOptions.map(p => <option key={p} value={p}>{p} Pet{p > 1 ? 's' : ''}</option>)}
                          </select>
                      </div>
                      {serviceType === 'Drop-In' && (
                      <div className="flex flex-col">
                          <label className="text-sm font-semibold mb-1 text-neutral-600">Length of Service</label>
                          <select value={duration} onChange={e => setDuration(Number(e.target.value))} disabled={durationOptions.length === 0} className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:bg-neutral-100">
                              {durationOptions.map(d => <option key={d} value={d}>{d} Minutes</option>)}
                          </select>
                      </div>
                      )}
                  </div>
                   {serviceType === '24-Hour Care' && (
                    <div className="mt-4 p-3 bg-secondary/40 rounded-lg text-sm text-primary-dark flex items-start gap-3">
                        <InfoIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>Please Note:</strong> The price starts at $165 for one pet and increases by $25 for each additional pet.
                        </span>
                    </div>
                  )}
                  <div className="mt-4 bg-primary-light/10 p-4 rounded-lg flex items-center justify-center text-center">
                      <DollarIcon className="w-8 h-8 mr-3 text-primary"/>
                      <div>
                          <p className="text-sm font-semibold text-primary-dark">Price per Visit</p>
                          <p className="text-3xl font-bold text-primary-dark">{currentPrice !== null ? `$${currentPrice.toFixed(2)}` : 'Select options'}</p>
                      </div>
                  </div>
              </div>
              <div className="bg-secondary p-6 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                      <CalendarIcon className="w-6 h-6 mr-2 text-primary"/> Select Date(s) & Time(s)
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} slotsWithDates={selectedSlotsByDate} />
                      {serviceType === 'Drop-In' ? (
                        <div className="space-y-4">
                            <p className="font-semibold text-center text-neutral-700">Add times for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            {(Object.keys(timeCategories) as TimeCategory[]).map(category => {
                                const isSelected = selectedSlots.some(slot => slot.date.toDateString() === selectedDate.toDateString() && slot.category === category);
                                return (
                                    <button type="button" key={category} onClick={() => handleToggleSlot(category)} disabled={currentPrice === null && !isSelected} className={`w-full p-3 rounded-lg text-left transition-colors disabled:bg-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-500 ${isSelected ? 'bg-primary text-white shadow' : 'bg-neutral-100 hover:bg-primary/10'}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{category}</p>
                                                <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-neutral-600'}`}>{timeCategories[category].label}</p>
                                            </div>
                                            {isSelected && <CheckCircleIcon className="w-6 h-6" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                      ) : (
                        <div className="space-y-4 flex flex-col items-center justify-center bg-white/50 p-4 rounded-lg h-full">
                            <h4 className="text-lg font-bold text-neutral-800 text-center">{serviceType}</h4>
                            <p className="text-neutral-600 text-center mb-4">This is a full-day or overnight service.</p>
                            <button type="button" onClick={handleToggleFullDayService} disabled={currentPrice === null} className={`w-full max-w-xs p-4 rounded-lg font-bold transition-colors shadow disabled:bg-neutral-300 disabled:cursor-not-allowed ${isFullDayServiceAddedForDate ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:opacity-90 text-white'}`}>
                                {isFullDayServiceAddedForDate ? 'Remove Service' : `Add for ${selectedDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`}
                            </button>
                        </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Selected Appointments</h2>
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
                  {selectedSlots.length > 0 ? selectedSlots.map(slot => (
                      <div key={slot.id} className="flex justify-between items-center bg-neutral-100 p-3 rounded-lg text-sm">
                          <div>
                              {slot.serviceType === 'Drop-In' ? (
                                <p className="font-semibold">{slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {slot.category}</p>
                              ) : (
                                <p className="font-semibold">{slot.serviceType} on {slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                              )}
                              <p className="text-xs text-neutral-600">{slot.numberOfPets} Pet{slot.numberOfPets > 1 ? 's' : ''}{slot.serviceDuration > 0 ? `, ${slot.serviceDuration} min` : ''}</p>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="font-bold text-neutral-700">${slot.price.toFixed(2)}</span>
                              <button type="button" onClick={() => handleRemoveSlotById(slot.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100">
                                  <TrashIcon />
                              </button>
                          </div>
                      </div>
                  )) : (
                      <p className="text-neutral-500 text-center py-8">Select a service, then add appointments.</p>
                  )}
              </div>
              {selectedSlots.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed">
                      <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total Price:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                      </div>
                  </div>
              )}
               <button type="submit" disabled={isFormInvalid} className="w-full mt-6 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:bg-neutral-300 disabled:cursor-not-allowed">
                  Submit Request for {selectedSlots.length} Appointment{selectedSlots.length !== 1 ? 's' : ''}
              </button>
          </div>
        </div>
      </form>
    </div>
  );
};

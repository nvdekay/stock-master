import React from 'react';
import { FaBox, FaTruck, FaCheckCircle } from 'react-icons/fa';

const DeliveryProgress = ({ status }) => {
    const steps = ['assigned', 'in_transit', 'delivered'];
    const labels = {
        assigned: 'Assigned',
        in_transit: 'In Transit',
        delivered: 'Delivered'
    };

    const currentIndex = steps.indexOf(status);

    const getColor = (stepIndex) => {
        if (status === 'delivered') return '#28a745';
        if (stepIndex <= currentIndex) return '#28a745';
        if (stepIndex === currentIndex + 1) return '#ffc107';
        return '#ced4da';
    };

    const getIcon = (step, color) => {
        switch (step) {
            case 'assigned': return <FaBox size={28} color={color} />;
            case 'in_transit': return <FaTruck size={28} color={color} />;
            case 'delivered': return <FaCheckCircle size={28} color={color} />;
            default: return null;
        }
    };

    return (
        <div className="d-flex justify-content-between align-items-center mb-4 px-5">
            {steps.map((step, index) => (
                <div className="text-center flex-fill" key={step}>
                    {getIcon(step, getColor(index))}
                    <div style={{ color: getColor(index), fontWeight: 'bold', marginTop: 4 }}>{labels[step]}</div>
                    {index < steps.length - 1 && (
                        <div
                            style={{
                                height: '4px',
                                backgroundColor: getColor(index),
                                marginTop: 8,
                                width: '100%'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default DeliveryProgress;
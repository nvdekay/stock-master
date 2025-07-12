import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import ShipperSidebar from '../components/shipper/ShipperSidebar';

const ShipperLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8f9fa',
            display: 'flex',
            position: 'relative',
            overflow: 'auto'
        }}>
            <ShipperSidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {isSidebarCollapsed && (
                <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="d-flex align-items-center justify-content-center"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#007bff',
                        border: 'none',
                        color: 'white',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
                        zIndex: 2000
                    }}
                >
                    <i className="fas fa-bars"></i>
                </button>
            )}

            <main style={{
                flex: 1,
                marginLeft: isSidebarCollapsed ? '0px' : '260px',
                transition: 'margin-left 0.3s ease-in-out',
                minHeight: '100vh',
                padding: '20px',
                overflow: 'auto'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default ShipperLayout;
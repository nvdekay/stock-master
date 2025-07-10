import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerSidebar from '../components/manager/ManagerSidebar';

function ManagerLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f8f9fa',
            display: 'flex',
            position: 'relative'
        }}>
            <ManagerSidebar 
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
                minHeight: '100vh'
            }}>
                <Outlet />
            </main>
        </div>
    );
}

export default ManagerLayout;
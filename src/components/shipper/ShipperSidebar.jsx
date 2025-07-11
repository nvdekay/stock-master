import { useLocation, useNavigate } from 'react-router-dom';

function ShipperSidebar({ isCollapsed, setIsCollapsed }) {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: 'fas fa-truck', label: 'Assigned Shipments', path: '/shipper' },
        { icon: 'fas fa-check-circle', label: 'Completed Deliveries', path: '/shipper/completed' },
        { icon: 'fas fa-history', label: 'Delivery History', path: '/shipper/history' }
    ];

    return (
        <>
            {!isCollapsed && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '260px',
                        height: '100vh',
                        background: 'white',
                        borderRight: '1px solid #dee2e6',
                        zIndex: 1000,
                        transition: 'left 0.3s ease-in-out',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="text-muted mb-0">SHIPPER</h5>
                            <button
                                className="btn btn-link p-0 text-muted"
                                onClick={() => setIsCollapsed(true)}
                                style={{ fontSize: '16px' }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="list-group list-group-flush">
                            {menuItems.map((item, index) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <a
                                        key={index}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(item.path);
                                        }}
                                        className={`list-group-item list-group-item-action d-flex align-items-center ${isActive ? 'active' : ''}`}
                                        style={{
                                            border: 'none',
                                            borderRadius: '8px',
                                            marginBottom: '4px',
                                            backgroundColor: isActive ? '#007bff' : 'transparent',
                                            color: isActive ? 'white' : '#212529'
                                        }}
                                    >
                                        <i className={`${item.icon} ${isActive ? 'text-white' : 'text-muted'} me-3`}></i>
                                        {item.label}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {!isCollapsed && window.innerWidth < 768 && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                    onClick={() => setIsCollapsed(true)}
                />
            )}
        </>
    );
}

export default ShipperSidebar;
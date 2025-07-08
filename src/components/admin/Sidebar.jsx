import React, { useState } from 'react';
import {
    Home,
    Package,
    Users,
    ShoppingCart,
    Truck,
    BarChart3,
    Settings,
    FileText,
    UserCheck,
    ChevronRight,
} from 'lucide-react';

const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/dashboard',
    },
    {
        id: 'inventory',
        label: 'Inventory',
        icon: Package,
        children: [
            { id: 'products', label: 'Products', icon: Package, href: '/inventory/products' },
            { id: 'categories', label: 'Categories', icon: Package, href: '/inventory/categories' },
        ],
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingCart,
        children: [
            { id: 'all-orders', label: 'All Orders', icon: ShoppingCart, href: '/orders/all' },
            { id: 'pending', label: 'Pending', icon: ShoppingCart, href: '/orders/pending' },
            { id: 'completed', label: 'Completed', icon: ShoppingCart, href: '/orders/completed' },
        ],
    },
    {
        id: 'shipping',
        label: 'Shipping',
        icon: Truck,
        children: [
            { id: 'shipments', label: 'Shipments', icon: Truck, href: '/shipping/shipments' },
            { id: 'tracking', label: 'Tracking', icon: Truck, href: '/shipping/tracking' },
        ],
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: BarChart3,
        children: [
            { id: 'sales', label: 'Sales Report', icon: BarChart3, href: '/reports/sales' },
            { id: 'inventory-report', label: 'Inventory Report', icon: FileText, href: '/reports/inventory' },
        ],
    },
    {
        id: 'admin',
        label: 'Administration',
        icon: UserCheck,
        children: [
            { id: 'accounts', label: 'Accounts', icon: Users, href: '/admin/accounts', active: true },
            { id: 'roles', label: 'Roles & Permissions', icon: UserCheck, href: '/admin/roles' },
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];

const Sidebar = () => {
    // mặc định mở nhóm 'dashboard'
    const [expandedItems, setExpandedItems] = useState(['dashboard']);

    const toggleExpanded = (itemId) => {
        setExpandedItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );
    };

    const renderMenuItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const Icon = item.icon;

        return (
            <div key={item.id}>
                <div
                    className={`d-flex align-items-center gap-2 px-3 py-2 rounded cursor-pointer mx-2 ${item.active
                        ? 'text-white'
                        : 'text-body'
                        }`}
                    style={{
                        backgroundColor: item.active ? '#1E88E5' : 'transparent',
                        paddingLeft: level > 1 ? '20px' : undefined, // thụt lề nhóm con
                        transition: 'background-color .15s',
                    }}
                    onClick={() => (hasChildren ? toggleExpanded(item.id) : undefined)}
                    onMouseEnter={(e) =>
                        !item.active && (e.currentTarget.style.backgroundColor = '#f8f9fa')
                    }
                    onMouseLeave={(e) =>
                        !item.active && (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                >
                    <Icon size={18} className={item.active ? 'text-white' : 'text-secondary'} />
                    <span className="flex-grow-1 small">{item.label}</span>
                    {hasChildren && (
                        <ChevronRight
                            size={14}
                            style={{
                                transition: 'transform .15s',
                                transform: isExpanded ? 'rotate(90deg)' : 'none',
                            }}
                        />
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1 mb-2">
                        {item.children.map((child) => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside
            className="d-flex flex-column border-end bg-white"
            style={{ width: '16rem', height: '100vh', top: 0, zIndex: 1020 }}
        >
            {/* Navigation */}
            <nav className="flex-grow-1 py-2 overflow-auto hover-overlay">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>
        </aside>
    );
};

export default Sidebar;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home,
    Package,
    Building2,
    Users,
    ShoppingCart,
    Truck,
    Settings,
    ChevronRight,
} from 'lucide-react';

const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/admin/dashboard',
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
    // {
    //     id: 'orders',
    //     label: 'Orders',
    //     icon: ShoppingCart,
    //     children: [
    //         { id: 'all-orders', label: 'All Orders', icon: ShoppingCart, href: '/orders/all' },
    //         { id: 'pending', label: 'Pending', icon: ShoppingCart, href: '/orders/pending' },
    //         { id: 'completed', label: 'Completed', icon: ShoppingCart, href: '/orders/completed' },
    //     ],
    // },
    // {
    //     id: 'shipping',
    //     label: 'Shipping',
    //     icon: Truck,
    //     children: [
    //         { id: 'shipments', label: 'Shipments', icon: Truck, href: '/shipping/shipments' },
    //         { id: 'tracking', label: 'Tracking', icon: Truck, href: '/shipping/tracking' },
    //     ],
    // },
    {
        id: 'enterprises',
        label: 'Manage Enterprises',
        icon: Building2,
        href: '/admin/manage-enterprise',
    },
    {
        id: 'accounts',
        label: 'Manage Accounts',
        icon: Users,
        href: '/admin/manage-account',
    },
];

const Sidebar = () => {
    const [expandedItems, setExpandedItems] = useState(['dashboard']);
    const navigate = useNavigate();

    const toggleExpanded = (itemId) => {
        setExpandedItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );
    };

    const renderMenuItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const Icon = item.icon;

        const handleClick = () => {
            if (hasChildren) {
                toggleExpanded(item.id);
            } else if (item.href) {
                navigate(item.href);
            }
        };

        return (
            <div key={item.id}>
                <div
                    className={`d-flex align-items-center gap-2 px-3 py-2 rounded cursor-pointer mx-2 ${item.active
                        ? 'text-white'
                        : 'text-body'
                        }`}
                    style={{
                        backgroundColor: item.active ? '#1E88E5' : 'transparent',
                        paddingLeft: level > 1 ? '20px' : undefined,
                        transition: 'background-color .15s',
                    }}
                    onClick={handleClick}
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
            <nav className="flex-grow-1 py-2 overflow-auto hover-overlay">
                {menuItems.map((item) => renderMenuItem(item))}
            </nav>
        </aside>
    );
};

export default Sidebar;

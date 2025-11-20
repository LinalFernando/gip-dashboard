import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Settings, LogOut, 
  Bell, Search, User, Briefcase, CheckCircle, 
  Clock, AlertCircle, ChevronRight, Menu, X,
  Building, Mail, Shield, DollarSign, Plus, Edit3
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';

import { getAnalytics } from "firebase/analytics";

// --- FIREBASE CONFIGURATION ---
// NOTE: In a real app, strict security rules should be applied.
const firebaseConfig = {
  apiKey: "AIzaSyDgs3xfpr-759DRQp8ByslkLGGni2JJgAA",
  authDomain: "gip-dashboard-e621d.firebaseapp.com",
  projectId: "gip-dashboard-e621d",
  storageBucket: "gip-dashboard-e621d.firebasestorage.app",
  messagingSenderId: "798346704018",
  appId: "1:798346704018:web:ca4f09ef09545a4149624b",
  measurementId: "G-LCPY0N2YHF"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "gip-dashboard-v1";

// --- MOCK DATA & CONSTANTS ---
const BRAND_COLOR = "bg-orange-600"; // Bizee/GIOP Orange theme
const BRAND_COLOR_HOVER = "hover:bg-orange-700";
const TEXT_BRAND = "text-orange-600";

const AVAILABLE_SERVICES = [
  { id: 'inc', title: 'Business Incorporation', icon: Building, desc: 'Form your LLC or Corp officially.', price: '$199' },
  { id: 'hr', title: 'HR Consulting', icon: User, desc: 'Professional HR strategies for your team.', price: '$299' },
  { id: 'tax', title: 'Tax Filing', icon: DollarSign, desc: 'Annual state and federal tax returns.', price: '$150' },
  { id: 'comp', title: 'Compliance Audit', icon: Shield, desc: 'Ensure your business meets all regulations.', price: '$499' },
  { id: 'mail', title: 'Virtual Mailbox', icon: Mail, desc: 'Secure digital mail scanning service.', price: '$29/mo' },
  { id: 'brand', title: 'Branding Kit', icon: Briefcase, desc: 'Logo, letterheads, and brand identity.', price: '$350' },
];

// --- COMPONENT: LOGIN ---
const LoginScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login check handled by parent via auth state listener, 
  // but we provide manual controls here.

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      // Fallback for demo environment if regular auth fails or is restricted
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
         setError("Standard auth restricted in preview. Logging in anonymously...");
         await signInAnonymously(auth);
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <Building className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GIOP Portal</h1>
          <p className="text-gray-500 text-sm mt-2">Global Institute of People LLC</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all ${BRAND_COLOR} ${BRAND_COLOR_HOVER} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-gray-600 hover:text-orange-600 font-medium"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'New client? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ activeTab, setActiveTab, user, isOpen, toggleSidebar }) => {
  const initials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() 
    : user?.email?.substring(0,2).toUpperCase() || 'CL';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services Marketplace', icon: Briefcase },
    { id: 'orders', label: 'Order History', icon: Clock },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-black italic tracking-tighter text-gray-900">GIP<span className="text-orange-600">.</span></span>
          <span className="ml-2 text-xs font-semibold text-gray-400 tracking-widest">PORTAL</span>
          <button onClick={toggleSidebar} className="ml-auto lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* User Snippet */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`${BRAND_COLOR} h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName || 'Client'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-2">Actions</div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); toggleSidebar(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-orange-50 text-orange-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false); // Demo toggle
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- 1. AUTH INIT ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        // Fallback handled in LoginScreen if needed, or we wait for user action
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    // In a real app, we might separate 'public' orders vs 'private' orders.
    // For this dashboard, we'll store orders in a user-specific private collection.
    const q = query(
      collection(db, 'artifacts', appId, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- ACTIONS ---
  const handleCreateOrder = async (service) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), {
        serviceId: service.id,
        serviceTitle: service.title,
        price: service.price,
        status: 'Pending', // Pending, In Progress, Review, Completed
        progress: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: 'Order initiated by client.'
      });
      alert(`Service "${service.title}" requested successfully! Check your Dashboard.`);
      setActiveTab('dashboard');
    } catch (e) {
      console.error("Error creating order:", e);
      alert("Failed to create order. Please try again.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, newProgress) => {
    if (!user) return;
    try {
      const orderRef = doc(db, 'artifacts', appId, 'users', user.uid, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        progress: newProgress,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating order:", e);
    }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full transform translate-x-20 -translate-y-20 opacity-50"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.displayName || 'Client'}</h2>
                <p className="text-gray-600 max-w-xl">
                  Track your business services, manage compliance, and order new filings directly from your GIOP dashboard.
                </p>
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setActiveTab('services')}
                    className={`${BRAND_COLOR} ${BRAND_COLOR_HOVER} text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all`}
                  >
                    Start New Service
                  </button>
                  <button 
                    onClick={() => setActiveTab('documents')}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    View Documents
                  </button>
                </div>
              </div>
            </div>

            {/* Stats/Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Services</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status !== 'Completed').length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'Completed').length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Action Required</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            {/* Active Jobs Table (Simplified) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Active Services Status</h3>
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className="text-sm text-orange-600 font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {loadingOrders ? (
                  <div className="p-8 text-center text-gray-500">Loading your services...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No active services found. Get started by ordering a service!</div>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${
                            order.status === 'Completed' ? 'bg-green-500' : 
                            order.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="font-semibold text-gray-900">{order.serviceTitle}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Initiated</span>
                        <span>{order.progress}% Complete</span>
                      </div>
                      
                      {/* ADMIN CONTROLS FOR DEMO */}
                      {isAdminMode && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 items-center bg-yellow-50 p-2 rounded-lg border-yellow-200">
                          <span className="text-xs font-bold text-yellow-800 uppercase">Admin:</span>
                          <button onClick={() => handleUpdateStatus(order.id, 'Pending', 10)} className="px-2 py-1 bg-white text-xs border rounded hover:bg-gray-50">Reset</button>
                          <button onClick={() => handleUpdateStatus(order.id, 'In Progress', 50)} className="px-2 py-1 bg-white text-xs border rounded hover:bg-gray-50">Set Progress 50%</button>
                          <button onClick={() => handleUpdateStatus(order.id, 'Completed', 100)} className="px-2 py-1 bg-white text-xs border rounded hover:bg-gray-50">Complete</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Marketplace</h2>
                <p className="text-gray-500 mt-1">Find experts to help make your business happen.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {AVAILABLE_SERVICES.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                    <service.icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-grow">{service.desc}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-900">{service.price}</span>
                    <button 
                      onClick={() => handleCreateOrder(service)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               <table className="w-full text-left text-sm text-gray-600">
                 <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-900">
                   <tr>
                     <th className="p-4">Service</th>
                     <th className="p-4">Date</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 text-right">Price</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {orders.length > 0 ? orders.map(order => (
                     <tr key={order.id} className="hover:bg-gray-50">
                       <td className="p-4 font-medium text-gray-900">{order.serviceTitle}</td>
                       <td className="p-4">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                         }`}>
                           {order.status}
                         </span>
                       </td>
                       <td className="p-4 text-right">{order.price}</td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={4} className="p-8 text-center text-gray-400">No orders found.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Admin Simulation</h3>
              <p className="text-sm text-gray-500">
                Enable this to reveal admin controls on the dashboard. This allows you to manually change the status of services to test the "Client View" updates.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Admin Mode</span>
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isAdminMode ? 'bg-orange-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
               <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Profile Information</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-medium text-gray-500 uppercase">Name</label>
                   <p className="mt-1 text-gray-900">{user?.displayName || 'Not set'}</p>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                   <p className="mt-1 text-gray-900">{user?.email}</p>
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-500 uppercase">Client ID</label>
                   <p className="mt-1 text-gray-900 font-mono text-xs">#{user?.uid.substring(0,8).toUpperCase()}</p>
                 </div>
               </div>
            </div>
          </div>
        );
        
      default:
        return <div className="p-8 text-center text-gray-500">Section Under Construction</div>;
    }
  };

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 hidden md:block">
              {activeTab === 'dashboard' ? 'Overview' : 
               activeTab === 'services' ? 'Services' : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
              <span>📞 (855) GIOP-LLC</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2"></div>
            <button className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm ${BRAND_COLOR} ${BRAND_COLOR_HOVER}`}>
              Start New Company
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
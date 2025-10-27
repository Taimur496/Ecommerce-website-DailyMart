import React from "react";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  Bell,
  Search,
  User,
} from "lucide-react";
const AdminBody = () => {
  return (
    <div>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">156</div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-change positive">+12% from last month</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">2,847</div>
              <div className="stat-label">Active Users</div>
              <div className="stat-change positive">+8% from last month</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">1,239</div>
              <div className="stat-label">Products</div>
              <div className="stat-change negative">-3% from last month</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">$45,678</div>
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-change positive">+15% from last month</div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card">
              <Package size={20} />
              <span>Add Product</span>
            </button>
            <button className="action-card">
              <Users size={20} />
              <span>Manage Users</span>
            </button>
            <button className="action-card">
              <ShoppingCart size={20} />
              <span>View Orders</span>
            </button>
            <button className="action-card">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBody;

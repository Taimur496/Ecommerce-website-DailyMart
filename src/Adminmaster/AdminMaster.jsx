import React, { useEffect } from "react";

const AdminMaster = () => {
  useEffect(() => {
    // Initialize any jQuery plugins here if needed
    // Note: You'll need to load these libraries separately
    if (window.$ && window.$.fn.knob) {
      window.$(".knob").knob();
    }
  }, []);

  return (
    <div className="wrapper">
      {/* Sidebar wrapper */}
      <div className="sidebar-wrapper" data-simplebar="true">
        <div className="sidebar-header">
          <div>
            <img
              src="assets/images/logo-icon.png"
              className="logo-icon"
              alt="logo icon"
            />
          </div>
          <div>
            <h4 className="logo-text">Rukada</h4>
          </div>
          <div className="toggle-icon ms-auto">
            <i className="bx bx-arrow-to-left"></i>
          </div>
        </div>

        {/* Navigation */}
        <ul className="metismenu" id="menu">
          <li>
            <a href="javascript:;" className="has-arrow">
              <div className="parent-icon">
                <i className="bx bx-home-circle"></i>
              </div>
              <div className="menu-title">Dashboard</div>
            </a>
            <ul>
              <li>
                <a href="index.html">
                  <i className="bx bx-right-arrow-alt"></i>Default
                </a>
              </li>
              <li>
                <a href="dashboard-eCommerce.html">
                  <i className="bx bx-right-arrow-alt"></i>eCommerce
                </a>
              </li>
              <li>
                <a href="dashboard-analytics.html">
                  <i className="bx bx-right-arrow-alt"></i>Analytics
                </a>
              </li>
              <li>
                <a href="dashboard-digital-marketing.html">
                  <i className="bx bx-right-arrow-alt"></i>Digital Marketing
                </a>
              </li>
              <li>
                <a href="dashboard-human-resources.html">
                  <i className="bx bx-right-arrow-alt"></i>Human Resources
                </a>
              </li>
            </ul>
          </li>

          <li className="menu-label">UI Elements</li>
          <li>
            <a href="widgets.html">
              <div className="parent-icon">
                <i className="bx bx-cookie"></i>
              </div>
              <div className="menu-title">Widgets</div>
            </a>
          </li>
          <li>
            <a href="javascript:;" className="has-arrow">
              <div className="parent-icon">
                <i className="bx bx-cart"></i>
              </div>
              <div className="menu-title">eCommerce</div>
            </a>
            <ul>
              <li>
                <a href="ecommerce-products.html">
                  <i className="bx bx-right-arrow-alt"></i>Products
                </a>
              </li>
              <li>
                <a href="ecommerce-products-details.html">
                  <i className="bx bx-right-arrow-alt"></i>Product Details
                </a>
              </li>
              <li>
                <a href="ecommerce-add-new-products.html">
                  <i className="bx bx-right-arrow-alt"></i>Add New Products
                </a>
              </li>
              <li>
                <a href="ecommerce-orders.html">
                  <i className="bx bx-right-arrow-alt"></i>Orders
                </a>
              </li>
            </ul>
          </li>

          <li className="menu-label">Charts & Maps</li>
          <li>
            <a className="has-arrow" href="javascript:;">
              <div className="parent-icon">
                <i className="bx bx-line-chart"></i>
              </div>
              <div className="menu-title">Charts</div>
            </a>
            <ul>
              <li>
                <a href="charts-apex-chart.html">
                  <i className="bx bx-right-arrow-alt"></i>Apex
                </a>
              </li>
              <li>
                <a href="charts-chartjs.html">
                  <i className="bx bx-right-arrow-alt"></i>Chartjs
                </a>
              </li>
              <li>
                <a href="charts-highcharts.html">
                  <i className="bx bx-right-arrow-alt"></i>Highcharts
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a className="has-arrow" href="javascript:;">
              <div className="parent-icon">
                <i className="bx bx-map-alt"></i>
              </div>
              <div className="menu-title">Maps</div>
            </a>
            <ul>
              <li>
                <a href="map-google-maps.html">
                  <i className="bx bx-right-arrow-alt"></i>Google Maps
                </a>
              </li>
              <li>
                <a href="map-vector-maps.html">
                  <i className="bx bx-right-arrow-alt"></i>Vector Maps
                </a>
              </li>
            </ul>
          </li>

          <li className="menu-label">Others</li>
          <li>
            <a className="has-arrow" href="javascript:;">
              <div className="parent-icon">
                <i className="bx bx-menu"></i>
              </div>
              <div className="menu-title">Menu Levels</div>
            </a>
            <ul>
              <li>
                <a className="has-arrow" href="javascript:;">
                  <i className="bx bx-right-arrow-alt"></i>Level One
                </a>
                <ul>
                  <li>
                    <a className="has-arrow" href="javascript:;">
                      <i className="bx bx-right-arrow-alt"></i>Level Two
                    </a>
                    <ul>
                      <li>
                        <a href="javascript:;">
                          <i className="bx bx-right-arrow-alt"></i>Level Three
                        </a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <a
              href="https://codervent.com/rukada/documentation/index.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="parent-icon">
                <i className="bx bx-folder"></i>
              </div>
              <div className="menu-title">Documentation</div>
            </a>
          </li>
          <li>
            <a
              href="https://themeforest.net/user/codervent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="parent-icon">
                <i className="bx bx-support"></i>
              </div>
              <div className="menu-title">Support</div>
            </a>
          </li>
        </ul>
        {/* End navigation */}
      </div>
    </div>
  );
};

export default AdminMaster;

import React from "react";

function InventoryDashboardLayout({ inventory = [], loading, onRefresh }) {
  const totalItems = inventory.length;

  const totalStock = inventory.reduce(
    (sum, item) => sum + (item.currentStock || 0),
    0
  );

  const atRiskItems = inventory.filter(
    (item) => item.riskLevel === "Medium"
  ).length;

  const criticalItems = inventory.filter(
    (item) => item.riskLevel === "High"
  ).length;

  const safeItems = inventory.filter((item) => item.riskLevel === "Low").length;

  const getRiskLabel = (riskLevel) => {
    if (riskLevel === "High") return "Critical";
    if (riskLevel === "Medium") return "At Risk";
    return "Safe";
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "High") return "high";
    if (riskLevel === "Medium") return "medium";
    return "low";
  };

  const riskDistribution = [
    { label: "Safe", count: safeItems, className: "safe" },
    { label: "At Risk", count: atRiskItems, className: "at-risk" },
    { label: "Critical", count: criticalItems, className: "critical" }
  ];
  const maxRiskCount = Math.max(...riskDistribution.map((r) => r.count), 1);

  return (
    <section className="panel glass-panel dashboard-layout-panel">
      <div className="panel-header dashboard-panel-with-refresh">
        <h2>Inventory Summary Dashboard</h2>
        {typeof onRefresh === "function" && (
          <button type="button" className="refresh-data-btn" onClick={onRefresh}>
            Refresh Data
          </button>
        )}
      </div>

      <div className="dashboard-summary-grid">
        <div className="dashboard-summary-card">
          <p>Total Items</p>
          <h3>{totalItems}</h3>
        </div>

        <div className="dashboard-summary-card">
          <p>Total Stock</p>
          <h3>{totalStock}</h3>
        </div>

        <div className="dashboard-summary-card">
          <p>At Risk</p>
          <h3>{atRiskItems}</h3>
        </div>

        <div className="dashboard-summary-card">
          <p>Critical</p>
          <h3>⚠️ {criticalItems}</h3>
        </div>
      </div>

      <div className="dashboard-table-card">
        <h3>Inventory Overview</h3>

        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="4">
                  {loading ? "Loading..." : "No inventory data"}
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item._id}>
                  <td>{item.itemName}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.reorderThreshold}</td>
                  <td>
                    <span className={`risk-badge ${getRiskClass(item.riskLevel)}`}>
                      {item.riskLevel === "High" ? "⚠️ " : ""}
                      {getRiskLabel(item.riskLevel)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dashboard-chart-card dashboard-chart-gap">
        <h3>Risk Distribution</h3>

        {inventory.length === 0 ? (
          <p>{loading ? "Loading chart..." : "No inventory data available."}</p>
        ) : (
          <div className="dashboard-bar-chart dashboard-risk-distribution">
            <div className="dashboard-chart-legend">
              <span className="legend-pill legend-safe">Safe</span>
              <span className="legend-pill legend-at-risk">At Risk</span>
              <span className="legend-pill legend-critical">Critical</span>
            </div>
            {riskDistribution.map((row) => (
              <div key={row.label} className="dashboard-bar-row">
                <span className="dashboard-bar-label">{row.label}</span>
                <div className="dashboard-bar-track">
                  <div
                    className={`dashboard-bar-fill risk-dist-${row.className}`}
                    style={{ width: `${(row.count / maxRiskCount) * 100}%` }}
                  />
                </div>
                <span className="dashboard-bar-value">{row.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default InventoryDashboardLayout;

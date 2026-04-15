import React, { useState } from "react";

function InventoryRiskLayout({
  inventory = [],
  loading = false,
  backendConnected = false,
  fetchInventory
}) {
  const [filterOption, setFilterOption] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const safeItems = inventory.filter((item) => item.riskLevel === "Low");
  const atRiskItems = inventory.filter((item) => item.riskLevel === "Medium");
  const criticalItems = inventory.filter((item) => item.riskLevel === "High");

  const sectionConfigs = [
    {
      key: "critical",
      riskLevel: "High",
      title: "Critical (High Risk)",
      items: criticalItems,
      emptyText: "No critical items right now.",
      className: "risk-status-card critical-section"
    },
    {
      key: "atRisk",
      riskLevel: "Medium",
      title: "At Risk (Medium Risk)",
      items: atRiskItems,
      emptyText: "No at-risk items right now.",
      className: "risk-status-card at-risk-section"
    },
    {
      key: "safe",
      riskLevel: "Low",
      title: "Safe (Low Risk)",
      items: safeItems,
      emptyText: "No safe items right now.",
      className: "risk-status-card safe-section"
    }
  ];

  const displayedSections = (() => {
    const filtered = sectionConfigs.filter((section) => (
      filterOption === "all" || filterOption === section.key
    ));

    if (sortBy !== "risk") return filtered;

    const rank = { Low: 1, Medium: 2, High: 3 };
    return [...filtered].sort((a, b) => {
      const left = rank[a.riskLevel] ?? 0;
      const right = rank[b.riskLevel] ?? 0;
      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  })();

  const sortItems = (items) => {
    const riskRank = { High: 3, Medium: 2, Low: 1 };
    return [...items].sort((a, b) => {
      let left;
      let right;

      if (sortBy === "stock") {
        left = Number(a.currentStock) || 0;
        right = Number(b.currentStock) || 0;
      } else if (sortBy === "risk") {
        left = riskRank[a.riskLevel] ?? 0;
        right = riskRank[b.riskLevel] ?? 0;
      } else {
        left = (a.itemName || "").toLowerCase();
        right = (b.itemName || "").toLowerCase();
      }

      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderItems = (items, emptyText) => {
    if (items.length === 0) {
      return <p className="risk-empty-text">{emptyText}</p>;
    }

    return (
      <div className="risk-item-list">
        {items.map((item) => (
          <div key={item._id} className="risk-item">
            <div className="risk-item-left">
          {item.riskLevel === "High" && <span className="critical-icon" title="Needs immediate action">!</span>}
          <span className="risk-item-name">{item.itemName}</span>
            </div>
            <span className="risk-stock">
              Stock: {item.currentStock} · Threshold: {item.reorderThreshold}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const filterSubtitle = (() => {
    if (filterOption === "all") return "Inventory Risk Alerts";
    if (filterOption === "critical") return "Risk Alerts — Critical Only";
    if (filterOption === "atRisk") return "Risk Alerts — At Risk Only";
    return "Risk Alerts — Safe Only";
  })();

  const filterFootnote = (() => {
    if (filterOption === "critical") {
      return "Only critical items are shown. “!” marks items that need immediate attention.";
    }
    if (filterOption === "atRisk") return "Showing at-risk items only.";
    if (filterOption === "safe") return "Showing safe items only.";
    return null;
  })();

  return (
    <section className="panel glass-panel risk-layout-panel">
<div className="panel-header risk-header">
  <h2>{filterSubtitle}</h2>

  <div className="panel-header-actions">
    <button className="refresh-btn" onClick={fetchInventory}>
      🔄 Refresh
    </button>
  </div>
</div>

      {backendConnected && !loading && inventory.length > 0 && (
        <div className="risk-filter-bar">
          <label htmlFor="riskFilter">Filter View:</label>
          <select
            id="riskFilter"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="risk-filter-select"
          >
            <option value="all">All Items</option>
            <option value="safe">Safe Only</option>
            <option value="atRisk">At Risk Only</option>
            <option value="critical">Critical Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="risk-filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock Count</option>
            <option value="risk">Sort by Risk</option>
          </select>
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            className="risk-filter-select"
          >
            <option value="asc">Top to Bottom (Asc)</option>
            <option value="desc">Bottom to Top (Desc)</option>
          </select>
        </div>
      )}

      {!backendConnected ? (
        <div className="risk-empty-state">
          <h3>Backend not connected</h3>
          <p>Risk alerts will appear here when inventory data becomes available.</p>
        </div>
      ) : loading ? (
        <div className="risk-empty-state">
          <h3>Loading risk alerts...</h3>
          <p>Please wait while inventory data is being loaded.</p>
        </div>
      ) : inventory.length === 0 ? (
        <div className="risk-empty-state">
          <h3>No inventory items yet</h3>
          <p>Add inventory items to see Safe, At Risk, and Critical sections update.</p>
        </div>
      ) : (
        <div className="risk-grid">
          {displayedSections.map((section) => (
            <div key={section.key} className={section.className}>
              <div className="risk-status-header">
                <h3>{section.title}</h3>
                <span className="risk-count">{section.items.length}</span>
              </div>
              {renderItems(sortItems(section.items), section.emptyText)}
            </div>
          ))}
        </div>
      )}

      {filterFootnote && (
        <p className="risk-filter-hint" role="note">
          {filterFootnote}
        </p>
      )}
    </section>
  );
}

export default InventoryRiskLayout;
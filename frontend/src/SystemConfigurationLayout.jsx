import React, { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmationBanner from "./ConfirmationBanner";
import "./SystemConfiguration.css";

function SystemConfigurationLayout() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const defaultSettings = {
    systemName: "StockGuard System",
    organizationName: "Default Organization",
    timezone: "America/Toronto",
    language: "English",
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoRiskCalculation: true,
    emailAlerts: true,
    lowStockAlerts: true,
    criticalAlerts: true,
    sessionTimeout: 30,
    roleBasedAccess: true,
    auditLogging: true,
    darkMode: false,
    refreshInterval: 15
  };

  const defaultHealth = {
    server: {
      status: "unknown",
      port: "-"
    },
    api: {
      status: "unknown",
      message: "Checking API status..."
    },
    database: {
      connected: false,
      readyState: 0,
      stateLabel: "unknown",
      displayUri: "Not available"
    },
    timestamp: null,
    uptime: 0
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [initialSettings, setInitialSettings] = useState(defaultSettings);
  const [health, setHealth] = useState(defaultHealth);
  const [healthLoading, setHealthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = useCallback((text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
    setMessageType("");
  }, []);

  const normalizeSettings = useCallback(
    (input) => ({
      ...defaultSettings,
      ...input,
      systemName: String(input?.systemName ?? defaultSettings.systemName).trim(),
      organizationName: String(
        input?.organizationName ?? defaultSettings.organizationName
      ).trim(),
      timezone: String(input?.timezone ?? defaultSettings.timezone),
      language: String(input?.language ?? defaultSettings.language),
      lowStockThreshold: Number(
        input?.lowStockThreshold ?? defaultSettings.lowStockThreshold
      ),
      criticalStockThreshold: Number(
        input?.criticalStockThreshold ?? defaultSettings.criticalStockThreshold
      ),
      autoRiskCalculation: Boolean(
        input?.autoRiskCalculation ?? defaultSettings.autoRiskCalculation
      ),
      emailAlerts: Boolean(input?.emailAlerts ?? defaultSettings.emailAlerts),
      lowStockAlerts: Boolean(input?.lowStockAlerts ?? defaultSettings.lowStockAlerts),
      criticalAlerts: Boolean(input?.criticalAlerts ?? defaultSettings.criticalAlerts),
      sessionTimeout: Number(input?.sessionTimeout ?? defaultSettings.sessionTimeout),
      roleBasedAccess: Boolean(
        input?.roleBasedAccess ?? defaultSettings.roleBasedAccess
      ),
      auditLogging: Boolean(input?.auditLogging ?? defaultSettings.auditLogging),
      darkMode: Boolean(input?.darkMode ?? defaultSettings.darkMode),
      refreshInterval: Number(
        input?.refreshInterval ?? defaultSettings.refreshInterval
      )
    }),
    []
  );

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const isFormValid = useMemo(() => {
    return (
      settings.systemName.trim().length > 0 &&
      settings.organizationName.trim().length > 0 &&
      Number(settings.lowStockThreshold) >= 1 &&
      Number(settings.criticalStockThreshold) >= 1 &&
      Number(settings.sessionTimeout) >= 5 &&
      Number(settings.refreshInterval) >= 5
    );
  }, [settings]);

  const parseApiResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();

    if (!contentType.includes("application/json")) {
      console.error("Non-JSON response body:", rawText);
      throw new Error(
        `Expected JSON but received ${contentType || "unknown content type"}. Check API URL and backend route.`
      );
    }

    try {
      return JSON.parse(rawText);
    } catch {
      console.error("Invalid JSON response body:", rawText);
      throw new Error("Server returned invalid JSON.");
    }
  };

  const formatUptime = (seconds) => {
    const totalSeconds = Number(seconds || 0);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Not available";

    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const getHealthBadgeClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "online" || value === "healthy" || value === "connected") {
      return "healthy";
    }

    if (value === "connecting" || value === "warning") {
      return "warning";
    }

    return "offline";
  };

  const getHealthDotClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "online" || value === "healthy" || value === "connected") {
      return "healthy";
    }

    if (value === "connecting" || value === "warning") {
      return "warning";
    }

    return "offline";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value
    }));

    if (message) clearMessage();
  };

  const fetchSystemHealth = useCallback(async () => {
    try {
      setHealthLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch system health.");
      }

      setHealth({
        server: {
          status: data?.server?.status || "unknown",
          port: data?.server?.port || "-"
        },
        api: {
          status: data?.api?.status || "unknown",
          message: data?.api?.message || "API status unavailable"
        },
        database: {
          connected: Boolean(data?.database?.connected),
          readyState: data?.database?.readyState ?? 0,
          stateLabel: data?.database?.stateLabel || "unknown",
          displayUri: data?.database?.displayUri || "Not available"
        },
        timestamp: data?.timestamp || null,
        uptime: data?.server?.uptime || 0
      });
    } catch (error) {
      setHealth({
        server: {
          status: "offline",
          port: "-"
        },
        api: {
          status: "offline",
          message: error.message || "API is not reachable"
        },
        database: {
          connected: false,
          readyState: 0,
          stateLabel: "disconnected",
          displayUri: "Not available"
        },
        timestamp: new Date().toISOString(),
        uptime: 0
      });
    } finally {
      setHealthLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchSystemSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/system-settings`);
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch system settings.");
      }

      const mergedSettings = normalizeSettings(data);
      setSettings(mergedSettings);
      setInitialSettings(mergedSettings);
    } catch (error) {
      const fallbackSettings = normalizeSettings(defaultSettings);
      setSettings(fallbackSettings);
      setInitialSettings(fallbackSettings);
      showMessage(error.message || "Using default frontend settings for now.", "error");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, normalizeSettings, showMessage]);

  useEffect(() => {
    fetchSystemSettings();
    fetchSystemHealth();
  }, [fetchSystemSettings, fetchSystemHealth]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    clearMessage();

    if (saving) return;

    if (!hasUnsavedChanges) {
      showMessage("No changes to save.", "success");
      return;
    }

    if (!isFormValid) {
      showMessage("Please complete all required fields with valid values.", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = normalizeSettings(settings);

      const response = await fetch(`${API_BASE_URL}/api/system-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save system settings.");
      }

      const savedSettings = normalizeSettings(data.settings || payload);
      setSettings(savedSettings);
      setInitialSettings(savedSettings);
      showMessage("System settings updated successfully.", "success");
    } catch (error) {
      showMessage(error.message || "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const resetSettings = normalizeSettings(defaultSettings);
    setSettings(resetSettings);
    showMessage("Settings reset to defaults locally. Click Save to apply.", "success");
  };

  return (
    <section className="panel glass-panel system-config-panel">
      <div className="panel-header system-config-header">
        <div>
          <h2>System Configuration</h2>
          <p className="system-config-subtext">
            Configure organization-wide settings, alert behavior, access controls,
            and operational preferences for StockGuard.
          </p>
        </div>

        <div className="system-config-header-right">
          <span className="panel-tag">Admin Settings</span>
          {hasUnsavedChanges && <span className="unsaved-badge">Unsaved Changes</span>}
        </div>
      </div>

      <ConfirmationBanner
        message={message}
        type={messageType}
        onClose={clearMessage}
        autoCloseDuration={messageType === "success" ? 3000 : 4500}
      />

      <div className="system-health-section">
        <div className="system-health-topbar">
          <div className="system-health-heading">
            <div className="system-health-icon-wrap">🩺</div>
            <div>
              <span className="section-eyebrow">System Monitoring</span>
              <h3>System Health Indicators</h3>
              <p>Live operational status for backend services and infrastructure.</p>
            </div>
          </div>

          <button
            type="button"
            className="health-refresh-btn"
            onClick={fetchSystemHealth}
            disabled={healthLoading}
          >
            {healthLoading ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        {healthLoading ? (
          <div className="empty-state compact-health-state">
            <h3>Checking system health...</h3>
            <p>Please wait while StockGuard verifies service availability.</p>
          </div>
        ) : (
          <div className="modern-health-grid">
            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">Backend Server</span>
                <span className={`live-dot ${getHealthDotClass(health.server.status)}`}></span>
              </div>
              <div className="modern-health-main">
                <span className={`health-badge ${getHealthBadgeClass(health.server.status)}`}>
                  {health.server.status}
                </span>
              </div>
              <small className="modern-health-meta">Core application runtime</small>
            </div>

            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">API Status</span>
                <span className={`live-dot ${getHealthDotClass(health.api.status)}`}></span>
              </div>
              <div className="modern-health-main">
                <span className={`health-badge ${getHealthBadgeClass(health.api.status)}`}>
                  {health.api.status}
                </span>
              </div>
              <small className="modern-health-meta">{health.api.message}</small>
            </div>

            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">MongoDB</span>
                <span
                  className={`live-dot ${getHealthDotClass(health.database.stateLabel)}`}
                ></span>
              </div>
              <div className="modern-health-main">
                <span
                  className={`health-badge ${getHealthBadgeClass(
                    health.database.stateLabel
                  )}`}
                >
                  {health.database.stateLabel}
                </span>
              </div>
              <small className="modern-health-meta">Database connectivity state</small>
            </div>

            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">Server Port</span>
              </div>
              <div className="modern-metric-value">{health.server.port}</div>
              <small className="modern-health-meta">Listening network port</small>
            </div>

            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">Uptime</span>
              </div>
              <div className="modern-metric-value">{formatUptime(health.uptime)}</div>
              <small className="modern-health-meta">Current uninterrupted runtime</small>
            </div>

            <div className="modern-health-card">
              <div className="modern-health-row">
                <span className="modern-health-label">Last Checked</span>
              </div>
              <div className="modern-metric-value modern-metric-time">
                {formatTimestamp(health.timestamp)}
              </div>
              <small className="modern-health-meta">Most recent health verification</small>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading system settings...</h3>
          <p>Please wait while the configuration console is prepared.</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="system-config-form">
          <div className="system-config-grid">
            <div className="system-config-card">
              <div className="dashboard-section-header system-card-header">
                <div className="system-card-icon">⚙️</div>
                <div>
                  <h3>General Settings</h3>
                  <p>Core organization and regional setup</p>
                </div>
              </div>

              <label>
                System Name
                <input
                  type="text"
                  name="systemName"
                  value={settings.systemName}
                  onChange={handleChange}
                  placeholder="Enter system name"
                />
              </label>

              <label>
                Organization Name
                <input
                  type="text"
                  name="organizationName"
                  value={settings.organizationName}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                />
              </label>

              <label>
                Timezone
                <select name="timezone" value={settings.timezone} onChange={handleChange}>
                  <option value="America/Toronto">America/Toronto</option>
                  <option value="America/Vancouver">America/Vancouver</option>
                  <option value="America/Edmonton">America/Edmonton</option>
                  <option value="America/Halifax">America/Halifax</option>
                </select>
              </label>

              <label>
                Language
                <select name="language" value={settings.language} onChange={handleChange}>
                  <option value="English">English</option>
                  <option value="French">French</option>
                </select>
              </label>
            </div>

            <div className="system-config-card">
              <div className="dashboard-section-header system-card-header">
                <div className="system-card-icon">📦</div>
                <div>
                  <h3>Inventory Controls</h3>
                  <p>Thresholds and automated stock logic</p>
                </div>
              </div>

              <label>
                Default Low Stock Threshold
                <input
                  type="number"
                  name="lowStockThreshold"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={handleChange}
                />
              </label>

              <label>
                Critical Stock Threshold
                <input
                  type="number"
                  name="criticalStockThreshold"
                  min="1"
                  value={settings.criticalStockThreshold}
                  onChange={handleChange}
                />
              </label>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Automatic Risk Calculation</span>
                  <small>Recalculate risk levels based on stock movement</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="autoRiskCalculation"
                    checked={settings.autoRiskCalculation}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>
            </div>

            <div className="system-config-card">
              <div className="dashboard-section-header system-card-header">
                <div className="system-card-icon">🔔</div>
                <div>
                  <h3>Alert Settings</h3>
                  <p>Notification rules and stock alerts</p>
                </div>
              </div>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Email Alerts</span>
                  <small>Send alert notifications by email</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="emailAlerts"
                    checked={settings.emailAlerts}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Low Stock Alerts</span>
                  <small>Notify when stock reaches reorder level</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="lowStockAlerts"
                    checked={settings.lowStockAlerts}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Critical Alerts</span>
                  <small>Trigger urgent alerts for critical stock levels</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="criticalAlerts"
                    checked={settings.criticalAlerts}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>
            </div>

            <div className="system-config-card">
              <div className="dashboard-section-header system-card-header">
                <div className="system-card-icon">🔐</div>
                <div>
                  <h3>Security & Access</h3>
                  <p>Session rules and access governance</p>
                </div>
              </div>

              <label>
                Session Timeout (minutes)
                <input
                  type="number"
                  name="sessionTimeout"
                  min="5"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                />
              </label>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Role-Based Access Control</span>
                  <small>Restrict features based on user role</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="roleBasedAccess"
                    checked={settings.roleBasedAccess}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Audit Logging</span>
                  <small>Track administrative and system actions</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="auditLogging"
                    checked={settings.auditLogging}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>
            </div>

            <div className="system-config-card">
              <div className="dashboard-section-header system-card-header">
                <div className="system-card-icon">🖥️</div>
                <div>
                  <h3>System Preferences</h3>
                  <p>Display behavior and runtime refresh</p>
                </div>
              </div>

              <label className="toggle-setting premium-toggle-row">
                <div>
                  <span>Dark Mode</span>
                  <small>Enable a darker console appearance</small>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </span>
              </label>

              <label>
                Refresh Interval (seconds)
                <input
                  type="number"
                  name="refreshInterval"
                  min="5"
                  value={settings.refreshInterval}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="system-config-actions sticky-actions">
            <div className="settings-status-inline">
              <span className={`status-dot ${hasUnsavedChanges ? "pending" : "saved"}`}></span>
              <span>{hasUnsavedChanges ? "Changes pending" : "All changes saved"}</span>
            </div>

            <div className="settings-action-buttons">
              <button
                type="submit"
                disabled={saving || !hasUnsavedChanges || !isFormValid}
                title={!hasUnsavedChanges ? "Make a change to enable saving." : ""}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>

              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleResetDefaults}
                disabled={saving}
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

export default SystemConfigurationLayout;
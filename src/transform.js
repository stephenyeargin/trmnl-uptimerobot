function transform(input) {
  const monitors = Array.isArray(input.data)
    ? input.data
    : Array.isArray(input.monitors)
      ? input.monitors
      : [];

  const statusToString = (status) => {
    if (typeof status === "string") return status.toUpperCase();
    if (status === 0) return "PAUSED";
    if (status === 1) return "STARTED";
    if (status === 2) return "UP";
    if (status === 8) return "LOOKS_DOWN";
    if (status === 9) return "DOWN";
    return "UNKNOWN";
  };

  const statusToNumber = (status) => {
    const normalized = statusToString(status);
    if (normalized === "PAUSED") return 0;
    if (normalized === "STARTED") return 1;
    if (normalized === "UP") return 2;
    if (normalized === "LOOKS_DOWN") return 8;
    if (normalized === "DOWN") return 9;
    return status;
  };

  const compactMonitors = monitors.map((monitor) => ({
    friendlyName: monitor.friendlyName || monitor.friendly_name || "",
    url: String(monitor.url || "").replace(/^https?:\/\//i, ""),
    status: statusToNumber(monitor.status),
  }));

  const monitorName = (monitor) =>
    (monitor.friendlyName || monitor.url || "").toLowerCase();

  const isIssueStatus = (status) => {
    const normalized = statusToString(status);
    return normalized === "DOWN" || normalized === "LOOKS_DOWN" || normalized === "STARTED";
  };

  const sorted = [...compactMonitors].sort((a, b) => {
    const aIssue = isIssueStatus(a.status);
    const bIssue = isIssueStatus(b.status);

    if (aIssue !== bIssue) {
      return aIssue ? -1 : 1;
    }

    return monitorName(a).localeCompare(monitorName(b));
  });

  return {
    data: sorted,
    error: input.error && input.error.message ? { message: input.error.message } : {},
    trmnl: input.trmnl && input.trmnl.plugin_settings
      ? { plugin_settings: { instance_name: input.trmnl.plugin_settings.instance_name } }
      : {},
  };
}

import { useState, useEffect } from 'react';
import { Laptop, ShieldAlert, LogOut, CheckCircle, RefreshCw } from 'lucide-react';
import authService from '@/services/authService';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load active sessions:', err);
      setError('Could not retrieve active sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    try {
      setError('');
      await authService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError('Failed to revoke session. Try again.');
    }
  };

  const getFriendlyDevice = (ua) => {
    if (!ua) return 'Unknown Device';
    const lower = ua.toLowerCase();
    
    let os = 'Unknown OS';
    if (lower.includes('windows')) os = 'Windows';
    else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
    else if (lower.includes('linux')) os = 'Linux';
    else if (lower.includes('android')) os = 'Android';
    else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';

    let browser = 'Unknown Browser';
    if (lower.includes('firefox')) browser = 'Firefox';
    else if (lower.includes('chrome') && !lower.includes('chromium')) browser = 'Chrome';
    else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
    else if (lower.includes('edge')) browser = 'Edge';

    return `${browser} on ${os}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Device Sessions</h4>
          <p className="text-[11px] text-text-muted mt-0.5">
            You are logged in to LifeOS from these devices. Revoking a session immediately signs that device out.
          </p>
        </div>
        <button
          onClick={fetchSessions}
          className="p-1.5 rounded-lg hover:bg-bg-hover text-text-faint hover:text-text cursor-pointer transition-colors"
          title="Refresh Sessions"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[11px] text-danger font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-text-faint text-xs">
          Loading active login sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-6 text-text-faint text-xs">
          No sessions detected.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-bg-elevated/20 hover:bg-bg-elevated/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text truncate">
                      {getFriendlyDevice(session.device)}
                    </span>
                    {session.isCurrentSession && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold bg-success/20 text-success border border-success/20 px-1.5 py-0.5 rounded-full">
                        <CheckCircle className="w-2.5 h-2.5" /> Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-faint font-mono font-bold mt-0.5">
                    <span>IP: {session.ipAddress}</span>
                    <span>•</span>
                    <span>
                      Active: {new Date(session.lastActive).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {!session.isCurrentSession && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  className="p-2 rounded-lg text-text-faint hover:text-danger hover:bg-danger/10 cursor-pointer transition-colors"
                  title="Revoke Device Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionManager;

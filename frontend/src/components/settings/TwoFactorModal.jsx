import { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, X, QrCode } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import authService from '@/services/authService';

const TwoFactorModal = ({ isOpen, onClose, enabled, onCompleted }) => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      setCopied(false);
      if (!enabled) {
        loadSetup();
      }
    }
  }, [isOpen, enabled]);

  const loadSetup = async () => {
    try {
      setLoading(true);
      const data = await authService.setup2Fa();
      setSetupData(data);
    } catch (err) {
      console.error('Failed to load 2FA setup details:', err);
      setError('Failed to generate 2FA key. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secretKey) {
      navigator.clipboard.writeText(setupData.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6 || isNaN(code)) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (enabled) {
        await authService.disable2Fa(parseInt(code));
      } else {
        await authService.enable2Fa(parseInt(code));
      }
      onCompleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-white">
              {enabled ? 'Disable 2FA' : 'Enable 2FA'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-hover text-text-faint hover:text-text cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {enabled ? (
            <div className="space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                To disable two-factor authentication, please enter the current 6-digit code from your authenticator app.
              </p>
              
              {error && (
                <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[11px] text-danger font-medium">
                  {error}
                </div>
              )}

              <Input
                label="6-Digit Verification Code"
                placeholder="e.g. 123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button variant="danger" size="sm" loading={loading} type="submit">
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <p className="text-text-muted leading-relaxed">
                Two-Factor Authentication adds an extra layer of security. Scan the QR code or enter the key in Google Authenticator or Microsoft Authenticator.
              </p>

              {setupData && (
                <div className="flex flex-col items-center justify-center p-3 bg-bg-elevated/40 border border-border rounded-xl space-y-3">
                  {/* QR Code Container */}
                  <div className="p-2 bg-white rounded-lg flex items-center justify-center">
                    <img
                      src={setupData.qrCodeUrl}
                      alt="Scan this code"
                      className="w-40 h-40"
                    />
                  </div>

                  {/* Secret Copy Key */}
                  <div className="w-full flex items-center justify-between p-2 rounded-lg bg-bg-hover border border-border mt-2">
                    <span className="font-mono text-[10px] text-text truncate max-w-[240px]">
                      {setupData.secretKey}
                    </span>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="p-1 rounded hover:bg-bg-card text-text-faint hover:text-text cursor-pointer transition-colors"
                      title="Copy Secret Key"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[11px] text-danger font-medium">
                  {error}
                </div>
              )}

              <Input
                label="6-Digit Verification Code"
                placeholder="Enter 6-digit app code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" loading={loading} type="submit">
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TwoFactorModal;

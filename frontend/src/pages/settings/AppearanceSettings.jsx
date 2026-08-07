import { Palette, Check, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeProvider';

const AppearanceSettings = () => {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Workspace Theme & Aesthetics
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Personalize Aetheria with curated SaaS color schemes crafted for dark & light modes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(themes).map(([id, theme]) => {
          const isSelected = themeId === id;
          const colors = theme.colors;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setThemeId(id)}
              className={`relative group p-5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-primary ring-4 ring-primary/20 bg-bg-card shadow-lg shadow-primary/10'
                  : 'border-border/80 hover:border-primary/50 bg-bg-card/60 hover:bg-bg-card/90'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Theme Name */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-text">{theme.name}</span>
                {id === 'midnight' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                    Default
                  </span>
                )}
              </div>

              {/* Color Swatch Preview Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-elevated/50 border border-border/40">
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: colors['--color-bg'] || '#080c14' }}
                  title="Background"
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: colors['--color-primary'] || '#4f7cff' }}
                  title="Primary"
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: colors['--color-accent'] || '#a855f7' }}
                  title="Accent"
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: colors['--color-bg-card'] || '#111827' }}
                  title="Card Surface"
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
                <span>{theme.isDark !== false ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                {isSelected && (
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default AppearanceSettings;

import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

const AppearanceSettings = () => {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Palette className="w-5 h-5 mr-2 text-pink-400" />
          Appearance
        </h2>
        <p className="text-sm text-gray-400 mt-1">Choose a color theme for the entire application.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(themes).map(([id, theme]) => {
            const isSelected = themeId === id;
            const colors = theme.colors;
            return (
              <button
                key={id}
                onClick={() => setThemeId(id)}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                style={{ backgroundColor: colors['--color-bg-card'] }}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Theme name */}
                <p className="text-sm font-semibold mb-3" style={{ color: colors['--color-text'] }}>
                  {theme.name}
                </p>

                {/* Color swatches */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: colors['--color-bg'] }}
                    title="Background"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: colors['--color-primary'] }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: colors['--color-accent'] }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: colors['--color-text'] }}
                    title="Text"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ backgroundColor: colors['--color-border'] }}
                    title="Border"
                  />
                </div>

                {/* Mini preview bar */}
                <div className="mt-3 rounded-md overflow-hidden h-6 flex" style={{ backgroundColor: colors['--color-bg'] }}>
                  <div className="w-1/4 h-full" style={{ backgroundColor: colors['--color-bg-card'] }} />
                  <div className="flex-1 flex items-center px-2 gap-1">
                    <div className="w-8 h-2 rounded-full" style={{ backgroundColor: colors['--color-primary'] }} />
                    <div className="w-5 h-2 rounded-full" style={{ backgroundColor: colors['--color-accent'] }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: colors['--color-border'] }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;

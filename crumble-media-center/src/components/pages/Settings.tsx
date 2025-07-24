import React from 'react';
import { Monitor, Volume2, Subtitles, Download, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useStore();

  const settingSections = [
    {
      title: 'Display',
      icon: Monitor,
      settings: [
        {
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select' as const,
          value: theme,
          options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
          ],
          onChange: (value: string) => setTheme(value as 'dark' | 'light'),
        },
      ],
    },
    {
      title: 'Audio',
      icon: Volume2,
      settings: [
        {
          label: 'Default Volume',
          description: 'Set the default playback volume',
          type: 'slider' as const,
          value: 80,
          min: 0,
          max: 100,
        },
      ],
    },
    {
      title: 'Subtitles',
      icon: Subtitles,
      settings: [
        {
          label: 'Default Language',
          description: 'Preferred subtitle language',
          type: 'select' as const,
          value: 'en',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-8">
          {settingSections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Icon size={24} className="text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {section.settings.map(setting => (
                    <div key={setting.label} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium mb-1">
                          {setting.label}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {setting.description}
                        </p>
                      </div>

                      <div className="min-w-[200px]">
                        {setting.type === 'select' && (
                          <select
                            value={setting.value}
                            onChange={(e) => setting.onChange?.(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          >
                            {setting.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {setting.type === 'slider' && (
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={setting.min}
                              max={setting.max}
                              value={setting.value}
                              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-white text-sm w-8">
                              {setting.value}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* About Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Info size={24} className="text-blue-500" />
              <h2 className="text-xl font-semibold text-white">About</h2>
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span>2024.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Platform</span>
                <span>Web</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
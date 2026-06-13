// app/emergency/page.tsx
// Stub page for Emergency Mode
// Production: full implementation with generate_emergency_kit() agent tool

export default function EmergencyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">🚨</span>
        <h1 className="text-3xl font-bold text-[#0F1111] mb-3">Emergency Mode</h1>
        <p className="text-gray-500 mb-6">
          One-tap emergency kits with fastest delivery. 
          Select a category below to get an assembled kit in 60 seconds.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '👶', label: 'Baby Care' },
            { emoji: '🤒', label: 'Fever Kit' },
            { emoji: '🎉', label: 'Surprise Guests' },
            { emoji: '🩹', label: 'Period Care' },
            { emoji: '💻', label: 'Tech Rescue' },
            { emoji: '🍳', label: 'Kitchen Mishap' },
            { emoji: '🐾', label: 'Pet Emergency' },
            { emoji: '💊', label: 'First Aid' },
          ].map((item) => (
            <button
              key={item.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-red-200 transition-all duration-300 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-semibold text-[#0F1111]">{item.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          ⚡ Delivering to 110001 · Estimated: 10 min
        </p>
      </div>
    </div>
  );
}

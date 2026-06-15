export default function LiveClassPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Live Classes</h1>
      <p className="text-sm text-gray-500 -mt-4">Schedule and manage virtual classrooms</p>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-xl bg-[#006aa0] hover:bg-[#005a8a] text-white text-xs font-semibold transition-colors">+ Schedule Class</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">LIVE NOW</span>
          </div>
          <div className="text-base font-bold text-gray-800 mb-1">Robotics 101</div>
          <div className="text-xs text-gray-400 mb-4">Ms. Kapoor ┬╖ 32 students joined</div>
          <button className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors">Join Class ΓåÆ</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Upcoming</span></div>
          <div className="text-base font-bold text-gray-800 mb-1">Python Basics</div>
          <div className="text-xs text-gray-400 mb-4">Mr. Sharma ┬╖ Jun 12, 3:00 PM</div>
          <button className="w-full py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">View Details</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-3"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Recorded</span></div>
          <div className="text-base font-bold text-gray-800 mb-1">Electronics ΓÇö Ohm&apos;s Law</div>
          <div className="text-xs text-gray-400 mb-4">Mr. Singh ┬╖ Jun 9, 2:00 PM ┬╖ 58 min</div>
          <button className="w-full py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">Γû╢ Watch Recording</button>
        </div>
      </div>
    </>
  );
}

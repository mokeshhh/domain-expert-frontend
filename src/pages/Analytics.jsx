import React from 'react';

const Analytics = () => {
  // Example stats (replace with real stats or dynamic values later)
  const stats = [
    { label: "Total Experts", value: 8 },
    { label: "Domains Covered", value: 4 },
    { label: "Average Rating", value: 4.6 },
    { label: "Total Projects", value: 52 }
  ];

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Platform Analytics</h1>
      <div className="flex flex-wrap justify-center gap-8 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-gray-100 p-6 rounded w-44 text-center shadow">
            <div className="text-2xl font-extrabold text-blue-600">{stat.value}</div>
            <div className="text-gray-700 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Placeholder for future charts/graphs */}
      <div className="bg-gray-50 p-6 rounded text-center text-gray-500 italic">Charts and visualizations coming soon…</div>
    </div>
  );
};

export default Analytics;

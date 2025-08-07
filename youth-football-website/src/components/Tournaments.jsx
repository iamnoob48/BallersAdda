import React from 'react';

function Tournaments(){
  const categories = ["Under 12", "Under 18", "Open Category"];
  return (
    <section className="py-16 bg-gray-50 text-center">
      <h2 className="text-3xl font-semibold text-green-600 mb-6">Upcoming Tournaments</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white shadow-md rounded-lg p-6 w-72">
            <h3 className="text-xl font-semibold mb-2">{cat}</h3>
            <p className="text-sm text-gray-600">Register your team now and compete locally!</p>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Register</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Tournaments;
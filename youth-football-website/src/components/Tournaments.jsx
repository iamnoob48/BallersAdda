import { motion } from "framer-motion";
import TournamentsList from "../pages/TournamentList";

const tournaments = [
  { id: 1, name: "U12 Championship", date: "Date: ", location: "location", color: "bg-green-100" },
  { id: 2, name: "U18 League", date: "Date: ", location: "Location", color: "bg-green-200" },
  { id: 3, name: "Open Cup", date: "date: ", location: "location: ", color: "bg-green-300" },
];
function Tournaments() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-green-600"
        >
          Upcoming Tournaments
        </motion.h2>
        <p className="text-gray-600 mt-3 text-lg">Join the action. Show your skills. Make your mark.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {tournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            className={`rounded-2xl shadow-lg p-6 hover:shadow-green-400/50 transition transform hover:-translate-y-2 cursor-pointer ${tournament.color}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{tournament.name}</h3>
            <p className="text-gray-700 font-medium">{tournament.date}</p>
            <p className="text-gray-500">{tournament.location}</p>
            <button className="mt-5 px-4 py-2 bg-green-600 text-white rounded-full shadow hover:shadow-green-400/50 transition hover:scale-105">
              Register Now
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
export default Tournaments;

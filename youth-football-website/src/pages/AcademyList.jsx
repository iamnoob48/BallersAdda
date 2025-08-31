import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AcademyList() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  const academies = [
    { id: 1, name: "Hyderabad Football Academy", location: "Hyderabad", description: "Elite training for youth players with professional coaches." },
    { id: 2, name: "Sky Sports Academy", location: "Hyderabad", description: "Developing young talent with world-class facilities.", },
    { id: 3, name: "Sports Villa Academy", location: "Hyderabad", description: "Focus on grassroots football and community development."},
  ];

  const filteredAcademies = academies.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
        <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-4 text-green-600 hover:underline"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>
      <h1 className="text-3xl font-bold mb-4 text-green-500 text-center">Academies</h1>


      <Input
        placeholder="Search academies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 border rounded-lg"
      />


      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAcademies.length > 0 ? (
          filteredAcademies.map((a, index) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card
                className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-b from-green-700 to-green-900 text-white"
                style={{ border: "2px solid white" }}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {a.name}
                
                  </CardTitle>
                  <p className="text-sm">{a.location}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{a.description}</p>
                  <button className="w-full bg-white text-green-700 rounded-lg py-2 font-semibold hover:bg-gray-200 transition">
                    Join Academy
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No academies found.</p>
        )}
      </div>
    </div>
  );
}

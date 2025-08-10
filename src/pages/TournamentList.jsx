import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TournamentsList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();

  const tournaments = [
    { id: 1, name: "Hyderabad Youth Cup", location: "Hyderabad", date: "Feb 15, 2025", status: "Ongoing", category: "U-12" },
    { id: 2, name: "Sky Sports Turf Challenge", location: "Hyderabad", date: "Feb 20, 2025", status: "Upcoming", category: "U-18" },
    { id: 3, name: "Sports Villa", location: "Hyderabad", date: "Mar 1, 2025", status: "Upcoming", category: "Open" },
  ];

  const filteredTournaments = tournaments.filter(t =>
    (category === "All" || t.category === category) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition 
                   fixed top-5 left-6 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md
                   hover:shadow-lg z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-4 text-green-500 text-center">Tournaments</h1>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="All">All Categories</option>
          <option value="U-12">U-12</option>
          <option value="U-18">U-18</option>
          <option value="Open">Open</option>
        </select>
      </div>

      {/* Tournament Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map(t => (
            <Card
              key={t.id}
              className="rounded-2xl shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundImage: "linear-gradient(to bottom, #228B22, #006400)",
                border: "2px solid white",
                color: "white"
              }}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {t.name}
                  <Badge variant="secondary" className="bg-white text-green-700 font-bold">
                    {t.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm">{t.location}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">{t.date}</p>
                <Badge className="mb-3 bg-yellow-400 text-black">{t.category}</Badge>
                <button className="w-full bg-white text-green-700 rounded-lg py-2 font-semibold hover:bg-gray-200 transition">
                  View Details
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No tournaments found.</p>
        )}
      </div>
    </div>
  );
}

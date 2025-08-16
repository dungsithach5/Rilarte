"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Onboarding({ userId }: { userId: number }) {
  const [topics, setTopics] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    axios.get("/api/topics").then((res) => setTopics(res.data));
  }, []);

  const toggleTopic = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveTopics = async () => {
    await axios.post(`/api/users/${userId}/topics`, { topics: selected });
    window.location.href = "/home";
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {topics.map((t) => (
        <div
          key={t.id}
          className={`p-4 border rounded-xl cursor-pointer transition ${
            selected.includes(t.id) ? "bg-blue-300" : "bg-gray-100"
          }`}
          onClick={() => toggleTopic(t.id)}
        >
          {t.image_url && (
            <img src={t.image_url} className="w-20 h-20 object-cover mx-auto" />
          )}
          <p className="text-center mt-2">{t.name}</p>
        </div>
      ))}
      <button
        onClick={saveTopics}
        className="col-span-3 bg-blue-500 text-white py-2 px-6 rounded-xl mt-4"
      >
        Continue
      </button>
    </div>
  );
}

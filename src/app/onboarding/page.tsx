"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Check } from 'lucide-react';
import { submitOnboarding } from "../services/Api/onboarding";
import { updateUser } from "../context/userSlice";

interface Topic {
  id: string;
  name: string;
  image_url: string;
  icon?: string;
}

export default function OnboardingModal() {
  const { data: session, update } = useSession();
  const reduxUser = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  

  const [currentStep, setCurrentStep] = useState(1);
  const [gender, setGender] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ưu tiên Redux user (database data) thay vì session
    if (reduxUser?.onboarded === true) {
      router.push("/");
    }
  }, [reduxUser?.onboarded, router]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/topics");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      }
    };
    fetchTopics();
  }, []);

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(prev => prev.filter(t => t !== id));
    } else {
      setSelectedTopics(prev => [...prev, id]);
    }
  };

  const handleNext = () => {
    if (gender) setCurrentStep(2);
  };
  const handleBack = () => setCurrentStep(1);

  const handleSubmit = async () => {
    if (selectedTopics.length === 0) return alert("Chọn ít nhất 1 topic!");
    
    // Ưu tiên Redux email (database data) thay vì session
    const email = reduxUser?.email || session?.user?.email;
    if (!email) {
      alert("Không tìm thấy email user. Vui lòng login lại.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await submitOnboarding({
        email,
        gender,
        topics: selectedTopics,
      });

      if (res.success) {
        // Update Redux state
        dispatch(updateUser({ onboarded: true }));
        
        // Update localStorage chỉ cho user hiện tại
        if (reduxUser) {
          const updatedUser = { ...reduxUser, onboarded: true };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setCurrentStep(3);

        setTimeout(async () => {
          await update();
          router.push("/");
        }, 3000);
      } else {
        alert(res.message || "Onboarding chưa thành công");
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="w-full flex overflow-hidden">
        <div className="w-full px-16 flex flex-col justify-center">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Welcome!</h2>
              <p className="text-center text-lg font-medium">Select your gender</p>
              <div className="flex gap-6 justify-center">
                {["male", "female"].map(g => {
                  const isSelected = gender === g;
                  const baseStyle = "px-8 py-4 rounded-2xl border text-lg font-semibold transition-all";
                  const selectedStyle = g === "male" ? "border-blue-500 bg-blue-100 text-blue-700" : "border-pink-500 bg-pink-100 text-pink-700";
                  const unselectedStyle = g === "male" ? "border-gray-300 hover:border-blue-300" : "border-gray-300 hover:border-pink-300";
                  return (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`${baseStyle} ${isSelected ? selectedStyle + " scale-105 shadow-md" : unselectedStyle}`}
                    >
                      {g === "male" ? "👨 Male" : "👩 Female"}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNext}
                  disabled={!gender}
                  className="px-6 py-2 bg-gray-800 text-white text-lg rounded-2xl shadow-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 text-center">Welcome!</h2>
              <h2 className="text-lg mb-4 text-center">Select your topics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`relative w-full h-40 rounded-2xl overflow-hidden border-2 transition-all ${selectedTopics.includes(topic.id) ? "border-black" : "border-gray-300 hover:border-gray-400"}`}
                  >
                    {topic.image_url && <img src={topic.image_url} alt={topic.name} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center p-2">
                      {topic.icon && <div className="text-3xl mb-2">{topic.icon}</div>}
                      <div className="text-white text-lg font-semibold text-center">{topic.name}</div>
                    </div>
                    {selectedTopics.includes(topic.id) && (
                      <div className="absolute top-2 right-2 bg-black rounded-full w-6 h-6 flex items-center justify-center shadow">
                        <Check className="text-white w-4 h-4"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={handleBack} className="px-6 py-2 border rounded-xl hover:bg-gray-100">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedTopics.length === 0}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Complete"}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="relative mt-6 p-12 text-center overflow-hidden">
              {/* Sparkles */}
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2000}ms`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}

              <div className="relative z-10">
                <div className="text-5xl mb-2 animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                <p className="">You have successfully completed onboarding</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="w-full h-full">
        <img
          src="/img/onboarding.png"
          alt="Onboarding Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

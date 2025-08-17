"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { submitOnboarding } from "../services/Api/onboarding";
import { updateUser } from "../context/userSlice";

interface Topic {
  id: string;
  name: string;
  image_url: string;
  icon?: string;
}

export default function OnboardingModal() {
  const { data: session, status, update } = useSession();
  const reduxUser = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [gender, setGender] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reduxUser?.onboarded) {
      router.push("/");
    }
  }, [reduxUser, router]);

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
    } else if (selectedTopics.length < 3) {
      setSelectedTopics(prev => [...prev, id]);
    } else {
      alert("Bạn chỉ có thể chọn tối đa 3 topics!");
    }
  };

  const handleNext = () => {
    if (gender) setCurrentStep(2);
  };
  const handleBack = () => setCurrentStep(1);

  // Submit onboarding
  const handleSubmit = async () => {
    if (!gender) return alert("Vui lòng chọn giới tính!");
    if (selectedTopics.length === 0) return alert("Chọn ít nhất 1 topic!");

    setLoading(true);
    const email = session?.user?.email || reduxUser?.email;
    if (!email) return alert("Không tìm thấy email user");

    try {
      const res = await submitOnboarding({
        email,
        gender,
        topics: selectedTopics,
      });

      if (res.success) {
        dispatch(updateUser({ onboarded: true }));

        localStorage.setItem(
          "user",
          JSON.stringify({ ...reduxUser, onboarded: true })
        );

        await update();
        router.push("/");
      } else {
        alert(res.message || "Onboarding chưa thành công");
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      alert(err.response?.data?.message || err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome!</h2>

        {currentStep === 1 ? (
          <div className="space-y-4">
            <p className="text-center">Select your gender</p>
            <div className="flex gap-4 justify-center">
              {["male", "female"].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`p-4 rounded-2xl border ${
                    gender === g ? "border-blue-500 bg-blue-100" : "border-gray-300"
                  }`}
                >
                  {g === "male" ? "👨 Male" : "👩 Female"}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                disabled={!gender}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center">Select up to 3 topics</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`p-4 rounded-2xl border ${
                    selectedTopics.includes(topic.id) ? "border-black bg-gray-100" : "border-gray-300"
                  }`}
                >
                  <div>{topic.icon}</div>
                  <div>{topic.name}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={handleBack} className="px-6 py-2 border rounded-xl">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedTopics.length === 0}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl disabled:opacity-50"
              >
                {loading ? "Saving..." : "Complete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";

const TOPICS = [
    { label: "Art", image: "https://www.kiettacnghethuat.com/wp-content/uploads/The-Starry-Night.jpg" },
    { label: "Travel", image: "https://bcp.cdnchinhphu.vn/Uploaded/duongphuonglien/2020_09_24/giai%20nhat%20thuyen%20hoa.jpg" },
    { label: "Food", image: "https://image.plo.vn/w1000/Uploaded/2025/abxbflu/2014_04_23/Food%20Art%20(10)_AAVP.JPG.ashx.webp?width=500" },
    { label: "Photography", image: "https://picture.vn/wp-content/uploads/2017/02/anh-nghe-thuat-art2-697x1024.jpg" },
    { label: "Fashion", image: "https://media.vov.vn/sites/default/files/styles/large/public/2022-06/1wv03093.jpg" },
    { label: "Tech", image: "https://cdn.vietnambiz.vn/2020/4/1/high-tech-1014x507-15857154246491841805976.png" },
    { label: "Music", image: "https://th-thumbnailer.cdn-si-edu.com/qjYiesn0duOBr2c8oLOgRsoi88E=/1280x960/filters:focal(1536x1024:1537x1025)/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/f2/02/f202eca9-7743-4fd4-92fb-f1e3d9188e1e/gettyimages-157185630.jpg" },
    { label: "Fitness", image: "https://bizweb.dktcdn.net/100/021/944/files/fitness-la-gi-5.jpg?v=1556163329500" },
]
export default function OnboardModal({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user?.firstLogin) {
      setOpen(true);
    }
  }, [user]);

  const handleTopicToggle = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async () => {
    if (!gender || topics.length === 0) {
      alert("Vui lòng chọn giới tính và ít nhất một chủ đề!");
      return;
    }

    try {
      setLoading(true);

      await fetch("http://localhost:5000/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, gender, topics }),
      });

      setOpen(false);
      window.location.reload(); // Đảm bảo session/user được cập nhật

    } catch (err) {
      console.error("Failed to submit onboarding info", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 overflow-auto">
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-4 py-6 md:px-10 md:py-12">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 md:space-y-10 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              What's your gender?
            </h2>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {["male", "female", "other"].map((v) => (
                <button
                  key={v}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium border transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black ${
                    gender === v
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                  onClick={() => setGender(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <button
              disabled={!gender}
              className="mt-6 sm:mt-8 px-8 sm:px-10 py-2 sm:py-4 rounded-full bg-black text-white text-base sm:text-lg font-semibold disabled:opacity-40 hover:bg-gray-800"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </motion.div>
        )}
  
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 md:space-y-8 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Pick some topics you love
            </h2>
            <p className="text-gray-500 text-sm sm:text-md">Choose at least one to get started</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => handleTopicToggle(topic.label)}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    topics.includes(topic.label) ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={topic.image}
                    alt={topic.label}
                    className="w-full h-32 sm:h-36 object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <h3 className="absolute bottom-2 left-3 text-white text-sm sm:text-lg font-semibold">
                    {topic.label}
                  </h3>
                </button>
              ))}
            </div>
            <button
              disabled={topics.length === 0}
              className="mt-4 sm:mt-6 px-8 py-3 rounded-full bg-black text-white text-base sm:text-lg disabled:opacity-40 hover:bg-gray-800"
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </motion.div>
        )}
  
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 sm:space-y-8 md:space-y-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="text-5xl sm:text-6xl"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900"
            >
              You're all set!
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-sm sm:text-md"
            >
              Let the creativity begin...
            </motion.p>
            <motion.button
              disabled={loading}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 sm:mt-4 px-8 sm:px-10 py-3 sm:py-4 rounded-full bg-black text-white text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all duration-300"
              onClick={handleSubmit}
            >
              {loading ? "Loading..." : "Start Exploring"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  
  );
}

import React, { useState, type ChangeEvent, type DragEvent } from 'react';
import { Camera, X, ArrowLeft, Activity, Salad, Dumbbell, Info, HeartPulse } from 'lucide-react';
import { aiURL } from '../../api/urls';

// --- Types (Khớp với Python Server) ---
interface ServerResponse {
  age: number;
  gender: number; // 0: Male, 1: Female
  shape: 'thin' | 'normal' | 'fat';
  body_shape: 'Rectangle' | 'Triangle' | 'Apple';
}

const SmartConsultation: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ServerResponse | null>(null);

  // --- Logic sinh tư vấn (English) ---
  const getAdvice = (data: ServerResponse) => {
    const isMale = data.gender === 0;
    
    // 1. Workout Advice dựa trên Body Shape và Gender
    const workoutMap = {
      Rectangle: {
        title: "Hypertrophy & Definition",
        desc: isMale 
          ? "Focus on heavy compound lifts. Incorporate lateral raises and lat pulldowns to broaden your frame into a V-taper." 
          : "Focus on resistance training to create curves and build functional strength across the entire body."
      },
      Triangle: {
        title: "Upper-Body Balance",
        desc: "Prioritize shoulders, chest, and back exercises to balance your wider hip structure. Use moderate weights with higher reps."
      },
      Apple: {
        title: "Visceral Fat Targeting",
        desc: "Focus on HIIT and steady-state cardio (30-40 mins). Add core-strengthening exercises like planks to support your midsection."
      }
    };

    // 2. Nutrition Advice dựa trên Shape (Cân nặng)
    const nutritionMap = {
      thin: "Maintain a caloric surplus (300-500 kcal above maintenance). Aim for 1.8g - 2.2g of protein per kg of body weight.",
      normal: "Focus on a balanced maintenance diet. Prioritize whole foods and lean proteins to support functional health.",
      fat: "Implement a slight caloric deficit. Focus on high-protein, high-fiber meals to preserve muscle while losing body fat."
    };

    return {
      workout: workoutMap[data.body_shape],
      nutrition: nutritionMap[data.shape],
      personalNote: data.age < 25 
        ? `At ${data.age}, your recovery rate is at its peak. This is the best time to build a strong muscle foundation.`
        : `At ${data.age}, focus on cardiovascular health and joint mobility to maintain long-term metabolic efficiency.`
    };
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch(aiURL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data: ServerResponse = await response.json();
      console.log(data);
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong, please reload page and try again or upload another image");
    } finally {
      setIsLoading(false);
    }
  };

  const advice = result ? getAdvice(result) : null;

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-[32px] font-bold text-[#333] text-center mb-8">
          Smart consultation <br /> from image
        </h1>

        {/* Upload Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-6 border border-blue-50">
          <div
            className={`relative border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center ${
              previewUrl ? 'border-none p-0' : 'h-64 p-8 border-gray-200 bg-gray-50'
            }`}
          >
            {previewUrl ? (
              <div className="relative w-full h-64">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); setResult(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm text-[#007bff]">
                  <Camera size={40} />
                </div>
                <p className="text-gray-500 text-center mb-4 text-sm font-medium">Upload a full-body photo for AI analysis</p>
                <label className="bg-[#007bff] text-white px-8 py-2.5 rounded-md font-bold cursor-pointer hover:bg-blue-600 shadow-md transition-all">
                  CHOOSE IMAGE
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} />
                </label>
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedImage || isLoading}
            className={`w-full mt-8 py-3.5 rounded-md font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${
              selectedImage && !isLoading ? 'bg-[#007bff] hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "START CONSULTATION"}
          </button>
        </div>

        {/* Result Card */}
        {result && advice && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-[#007bff] to-blue-500 p-5 text-white">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <HeartPulse size={20} />
                  <h2 className="font-bold uppercase tracking-wider text-sm">Personal Report</h2>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">AI ANALYZED</span>
              </div>
              <p className="text-blue-50 text-xs italic">Age: {result.age} | Gender: {result.gender === 0 ? 'Male' : 'Female'} | Shape: {result.shape}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Nutrition Section */}
              <div className="flex gap-4">
                <div className="bg-green-50 p-3 rounded-xl h-fit text-green-600 border border-green-100"><Salad size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-tight">Nutrition Strategy</h4>
                  <p className="text-gray-600 text-[13px] leading-relaxed">{advice.nutrition}</p>
                </div>
              </div>

              {/* Workout Section */}
              <div className="flex gap-4">
                <div className="bg-orange-50 p-3 rounded-xl h-fit text-orange-600 border border-orange-100"><Dumbbell size={24} /></div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1 uppercase tracking-tight">{advice.workout.title}</h4>
                  <p className="text-gray-600 text-[13px] leading-relaxed">{advice.workout.desc}</p>
                </div>
              </div>

              {/* Note Section */}
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                <Info className="text-blue-500 shrink-0" size={18} />
                <p className="text-blue-800 text-[11px] leading-relaxed italic">
                  <span className="font-bold not-italic">Note: </span>{advice.personalNote}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button className="text-gray-500 text-sm flex items-center gap-2 hover:text-[#007bff] transition-colors font-medium">
            <ArrowLeft size={16} /> Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartConsultation;
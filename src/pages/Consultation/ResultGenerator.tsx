export const generateConsultation = (data: { age: number; gender: number; shape: string; body_shape: string }) => {
  const { age, gender, shape, body_shape } = data;

  // 1. Tư vấn dựa trên Body Shape (Cấu trúc khung người)
  const bodyShapeAdvice: Record<string, any> = {
    Rectangle: {
      title: "Straight / Rectangle Frame",
      workout: "Focus on hypertrophy (muscle-building) to create definition. Target shoulders and back to widen your silhouette.",
      risk: "Risk of low muscle mass and weak core stability."
    },
    Triangle: {
      title: "Triangle / Pear Frame",
      workout: "Focus on upper-body strength training to balance your proportions.",
      risk: "Potential joint strain in the lower body."
    },
    Apple: {
      title: "Apple Frame",
      workout: "Prioritize high-intensity cardio and core-strengthening exercises.",
      risk: "Higher risk of visceral fat around the organs."
    }
  };

  // 2. Tư vấn dựa trên Shape (Trạng thái cân nặng)
  const weightStatusAdvice: Record<string, string> = {
    thin: "You are currently in the 'Thin' category. Focus on a caloric surplus with high protein intake to support muscle growth.",
    normal: "Your weight is in the 'Normal' range. Maintain balance with functional training and a varied diet.",
    fat: "Focus on fat loss through a caloric deficit while maintaining protein intake to preserve muscle."
  };

  // 3. Modifiers (Age & Gender)
  const isMale = gender === 0;
  const genderNote = isMale 
    ? "As a male, utilize your natural testosterone levels by lifting heavier weights (low reps, high intensity)."
    : "Focus on functional strength and hormonal balance through consistent resistance training.";
  
  const ageNote = age < 25 
    ? "At 24, your body is at its peak recovery rate. It's the best time to build a strong physical foundation."
    : "Maintain metabolic health through regular activity and balanced nutrition.";

  return {
    analysis: bodyShapeAdvice[body_shape] || { title: "General", workout: "", risk: "" },
    nutrition: weightStatusAdvice[shape],
    personalNote: `${genderNote} ${ageNote}`
  };
};
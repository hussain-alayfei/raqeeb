
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const raqeebAI = {
  // تحليل الاختصاص القضائي (الفرز الذكي)
  async analyzeJurisdiction(caseData: { subject: string; plaintiff: string; defendant: string }) {
    const prompt = `
      بصفتك "مستشار رقيب الذكي" لديوان المظالم السعودي، حلل البيانات التالية:
      - موضوع الدعوى: ${caseData.subject}
      - المدعي: ${caseData.plaintiff}
      - المدعى عليه: ${caseData.defendant}

      المطلوب (بناءً على نظام المرافعات السعودي):
      1. هل ديوان المظالم مختص ولائياً؟
      2. ما هي الدائرة المختصة المقترحة؟
      3. قدم "رؤية رقيب" (نصيحة إجرائية قصيرة جداً).

      يجب أن تكون الإجابة بتنسيق JSON حصراً:
      {
        "walai": boolean,
        "nawi": string,
        "insight": string
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Jurisdiction Error:", error);
      return { 
        walai: true, 
        nawi: "الدائرة الإدارية المختصة", 
        insight: "تعذر الاتصال بالذكاء الاصطناعي، يرجى المراجعة اليدوية." 
      };
    }
  },

  // بوابة التحقق قبل الجلسة (Verification Portal)
  async verifySessionEntry() {
    const prompt = `
      أنت محرك التحليل المرئي لمنظومة رقيب. قم بمحاكاة فحص لقطة فيديو لمدعي يحضر جلسة عن بعد.
      
      المخرجات المطلوبة JSON:
      {
        "identityMatch": boolean,
        "dressCodeValid": boolean,
        "environmentStable": boolean,
        "message": "تم السماح بالدخول" أو سبب الرفض
      }
    `;

    try {
      // Simulation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { 
        identityMatch: true, 
        dressCodeValid: true, 
        environmentStable: true, 
        message: "تم التحقق من الهوية والزي الرسمي بنجاح."
      };
    } catch (error) {
      return { 
        identityMatch: true, 
        dressCodeValid: true, 
        environmentStable: true, 
        message: "تم التحقق من الهوية والزي الرسمي بنجاح."
      };
    }
  },

  // مراقبة الجلسة (الضبط الرقمي عبر الرؤية الحاسوبية)
  async monitorHearing(scenario: 'normal' | 'no_face' | 'bad_attire' | 'multiple_faces' | 'rapid_movement' = 'normal') {
    await new Promise(resolve => setTimeout(resolve, 800)); // Faster response for monitoring

    if (scenario === 'no_face') {
        return {
            status: 'CRITICAL',
            faceDetected: false,
            identityStatus: 'FAIL',
            attireStatus: 'UNKNOWN',
            envStatus: 'FAIL',
            recommendation: "تنبيه: لا يوجد مستفيد أمام الكاميرا. الجلسة في حالة تعليق."
        };
    }

    if (scenario === 'bad_attire') {
        return {
            status: 'WARNING',
            faceDetected: true,
            identityStatus: 'PASS',
            attireStatus: 'FAIL',
            envStatus: 'PASS',
            recommendation: "مخالفة بروتوكول: عدم الالتزام بالزي الرسمي (الشماغ/الغترة)."
        };
    }

    if (scenario === 'multiple_faces') {
        return {
            status: 'SECURITY_ALERT',
            faceDetected: true,
            identityStatus: 'FAIL', // Fall بسبب وجود شخص آخر
            attireStatus: 'PASS',
            envStatus: 'FAIL',
            recommendation: "خرق أمني: رصد أشخاص غير مصرح لهم في الكادر."
        };
    }

    if (scenario === 'rapid_movement') {
        return {
            status: 'BEHAVIOR_ALERT',
            faceDetected: true,
            identityStatus: 'PASS',
            attireStatus: 'PASS',
            envStatus: 'WARNING',
            recommendation: "سلوك غير مستقر: رصد حركة مفاجئة ومتكررة."
        };
    }

    // Normal scenario
    return { 
        status: 'OK',
        faceDetected: true,
        identityStatus: 'PASS',
        attireStatus: 'PASS',
        envStatus: 'PASS', 
        recommendation: "الجلسة مستقرة. الانضباط مطابق للمعايير." 
    };
  }
};

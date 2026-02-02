
import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResult, ReviewScores, ReviewDetails } from "../types";
import { WEIGHT_MUSIC, WEIGHT_TECH, WEIGHT_FUSION, WEIGHT_CREATIVE, GEMINI_MODEL } from "../constants";

// Correctly initialize GoogleGenAI with a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    scores: {
      type: Type.OBJECT,
      properties: {
        music: { type: Type.NUMBER, description: "Total score for music (0-100) based on 30/30/10/30 breakdown." },
        tech: { type: Type.NUMBER, description: "Total score for tech (0-100) based on 40/30/30 breakdown." },
        fusion: { type: Type.NUMBER, description: "Total score for fusion (0-100) based on 50/50 breakdown." },
        creative: { type: Type.NUMBER, description: "Total score for creative (0-100) based on 50/50 breakdown." },
      },
      required: ["music", "tech", "fusion", "creative"],
    },
    descriptions: {
      type: Type.OBJECT,
      properties: {
        musicDesc: { type: Type.STRING, description: "Focus on: Lyrics choice, arrangement aesthetics, vocal quality, and specific originality assessment (0/15/30 points logic)." },
        techDesc: { type: Type.STRING, description: "Focus on: Spatio-temporal consistency, motion control, and workflow complexity." },
        fusionDesc: { type: Type.STRING, description: "Focus on: Rhythm sync accuracy and semantic visual mapping." },
        creativeDesc: { type: Type.STRING, description: "Focus on: Conceptual imagination and narrative completeness." },
        overallSuggestion: { type: Type.STRING, description: "Overall professional feedback (~200 words)." },
      },
      required: ["musicDesc", "techDesc", "fusionDesc", "creativeDesc", "overallSuggestion"],
    }
  },
  required: ["scores", "descriptions"],
};

export const analyzeVideo = async (file: File): Promise<ReviewResult> => {
  const base64Data = await fileToBase64(file);
  
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: `你是一位专业 AIGC MV 竞赛评审。请严格按照以下最新【评分标准】进行量化分析与评价：

1. 音乐与文本创作 (30%) - 满分 100：
   - 词作选题与文学性 (30分)：选题是否有独特社会洞察（如：职业叙事、时间哲学）；意象是否精准，拒绝 AI 废话。
   - 作曲编曲美学 (30分)：旋律记忆点与情感张力；编曲丰富度；动态段落（Verse/Chorus）对比。
   - 格律与人声质量 (10分)：词曲重音匹配（不倒字）；人声生成的呼吸感与音质清晰度。
   - 是否原创 (30分)：评估歌曲的原创程度。计分规则：【非原创该项为 0 分】；【明显模仿或借鉴得 15 分】；【完全原创得满分 30 分】。

2. AIGC 视觉技术 (30%) - 满分 100：
   - 时空一致性 (40分)：角色面部、服装、关键物件及场景风格在全片中的稳定性。
   - 动作可控性 (30分)：运镜（Pan/Zoom）设计感；人物动作与物理逻辑契合度，拒绝无意义的随机扭动。
   - 工作流复杂度 (30分)：是否协同多模型（如 SD+Kling+后期修复）；复杂长镜头的处理水平。

3. 视听融合深度 (20%) - 满分 100：
   - 节奏精准对位 (50分)：剪辑点、镜头运动频率与音乐 Bpm/鼓点的瞬时对齐精度。
   - 语义视觉化映射 (50分)：画面是否通过隐喻或直接表达，升华歌词意境；视觉对音乐情感的补偿能力。

4. 叙事、创意与过程 (20%) - 满分 100：
   - 概念与想象力 (50分)：利用 AI 实现实拍无法企及的超现实构思；创意概念是否足够新颖独特。
   - 叙事 (50分)：叙事表达完整，有效传递歌曲意境，综合运用视听技术达成完整叙事表达。

【输出要求】：
- 必须使用简体中文进行回复。
- 严禁给出过于平庸的平均分，必须体现专业评审的严厉度与敏锐度。
- 音乐维度的评价中，必须明确说明“是否原创”维度的判定依据（0/15/30分）。
- 所有文字评价必须涵盖上述子维度的具体表现，使用专业术语。
- 综合评审建议应包含对作者未来工作流优化的具体建议。
- 请以 JSON 格式返回结果。`,
        },
      ],
    },
    config: {
      thinkingConfig: { thinkingBudget: 24576 },
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
    },
  });

  const data = JSON.parse(response.text || "{}");
  const scores: ReviewScores = data.scores;
  const desc: ReviewDetails = data.descriptions;

  const totalScore = (
    scores.music * WEIGHT_MUSIC +
    scores.tech * WEIGHT_TECH +
    scores.fusion * WEIGHT_FUSION +
    scores.creative * WEIGHT_CREATIVE
  );

  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    scores,
    totalScore: parseFloat(totalScore.toFixed(2)),
    details: desc,
    timestamp: Date.now(),
  };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const MBTI_TYPES = [
  { type: "INTJ", label: "建筑师", color: "#8B5CF6", emoji: "🧠" },
  { type: "INTP", label: "逻辑学家", color: "#6366F1", emoji: "🔬" },
  { type: "ENTJ", label: "指挥官", color: "#EF4444", emoji: "👑" },
  { type: "ENTP", label: "辩论家", color: "#F59E0B", emoji: "💡" },
  { type: "INFJ", label: "提倡者", color: "#EC4899", emoji: "✨" },
  { type: "INFP", label: "调停者", color: "#10B981", emoji: "🌈" },
  { type: "ENFJ", label: "主人公", color: "#3B82F6", emoji: "🌟" },
  { type: "ENFP", label: "竞选者", color: "#06B6D4", emoji: "🦋" },
  { type: "ISTJ", label: "物流师", color: "#6B7280", emoji: "📋" },
  { type: "ISFJ", label: "守卫者", color: "#84CC16", emoji: "🛡️" },
  { type: "ESTJ", label: "总经理", color: "#F97316", emoji: "📊" },
  { type: "ESFJ", label: "执政官", color: "#14B8A6", emoji: "🤝" },
  { type: "ISTP", label: "鉴赏家", color: "#1F2937", emoji: "🔧" },
  { type: "ISFP", label: "探险家", color: "#D946EF", emoji: "🎨" },
  { type: "ESTP", label: "企业家", color: "#EAB308", emoji: "🚀" },
  { type: "ESFP", label: "表演者", color: "#22C55E", emoji: "🎭" },
];

export type MbtiTypeString = (typeof MBTI_TYPES)[number]["type"];

export function getMbtiInfo(type: string | undefined | null) {
  if (!type) return undefined;
  return MBTI_TYPES.find((t) => t.type === type);
}

export const normalDifficultyMap = {
  easy: { label: "简单", color: "success" as const },
  medium: { label: "中等", color: "secondary" as const },
  hard: { label: "困难", color: "destructive" as const },
  unrated: { label: "暂无评级", color: "outline" as const }
} as const

export const oiDifficultyMap = {
  beginner: { label: "入门/蒟蒻", color: "success" as const },
  basic: { label: "普及-", color: "success" as const },
  basicplus: { label: "普及/提高-", color: "secondary" as const },
  advanced: { label: "普及+/提高", color: "secondary" as const },
  advplus: { label: "提高+/省选-", color: "destructive" as const },
  provincial: { label: "省选/NOI-", color: "destructive" as const },
  noi: { label: "NOI/NOI+/CTSC", color: "destructive" as const },
  unrated: { label: "暂无评级", color: "outline" as const }
} as const

export type DifficultyMapItem = {
  label: string
  color: 'success' | 'secondary' | 'destructive' | 'outline'
} 
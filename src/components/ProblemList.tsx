import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: number;
}

const problems: Problem[] = [
  { id: 1, title: "两数之和", difficulty: "Easy", acceptance: 85 },
  { id: 2, title: "最长回文子串", difficulty: "Medium", acceptance: 72 },
  { id: 3, title: "寻找两个正序数组的中位数", difficulty: "Hard", acceptance: 65 },
  // 这里可以添加更多题目
];

const difficultyColors = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
};

export default function ProblemList() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>题目列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">#{problem.id}</span>
                <span className="font-medium">{problem.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={difficultyColors[problem.difficulty]}>
                  {problem.difficulty}
                </span>
                <span className="text-gray-600">{problem.acceptance}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
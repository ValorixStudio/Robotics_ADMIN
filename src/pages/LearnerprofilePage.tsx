import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { studentApi } from "@/services/api";
import type { Student } from "@/services/api/types";

const skills = [
  { name: "Recall & Recognize", sub: "Retrieve information", value: 85, color: "#ef4444", x: 70, y: 86, align: "right" },
  { name: "Interpret & Explain", sub: "Understand & communicate", value: 80, color: "#14b8a6", x: 70, y: 202, align: "right" },
  { name: "Apply & Solve", sub: "Use in new situations", value: 74, color: "#2563eb", x: 250, y: 264, align: "center" },
  { name: "Dissect & Examine", sub: "Analyze deeply", value: 71, color: "#22c55e", x: 430, y: 202, align: "left" },
  { name: "Judge & Justify", sub: "Evaluate & decide", value: 62, color: "#f59e0b", x: 430, y: 86, align: "left" },
  { name: "Innovate", sub: "Design & create", value: 68, color: "#7c3aed", x: 250, y: 40, align: "center" },
];

const styles = [
  ["Visual Learner", 45, "bg-violet-600"],
  ["Kinesthetic Learner", 30, "bg-cyan-500"],
  ["Auditory Learner", 15, "bg-amber-400"],
  ["Reading / Writing Learner", 10, "bg-blue-500"],
] as const;

const interests = [
  ["RB", "Robotics", 90, "bg-emerald-500"],
  ["CD", "Coding", 85, "bg-green-500"],
  ["3D", "Design & 3D", 75, "bg-cyan-500"],
  ["AI", "AI & ML", 60, "bg-orange-400"],
  ["EL", "Electronics", 55, "bg-amber-400"],
] as const;

const defaultStudent: Student = {
  id: "STU12345",
  name: "Arjun Patel",
  email: "arjun@example.com",
  grade: 10,
  courses: 3,
  status: "Active",
  quizStats: {
    solved: 18,
    total: 25,
    correct: 164,
    totalQuestions: 210,
    averageTimeSeconds: 750,
  },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getAccuracy(student: Student) {
  return student.quizStats.totalQuestions > 0
    ? Math.round((student.quizStats.correct / student.quizStats.totalQuestions) * 100)
    : 0;
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0m 00s";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function nameSeed(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function Title({ n, text }: { n: string; text: string }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <h2 className="text-[13px] font-bold text-gray-950">
        {n}. {text}
      </h2>
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-400">
        i
      </span>
    </div>
  );
}

function Ring({ size = 132, value = 72 }: { size?: number; value?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const dash = 2 * Math.PI * radius;
  const offset = dash - (dash * value) / 100;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#edf0f6" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#6d3fea"
        strokeLinecap="round"
        strokeWidth={stroke}
        strokeDasharray={dash}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-violet-700 text-2xl font-bold">
        {value}%
      </text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-700 text-[10px] font-bold">
        Strong Learner
      </text>
    </svg>
  );
}

function Bar({ label, value, color, tag }: { label: string; value: number; color: string; tag?: string }) {
  return (
    <div className="grid grid-cols-[74px_minmax(0,1fr)_42px] items-center gap-2 text-[10px]">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-right font-bold text-gray-600">{tag ?? `${value}%`}</span>
    </div>
  );
}

export default function LearnerProfilePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routedStudent = (location.state as { student?: Student } | null)?.student;
  const [student, setStudent] = useState<Student>(routedStudent ?? defaultStudent);
  const [isLoadingStudent, setIsLoadingStudent] = useState(!routedStudent && Boolean(searchParams.get("studentId")));

  useEffect(() => {
    if (routedStudent) {
      setStudent(routedStudent);
      setIsLoadingStudent(false);
      return;
    }

    const studentId = searchParams.get("studentId");
    if (!studentId) return;

    let isMounted = true;
    setIsLoadingStudent(true);

    studentApi
      .list()
      .then((response) => {
        const matchedStudent = response.data.find((item) => item.id === studentId);
        if (isMounted && matchedStudent) setStudent(matchedStudent);
      })
      .catch(() => {
        // Keep the fallback profile visible if the API is unavailable.
      })
      .finally(() => {
        if (isMounted) setIsLoadingStudent(false);
      });

    return () => {
      isMounted = false;
    };
  }, [routedStudent, searchParams]);

  const dashboard = useMemo(() => {
    const accuracy = getAccuracy(student);
    const solvedPercent =
      student.quizStats.total > 0 ? Math.round((student.quizStats.solved / student.quizStats.total) * 100) : 0;
    const overallScore = clamp(Math.round(accuracy * 0.72 + solvedPercent * 0.28), 35, 98);
    const seed = nameSeed(student.name);
    const activeMonths = 4 + (seed % 16);
    const activities = student.quizStats.solved * 6 + Math.max(0, Number(student.courses) || 0) * 8 + (seed % 11);
    const hours = Math.max(1, Math.round((student.quizStats.averageTimeSeconds * Math.max(student.quizStats.solved, 1)) / 3600));
    const learningSpeed =
      student.quizStats.averageTimeSeconds <= 720 ? "Fast Learner" : student.quizStats.averageTimeSeconds <= 1100 ? "Steady Learner" : "Careful Learner";
    const speedPercent = clamp(Math.round(100 - student.quizStats.averageTimeSeconds / 24), 42, 92);
    const wrongAnswers = Math.max(student.quizStats.totalQuestions - student.quizStats.correct, 0);
    const wrongRate =
      student.quizStats.totalQuestions > 0 ? Math.round((wrongAnswers / student.quizStats.totalQuestions) * 100) : 22;

    const skillValues = skills.map((skill, index) => ({
      ...skill,
      value: clamp(Math.round(skill.value + (overallScore - 72) * 0.35 + ((seed + index * 7) % 9) - 4), 45, 96),
    }));

    const learningStyles = [
      ["Visual Learner", clamp(35 + (seed % 16), 30, 55), "bg-violet-600"],
      ["Kinesthetic Learner", clamp(24 + (student.quizStats.solved % 10), 20, 38), "bg-cyan-500"],
      ["Auditory Learner", clamp(12 + (seed % 8), 10, 24), "bg-amber-400"],
      ["Reading / Writing Learner", 10, "bg-blue-500"],
    ] as const;

    const interestValues = interests.map(([icon, label, value, color], index) => [
      icon,
      label,
      clamp(Number(value) + Math.round((overallScore - 72) * 0.2) + ((seed + index * 5) % 8) - 3, 40, 98),
      color,
    ] as const);

    const mistakes = [
      ["Conceptual Understanding", clamp(wrongRate + 8, 12, 42), "#ef4444"],
      ["Careless Errors", clamp(Math.round(wrongRate * 0.72), 8, 30), "#f97316"],
      ["Step Skipping", clamp(Math.round(wrongRate * 0.55), 6, 24), "#facc15"],
      ["Time Management", clamp(student.quizStats.averageTimeSeconds > 900 ? 18 : 9, 6, 22), "#22c55e"],
      ["Overcomplicating Solutions", clamp(8 + (seed % 8), 6, 18), "#3b82f6"],
    ] as const;

    return {
      accuracy,
      solvedPercent,
      overallScore,
      activeMonths,
      activities,
      hours,
      learningSpeed,
      speedPercent,
      skillValues,
      learningStyles,
      interestValues,
      mistakes,
    };
  }, [student]);

  const firstName = student.name.split(" ")[0] || "Learner";
  const gradeLabel = String(student.grade).toLowerCase().includes("class") ? student.grade : `Grade ${student.grade}`;
  const statusLabel = dashboard.overallScore >= 80 ? "Advanced Learner" : dashboard.overallScore >= 65 ? "Strong Learner" : "Growing Learner";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950">Learner Profile Dashboard</h1>
          <p className="mt-1 text-[11px] font-medium text-gray-600">
            A 360 view of {firstName}'s learning DNA {isLoadingStudent ? "(loading latest data...)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 2v4M16 2v4M4 9h16M5 5h14v15H5z" />
            </svg>
          </div>
          <div>
            <p>Profile Generated On:</p>
            <b className="text-gray-900">25 May 2025</b>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_190px]">
        <aside className="space-y-3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-[#24118f] via-[#3121b3] to-[#5637dd] p-4 text-white">
              <div className="flex items-center gap-3">
                <img
                  src="/learner-arjun.jpeg"
                  alt="Arjun Patel"
                  className="h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-sm"
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{student.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-white/90">{gradeLabel}</p>
                  <p className="mt-1 text-[11px] font-semibold text-white/85">Student ID: {student.id}</p>
                  <span className="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-lg border border-gray-100 bg-white p-3 text-center shadow-sm">
                <p className="text-xs font-bold text-gray-950">Overall Learner Score</p>
                <div className="mt-2 flex justify-center">
                  <Ring value={dashboard.overallScore} />
                </div>
                <svg viewBox="0 0 230 62" className="mt-2 h-16 w-full">
                  {[14, 32, 50].map((y) => (
                    <line key={y} x1="10" x2="220" y1={y} y2={y} stroke="#edf0f5" />
                  ))}
                  <polyline points="18,50 54,42 90,35 126,27 154,30 184,21 215,15" fill="none" stroke="#6d3fea" strokeWidth="2.5" />
                  {[18, 54, 90, 126, 154, 184, 215].map((x, i) => (
                    <circle key={x} cx={x} cy={[50, 42, 35, 27, 30, 21, 15][i]} r="3" fill="#6d3fea" />
                  ))}
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => (
                    <text key={m} x={18 + i * 39} y="60" className="fill-gray-500 text-[8px]">
                      {m}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="rounded-lg bg-violet-50 p-3 text-xs leading-5 text-gray-700">
                {firstName} solved {student.quizStats.solved} quizzes with {dashboard.accuracy}% accuracy. Keep building the streak.
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-xs font-bold text-gray-950">At a Glance</h2>
            <div className="mt-3 space-y-3">
              {[
                ["Active Since", `${dashboard.activeMonths} months ago`],
                ["Total Activities", String(dashboard.activities)],
                ["Avg. Accuracy", `${dashboard.accuracy}%`],
                ["Time Spent Learning", `${dashboard.hours} hrs`],
                ["Avg. Quiz Time", formatTime(student.quizStats.averageTimeSeconds)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-[11px]">
                  <span className="text-gray-500">{label}</span>
                  <b className="text-gray-900">{value}</b>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <main className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4">
            <Title n="1" text="Cognitive Profile (Thinking Skills)" />
            <svg viewBox="0 0 500 300" className="h-[235px] w-full">
              <polygon points="250,60 360,122 360,220 250,276 140,220 140,122" fill="#f4efff" stroke="#ddd6fe" />
              <polygon points="250,105 315,142 318,196 250,235 181,198 183,143" fill="#7c3aed22" stroke="#6d3fea" strokeWidth="2.4" />
              <g stroke="#e7e5f8" strokeWidth="1">
                <line x1="250" y1="60" x2="250" y2="276" />
                <line x1="140" y1="122" x2="360" y2="220" />
                <line x1="360" y1="122" x2="140" y2="220" />
                <polygon points="250,112 326,154 326,206 250,248 174,206 174,154" fill="none" />
                <polygon points="250,166 280,184 280,206 250,224 220,206 220,184" fill="none" />
              </g>
              {dashboard.skillValues.map((skill) => {
                const textX = skill.align === "right" ? skill.x - 26 : skill.align === "left" ? skill.x + 26 : skill.x;
                const anchor = skill.align === "right" ? "end" : skill.align === "left" ? "start" : "middle";
                return (
                  <g key={skill.name}>
                    <circle cx={skill.x} cy={skill.y} r="13" fill={skill.color} />
                    <text x={skill.x} y={skill.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
                      {skill.value}
                    </text>
                    <text x={textX} y={skill.y - 6} textAnchor={anchor} className="fill-gray-800 text-[9px] font-bold">
                      {skill.name}
                    </text>
                    <text x={textX} y={skill.y + 8} textAnchor={anchor} className="fill-gray-500 text-[7px]">
                      {skill.sub}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="rounded-lg bg-violet-50 px-3 py-2.5 text-xs leading-5 text-gray-700">
              <b>Strong in understanding and applying concepts.</b> Keep building skills in evaluation and innovation.
            </div>
          </Card>

          <Card className="p-4">
            <Title n="2" text="Learning Style" />
            <div className="grid items-center gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
              <div className="mx-auto h-36 w-36 rounded-full bg-[conic-gradient(#6d3fea_0_45%,#22c55e_45%_75%,#f59e0b_75%_90%,#3b82f6_90%_100%)] p-7">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold text-violet-500">
                  AI
                </div>
              </div>
              <div className="space-y-3">
                {dashboard.learningStyles.map(([label, value, color]) => (
                  <Bar key={label} label={label} value={value} color={color} />
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-violet-50 px-3 py-3 text-xs leading-5 text-gray-700">
              You learn best through visual materials and hands-on activities. Use diagrams, videos, and real-world examples.
            </div>
          </Card>

          <Card className="p-4">
            <Title n="3" text="Speed of Learning" />
            <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
              <div className="text-center">
                <svg viewBox="0 0 170 105" className="mx-auto h-24 w-40">
                  <path d="M28 86 A57 57 0 0 1 142 86" fill="none" stroke="#e5e7eb" strokeWidth="13" strokeLinecap="round" />
                  <path d="M28 86 A57 57 0 0 1 142 86" fill="none" stroke="url(#speed)" strokeWidth="13" strokeLinecap="round" strokeDasharray="179" strokeDashoffset="42" />
                  <line x1="85" y1="86" x2="120" y2="48" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="85" cy="86" r="6" fill="#1f2937" />
                  <defs>
                    <linearGradient id="speed" x1="0" x2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="55%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <p className="text-xs font-bold text-gray-950">{dashboard.learningSpeed}</p>
                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                  Faster than {dashboard.speedPercent}% of learners.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-950">Topic Mastery Speed</p>
                {[
                  ["Robotics", clamp(dashboard.overallScore + 12, 35, 98), "bg-green-500", dashboard.overallScore > 70 ? "Fast" : "Steady"],
                  ["Coding", clamp(dashboard.accuracy + 8, 35, 98), "bg-green-500", dashboard.accuracy > 70 ? "Fast" : "Steady"],
                  ["Electronics", clamp(dashboard.solvedPercent + 18, 30, 92), "bg-amber-400", "Moderate"],
                  ["Math", clamp(dashboard.accuracy - 6, 30, 88), "bg-orange-400", "Moderate"],
                  ["Design", clamp(dashboard.overallScore + 6, 35, 96), "bg-green-500", dashboard.overallScore > 70 ? "Fast" : "Steady"],
                ].map(([label, value, color, tag]) => (
                  <Bar key={label} label={String(label)} value={Number(value)} color={String(color)} tag={String(tag)} />
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <Title n="4" text="Mistake Patterns" />
            <div className="grid gap-4 sm:grid-cols-[130px_minmax(0,1fr)]">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#ef4444_0_35%,#f97316_35%_60%,#facc15_60%_80%,#22c55e_80%_90%,#3b82f6_90%_100%)] p-6">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xl font-bold text-orange-500">
                  !
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-950">You commonly struggle with:</p>
                <div className="mt-2 space-y-1.5">
                  {dashboard.mistakes.map(([label, value, color]) => (
                    <div key={String(label)} className="flex items-center gap-2 text-[10px]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(color) }} />
                      <span className="flex-1 text-gray-600">{label}</span>
                      <b>{value}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-gray-700">
              Focus on deep understanding and reviewing steps carefully.
            </div>
          </Card>

          <Card className="p-4">
            <Title n="5" text="Interest Areas" />
            <div className="grid grid-cols-5 gap-2 text-center">
              {dashboard.interestValues.map(([icon, label, value, color]) => (
                <div key={label} className="min-w-0">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-700">
                    {icon}
                  </div>
                  <p className="mt-1 truncate text-[10px] font-bold text-gray-700">{label}</p>
                  <p className="text-xs font-bold text-gray-900">{value}%</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs leading-5 text-gray-700">
              {firstName}'s top interests are Robotics, Coding, and Design.
            </div>
          </Card>

          <Card className="p-4">
            <Title n="6" text="Personalized Recommendations" />
            <div className="space-y-2">
              {[
                ["Strengthen Evaluation Skills", `${firstName} should try decision-making, comparing options, and justifying solutions.`, "bg-violet-50", "text-violet-700"],
                ["Improve Quiz Accuracy", `Review wrong answers after each quiz. Current accuracy is ${dashboard.accuracy}%.`, "bg-blue-50", "text-blue-700"],
                ["Recommended Path", "Robotics Engineer / Product Designer / AI Developer.", "bg-emerald-50", "text-emerald-700"],
              ].map(([title, body, bg, color]) => (
                <div key={title} className={`rounded-lg ${bg} px-3 py-2`}>
                  <p className={`text-xs font-bold ${color}`}>{title}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-gray-600">{body}</p>
                </div>
              ))}
            </div>
          </Card>
        </main>

        <aside className="space-y-3">
          <Card className="p-4">
            <h2 className="text-xs font-bold text-gray-950">Overall Summary</h2>
            <div className="mt-3 flex justify-center">
              <Ring size={112} value={dashboard.overallScore} />
            </div>
            <p className="mt-2 text-center text-xs font-bold text-violet-700">{statusLabel}</p>
            <p className="mt-3 text-center text-[10px] leading-4 text-gray-500">
              {student.name} has solved {student.quizStats.solved}/{student.quizStats.total} quizzes with {dashboard.accuracy}% accuracy.
            </p>
            <h3 className="mt-5 text-xs font-bold text-gray-950">Next Steps</h3>
            <div className="mt-3 space-y-3">
              {[
                dashboard.accuracy < 75 ? "Revise incorrect quiz answers weekly" : "Take up advanced projects in robotics and coding",
                "Practice real-world problem statements",
                student.quizStats.averageTimeSeconds > 900 ? "Improve quiz speed with timed practice" : "Work on evaluation and decision-making activities",
                "Collaborate in team projects to enhance learning",
              ].map((step) => (
                <div key={step} className="flex gap-2 text-[10px] leading-4 text-gray-600">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                    ok
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-md bg-[#6d3fea] px-3 py-2 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-[#5930ce]">
              View Detailed Report
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

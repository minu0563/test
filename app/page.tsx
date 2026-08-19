"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, PencilLine, MessageSquareText, FilePenLine, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/login/LoginModal";
import ProfileGateModal from "@/components/profile/ProfileGateModal";
import { sessionHref, type ChatIntent } from "@/lib/intent";
import type { MissingKey } from "@/lib/profile-constants";

type Readiness = {
  status: "BLOCKED" | "PARTIAL" | "READY";
  missing: MissingKey[];
  weak: MissingKey[];
};

type Template = {
  icon: typeof FileText;
  title: string;
  description: string;
  intent?: ChatIntent;
  path?: string;
};

const templates: Template[] = [
  {
    icon: FilePenLine,
    title: "자기소개서 & 이력서 첨삭",
    description: "강점을 극대화하고 미흡한 문항과 표현을 즉시 개선합니다.",
    intent: "REVIEW",
  },
  {
    icon: PencilLine,
    title: "자기소개서 작성",
    description: "개별 경험 데이터와 에피소드를 구조화하여 맞춤형 초안을 완성합니다.",
    intent: "WRITE",
  },
  {
    icon: MessageSquareText,
    title: "면접 준비",
    description: "지원 직무와 기업 분석을 기반으로 예상 질문과 답변 전략을 준비합니다.",
    intent: "INTERVIEW",
  },
  {
    icon: FileText,
    title: "정보 입력",
    description: "AI가 기억했으면 하는 정보를 입력하세요.",
    path: "/p",
  },
];

export default function StartScreen() {
  const [intro, setIntro] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [gate, setGate] = useState<{ readiness: Readiness; intent: ChatIntent } | null>(null);

  const router = useRouter();

  const goStratChat = () => {
    setIsLoading(true);
    setTimeout(() => router.push("/sc"), 700);
  };

  const goTo = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
      setIsLoading(false);
    }, 700);
  };

  /** 대화방을 만들고 해당 모드 경로로 이동 */
  const startSession = async (intent: ChatIntent) => {
    setGate(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      if (!res.ok) throw new Error();

      const created = await res.json();
      router.push(sessionHref(intent, created.id));
    } catch {
      setIsLoading(false);
      alert("대화방을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  /** 프로필이 충분한지 먼저 확인한 뒤 진입 */
  const handlePick = async (item: Template) => {
    if (item.path) {
      goTo(item.path);
      return;
    }
    if (!item.intent) return;

    if (status !== "authenticated") {
      setLoginOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/profile/readiness?intent=${item.intent}`);
      if (!res.ok) throw new Error();

      const readiness: Readiness = await res.json();

      if (readiness.status === "READY") {
        await startSession(item.intent);
      } else {
        setIsLoading(false);
        setGate({ readiness, intent: item.intent });
      }
    } catch {
      // 확인에 실패하면 막지 않고 그냥 진입시킨다
      await startSession(item.intent);
    }
  };

  useEffect(() => {
    const viewed = sessionStorage.getItem("start-intro");

    if (viewed) {
      setIntro(false);
      return;
    }

    sessionStorage.setItem("start-intro", "true");
    setIntro(true);

    const timer1 = setTimeout(() => setIntroStep(1), 1500);
    const timer2 = setTimeout(() => setIntroStep(2), 4000);
    const timer3 = setTimeout(() => setIntro(false), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-(--bg) text-(--text)">
      <AnimatePresence>
        {intro && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-(--start-intro-bg)">

            {introStep === 0 && (
              <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.5 }}
                className="text-4xl font-semibold tracking-tight text-(--start-intro-text)">
                안녕하세요
              </motion.h1>
            )}

            {introStep >= 1 && (
              <div className="absolute flex items-center justify-center">
                <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-4xl font-semibold tracking-tight text-(--start-intro-text)">
                  <span className="text-blue-300">인천전자마이스터고</span> 학생을 위한 자소서 AI입니다
                </motion.h1>

                {introStep === 2 && (
                  <motion.h1 initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="absolute top-full mt-6 text-2xl font-semibold tracking-tight text-(--start-intro-text)">
                    무엇을 도와드릴까요?
                  </motion.h1>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-(--bg)"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative h-14 w-14">
                <motion.div className="absolute inset-0 rounded-full border-2 border-(--start-card-border)" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-(--start-accent)"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-(--start-description)"
              >
                대화방을 준비하고 있습니다...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: intro ? 0 : 1, y: intro ? 20 : 0 }} transition={{ duration: 0.6 }}
        className="flex flex-col max-w-4xl mx-auto px-8 py-20">
        <div className="mb-14">
          <h1 className="text-3xl font-semibold tracking-tight text-(--start-title)">
            무엇을 도와드릴까요?
          </h1>

          <p className="mt-3 text-sm text-(--start-description) max-w-xl leading-relaxed">
            시작할 작업 유형을 선택해 주세요. 해당 형식에 최적화된 AI 템플릿을 제공합니다.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.button key={item.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: intro ? 0 : 1, y: intro ? 15 : 0 }} transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex flex-col justify-between text-left rounded-xl border border-(--start-card-border) bg-(--start-card-bg) p-6 min-h-42.5 
                                         transition-all duration-200 hover:border-(--start-accent) hover:bg-(--start-card-hover) hover:-translate-y-1 cursor-pointer"
                onClick={() => handlePick(item)}>
                <div className="flex items-start justify-between w-full">
                  <Icon size={20} strokeWidth={1.5} className="text-(--start-icon) group-hover:text-(--start-icon-hover) transition-colors" />
                  <ArrowRight size={16} strokeWidth={1.5} className="text-(--start-arrow) group-hover:text-(--start-arrow-hover) group-hover:translate-x-1 transition-all" />
                </div>

                <div className="mt-8">
                  <h3 className="text-[15px] font-semibold text-(--start-title) group-hover:text-(--start-accent) transition-colors">{item.title}</h3>
                  <p className="mt-2 text-xs text-(--start-description) leading-relaxed">{item.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: intro ? 0 : 1 }} transition={{ delay: 0.4 }} onClick={goStratChat}
          className="group mt-4 w-full flex items-center justify-between rounded-xl border border-dashed border-(--start-card-border) bg-transparent p-5 
                               transition-all duration-200 hover:border-(--start-accent) hover:bg-(--start-card-hover) cursor-pointer">
          <div className="flex items-center gap-4 text-left">
            <MessageSquareText size={20} strokeWidth={1.5} className="text-(--start-icon) group-hover:text-(--start-icon-hover)" />
            <div>
              <h3 className="text-sm font-semibold text-(--start-title)">
                자유롭게 질문하기
              </h3>
              <p className="mt-1 text-xs text-(--start-description)">
                원하는 내용을 입력하고 AI와 대화를 시작하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-(--start-description) group-hover:text-(--start-accent)">
            대화방 열기
            <ArrowRight size={14} />
          </div>
        </motion.button>

        <p className="text-(--start-description) text-center mt-5 text-xs underline cursor-pointer"
          onClick={() => setLoginOpen(true)}>
          {status !== "authenticated" ? "로그인" : "사용자 정보"}
        </p>
      </motion.div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />

      <AnimatePresence>
        {gate && (
          <ProfileGateModal
            missing={gate.readiness.missing}
            weak={gate.readiness.weak}
            from={gate.intent.toLowerCase()}
            onSkip={() => startSession(gate.intent)}
            onClose={() => setGate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
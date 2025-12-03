"use client";

import { useEffect, useState } from "react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function OpenXQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

async function fetchQuestions() {
  try {
    const res = await fetch(
      "https://docs.openxai.org/tokenomics-and-economic-design/smart-contracts"
    );
    const text = await res.text();
    const lines = text.split("\n");
    const qs: Question[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("##")) {
        const question = line.replace(/^##\s*/, "");
        const options: string[] = [];
        let answer = "";
        for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
          const optLine = lines[j].trim();
          if (optLine.startsWith("- ")) {
            options.push(optLine.replace(/^- /, ""));
          } else if (optLine.startsWith("* ")) {
            answer = optLine.replace(/^\* /, "");
          }
        }
        if (question && options.length === 4 && answer) {
          const shuffledOptions = options.sort(() => Math.random() - 0.5);
          qs.push({ question, options: shuffledOptions, answer });
        }
      }
    }
    const shuffled = qs.sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 100));
    setLoading(false);
  } catch (e) {
    console.error(e);
  }
}

useEffect(() => {
  fetchQuestions();
}, []);

  const handleSelect = (opt: string) => {
    if (opt === questions[current].answer) {
      const newCorrect = correctCount + 1;
      if (newCorrect === 100) {
        setGameOver(true);
      } else {
        setCorrectCount(newCorrect);
        setCurrent(current + 1);
        setSelected(null);
      }
    } else {
      alert(`Wrong! Correct answer: ${questions[current].answer}`);
      setCorrectCount(0);
      setCurrent(0);
      setSelected(null);
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (gameOver) return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xl">Congratulations! You completed 100 questions.</p>
      <Share text={`I scored ${correctCount} out of ${questions.length} in the OpenX quiz! ${url}`} />
      <button
        className="border rounded p-2 hover:bg-gray-200"
        onClick={() => {
          setQuestions([]);
          setCurrent(0);
          setSelected(null);
          setCorrectCount(0);
          setGameOver(false);
          setLoading(true);
          fetchQuestions();
        }}
      >
        Retake Quiz
      </button>
    </div>
  );

  const q = questions[current];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl">{`Question ${current + 1}`}</h2>
      <p>{q.question}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            className="border rounded p-2 hover:bg-gray-200"
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <p>{`Correct streak: ${correctCount}`}</p>
    </div>
  );
}

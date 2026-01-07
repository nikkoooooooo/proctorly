import React from 'react'

interface Option {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizCardProps {
  question: string
  choices: Option[]
}

function QuizCard({ question, choices }: QuizCardProps) {
  const labels = ["A", "B", "C", "D"] // optional, for labeling options

  return (
    <div className="card p-4 w-full text-center">
      <h2 className="font-semibold my-10 text-2xl">{question}</h2>
      <div className="flex flex-col gap-2">
        {choices.map((choice, index) => (
          <div key={choice.id} className="bg-background p-4 rounded-md">
            <div className="flex gap-4 items-center">
              <span className="p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10">
                {labels[index] || String.fromCharCode(65 + index)}
              </span>
              <button className="cursor-pointer font-semibold text-xl">
                {choice.text}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizCard

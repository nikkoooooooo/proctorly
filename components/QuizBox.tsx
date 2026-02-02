import React from 'react'
import Link from 'next/link'

interface Props {
    path: string
    emoji: string
    quizCount?: number
    title: string
    description: string
}
function QuizBox({ path, emoji, quizCount, title, description }: Props) {
  return (
    <Link href={path} className="block w-84">
      <div className="card p-4 w-84 cursor-pointer hover:shadow-lg transition-all">
        <div className="flex justify-between text-4xl mb-2 text-muted">
          {emoji}
          <span>→</span>
        </div>
        <span></span>
        <span className="w-full text-4xl text-primary font-semibold">{quizCount}</span>
        <h3 className="font-semibold text-2xl">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
    </Link>
  )
}


export default QuizBox
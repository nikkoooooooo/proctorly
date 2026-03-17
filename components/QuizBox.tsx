import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface Props {
    path: string
    icon: LucideIcon
    quizCount?: number
    title: string
    description: string
}
function QuizBox({ path, icon: Icon, quizCount, title, description }: Props) {
  return (
    <Link href={path} className="block w-84">
      <div className="card p-4 w-84 cursor-pointer hover:shadow-lg transition-all">
        {/* Use foreground so the arrow stays visible in both themes */}
        <div className="flex justify-between text-4xl mb-2 text-foreground">
          <Icon className="h-9 w-9" aria-hidden="true" />
          <span>→</span>
        </div>
        <span></span>
        <span className="w-full text-4xl text-primary font-semibold">{quizCount}</span>
        <h3 className="font-semibold text-2xl">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}


export default QuizBox

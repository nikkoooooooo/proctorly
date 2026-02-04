import React from 'react'


interface QuizStatCardProp {
    title: string
    value: number
}

function QuizStatCard({title, value}: QuizStatCardProp) {
  return (
    <div className='card mt-5 py-1 pl-4 pr-50 w-full'>
        <div className='flex gap-2 w-80'>
            <h3 className='text-muted-foreground text-xl'>{title}:</h3>
            <p className='text-xl font-semibold text-foreground'>{value}</p>
        </div> 
    </div>
  )
}

export default QuizStatCard

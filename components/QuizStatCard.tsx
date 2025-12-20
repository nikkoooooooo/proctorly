import React from 'react'


interface QuizStatCardProp {
    title: string
    value: number
}

function QuizStatCard({title, value}: QuizStatCardProp) {
  return (
    <div className='card mt-10 py-5 pl-4 pr-50 '>
        <div className='flex flex-col gap-4'>
            <h3 className='text-muted'>{title}</h3>
            <p className='text-4xl font-semibold'>{value}</p>
        </div> 
    </div>
  )
}

export default QuizStatCard
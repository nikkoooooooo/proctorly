import React from 'react'


interface QuizCardProps {
    question: string
    choices: string,

}

function QuizCard({ question, choices } : QuizCardProps) {
  return (
    <div className='card p-4 w-full text-center'>
        <h2 className='font-semibold my-10 text-2xl'>{question}</h2>
        <div className='flex flex-col gap-2'>
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10'>A</span>
                    <button className='cursor-pointer font-semibold text-xl'>{choices}</button>
                </div>
            </div>

           <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10'>B</span>
                    <button className='cursor-pointer font-semibold text-xl'>{choices}</button>
                </div>
            </div>
            
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10'>C</span>
                    <button className='cursor-pointer font-semibold text-xl'>{choices}</button>
                </div>
            </div>
            
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%] w-10'>D</span>
                    <button className='cursor-pointer font-semibold text-xl'>{choices}</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default QuizCard
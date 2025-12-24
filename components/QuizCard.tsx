import React from 'react'


interface QuizCardProps {
    title: string
    choices: string,

}

function QuizCard({ title, choices } : QuizCardProps) {
  return (
    <div className='card p-4 w-full text-center'>
        <h2 className='font-semibold my-10 text-2xl'>{title}</h2>
        <div className='flex flex-col gap-2'>
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%]'>A</span>
                    <button className='cursor-pointer'>{choices}</button>
                </div>
            </div>

           <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%]'>B</span>
                    <button className='cursor-pointer'>{choices}</button>
                </div>
            </div>
            
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%]'>C</span>
                    <button className='cursor-pointer'>{choices}</button>
                </div>
            </div>
            
            <div className='bg-background p-4 rounded-md'>
                <div className='flex gap-4'>
                    <span className='p-2 bg-[#3b82f630] text-primary rounded-[50%]'>D</span>
                    <button className='cursor-pointer'>{choices}</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default QuizCard
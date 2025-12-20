import React from 'react'

function JoinQuizInput() {
  return (
    <>
    <div className='card p-4'>
        <div>
            <h2 className='font-semibold text-2xl'>Join Quiz</h2>
            <p className='text-muted'>Enter a 6-character quiz code to join</p>
        </div>
     
        <form className='w-full flex gap-4 pt-4' >
            <input 
                type="text" 
                className="bg-background rounded-md w-full py-2 px-2 text-xl"
                placeholder='ABC123'
                />
            <button className='bg-primary py-2 px-6 rounded-md font-semibold w-32'>Join Quiz</button>
        </form>

    </div>
    </>
  )
}

export default JoinQuizInput
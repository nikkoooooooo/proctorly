import React from 'react'


interface Props {
    time: number
}

function TimerCard({ time } : Props) {
  return (
     <div className="w-32 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md">
              <span className="text-4xl">⏱️</span>
              <span className="text-2xl font-semibold">{Math.floor(time/60)}:{String(time%60).padStart(2,'0')}</span>
              <p className="text-muted">Time Left</p>
    </div>
  )
}

export default TimerCard



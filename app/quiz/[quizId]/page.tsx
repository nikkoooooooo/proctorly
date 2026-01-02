import QuizCard from "@/components/QuizCard"
function QuizPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="flex flex-col  mt-20 px-4 max-w-7xl w-full items-center gap-4">

        <div className="bg-background w-full flex justify-center gap-10">

          {/* timer card */}
          <div className="w-34 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md">
            <span className="text-4xl">⏱️</span>
            <span className="text-2xl font-semibold">0:30</span>
            <p className="text-muted">Time Left</p>
          </div>

          {/* timer card */}

          {/* tab card */}
          <div className="w-34 p-4 flex flex-col items-center gap-2 bg-secondary rounded-md">
              <span className="text-4xl">🔄</span>
              <span className="text-2xl font-semibold">0</span>
              <p className="text-muted">Tab Switches</p>

          </div>
          {/* tab card */}


          
        </div>
         <QuizCard
        question="Quiz of the century tuna"
        choices="I love building things"
        />
      </div>
    </div>
  )
}

export default QuizPage
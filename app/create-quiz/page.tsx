
import CreateQuizHeader from "@/components/CreateQuizHeader"
import Link from "next/link"

function CreatePage() {
  return (
    <div className='min-h-screen bg-background flex justify-center'>
      
      <div className='max-w-7xl w-full my-5'>
        <Link href='/dashboard' className="text-white font-semibold text-2xl pl-4">
          ← BACK
        </Link>

        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-4xl">
             <form action="">
                <div>
                  <CreateQuizHeader/>
                </div>
            </form>
          </div>
        </div>
        
      </div>

     
    </div>
  )
}

export default CreatePage
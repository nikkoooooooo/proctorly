


function CreateQuizHeader() {
  return (
        <div className="p-6 mt-5 ">

            <div className="flex flex-col gap-4">
                <div className="card mt-2 flex flex-col gap-2 p-5">
                    <h2 className="font-semibold text-2xl">Quiz Information</h2>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-xl font-semibold">Title:</label>
                        <input
                            type="text" 
                            name="title" 
                            className="bg-background p-3 rounded-md"
                            placeholder="Title"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-xl font-semibold">Description:</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            rows={2} 
                            placeholder="Description"
                            className="bg-background p-3 rounded-md"
                            >
                        </textarea>
                    </div>
                </div>


                <div className="card mt-2 flex flex-col gap-2 p-5">
                        <h2 className="font-semibold text-2xl">Proctoring Features</h2>

                    <div className="flex gap-2 bg-background p-2 py-4 rounded-md">
                        <input type="checkbox" className=""/>
                        <p className="font-semibold">👁️ Blur Question</p>
                    </div>
                        <div className="flex gap-2 bg-background p-2 py-4 rounded-md">
                        <input type="checkbox" className=""/>
                        <p className="font-semibold">🚫 Disable Copy & Paste</p>
                    </div>
                        <div className="flex gap-2 bg-background p-2 py-4 rounded-md">
                        <input type="checkbox" className=""/>
                        <p className="font-semibold">📊 Tab Monitoring</p>
                    </div>
                </div>
            </div>
            
        </div>
  )
}

export default CreateQuizHeader
"use client"

import { useState, useEffect } from "react"
import { v4 as uuid } from "uuid"
import { createQuiz } from "@/lib/helpers/createQuiz" // keep for later use
import { getSession } from "@/lib/auth-actions"
import { error } from "console"

// Question type options
type QuestionType = "mcq" | "true-false"

// Option structure
interface Option {
  id: string
  text: string
  isCorrect: boolean
}

// Question structure
interface Question {
  id: string
  text: string
  type: QuestionType
  options: Option[]
  description: string

}

// Main Create Quiz Page
export default function CreateQuizPage() {
  // getting session state
  const [userId, setUserId] = useState<string | null>(null)

  // Quiz title state
  const [title, setTitle] = useState("")

  // Quiz description state
  const [description, setDescription] = useState("")

  // State for all questions
  const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()])

   useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession() // server action call
      if (session?.userId) setUserId(session?.userId)
    }
    fetchUser()
  }, [])

  // Helper: create an empty question
  function createEmptyQuestion(): Question {
    return {
      id: uuid(), // unique question ID
      text: "", // empty question text
      description: "",
      type: "mcq", // default question type
      options: [
        { id: uuid(), text: "", isCorrect: true },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
        { id: uuid(), text: "", isCorrect: false },
      ],
    }
  }

  // Add a new question
  const addQuestion = () => {
    setQuestions(prev => [...prev, createEmptyQuestion()])
  }

  // Remove a question by ID
  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  // Update question text
  const updateQuestionText = (id: string, newText: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, text: newText } : q))
    )
  }

  // Update option text
  const updateOptionText = (questionId: string, optionId: string, newText: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map(o =>
            o.id === optionId ? { ...o, text: newText } : o
          ),
        }
      })
    )
  }

  // Set correct answer for a question (only one option is correct for MCQ)
  const setCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q
        return {
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.id === optionId,
          })),
        }
      })
    )
  }

  // Update question type
  const setQuestionType = (questionId: string, newType: QuestionType) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, type: newType } : q))
    )
  }



   const submitQuiz = async () => {

    if (!userId) return alert("user not logged in")


    if (!title) return alert("Quiz title cannot be empty");
    if (questions.length === 0) return alert("Add at least one question");

    

    try {
      const quizId = await createQuiz(userId, title, questions, description);
      alert(`Quiz created! ID: ${quizId}`);
      setTitle("");
      setDescription("");
      setQuestions([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="p-6 space-y-6">
      
    <form action={submitQuiz} className="space-y-6">
      {/* QUIZ HEADER */}
      <div className="card p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Quiz Information</h2>

        {/* Quiz title input */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Title</label>
          <input
            value={title} // controlled input
            onChange={(e) => setTitle(e.target.value)} // update title state
            className="bg-background p-3 rounded-md"
            placeholder="Quiz title"
          />
        </div>

        {/* Quiz description input */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)} // update description state
            className="bg-background p-3 rounded-md"
            rows={2}
            placeholder="Quiz description"
          />
        </div>
      </div>

      {/* PROCTORING UI (design only) */}
      <div className="card p-5 space-y-3">
        <h2 className="text-2xl font-semibold">Proctoring Features</h2>

        <div className="flex gap-2 bg-background p-3 rounded-md">
          <input type="checkbox" />
          <p className="font-semibold">👁️ Blur Question</p>
        </div>

        <div className="flex gap-2 bg-background p-3 rounded-md">
          <input type="checkbox" />
          <p className="font-semibold">🚫 Disable Copy & Paste</p>
        </div>

        <div className="flex gap-2 bg-background p-3 rounded-md">
          <input type="checkbox" />
          <p className="font-semibold">📊 Tab Monitoring</p>
        </div>
      </div>

      {/* QUESTIONS SECTION */}
      <div className="card p-5 space-y-4">
        <h2 className="text-2xl font-semibold">Questions</h2>

        {/* Render each question */}
        {questions.map((question, index) => (
          <div
            key={question.id} // unique key for React
            className="bg-background p-4 rounded-md space-y-3"
          >
            {/* Header: question number, type dropdown, remove button */}
            <div className="flex justify-between">
              <h3>Question {index + 1}</h3>

              <div className="flex gap-2">
                {/* Dropdown to select question type */}
                <select
                  value={question.type}
                  className="bg-secondary p-1 rounded-md"
                  onChange={(e) =>
                    setQuestionType(question.id, e.target.value as QuestionType)
                  }
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="true-false">True / False</option>
                </select>

                {/* Remove question */}
                <button
                  onClick={(e) => {
                      e.preventDefault() // prevent form submission
                      removeQuestion(question.id)
                    }}
                  className="bg-secondary py-1 px-2 rounded-md"
                >
                  remove
                </button>
              </div>
            </div>

            {/* Question text input */}
            <input
              type="text"
              value={question.text} // controlled
              onChange={(e) => updateQuestionText(question.id, e.target.value)}
              placeholder="Enter question"
              className="w-full bg-secondary p-2 rounded-md"
            />

            {/* Options */}
            <div className="flex flex-col gap-2">
              {question.options.map((option, i) => (
                <input
                  key={option.id}
                  value={option.text} // controlled
                  onChange={(e) =>
                    updateOptionText(question.id, option.id, e.target.value)
                  }
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="w-full bg-secondary p-2 rounded-md"
                />
              ))}
            </div>

            {/* Correct answer selector */}
            <div className="flex flex-col w-32">
              <label>Correct Answer:</label>
              <select
                className="bg-secondary p-1 rounded"
                value={question.options.find(o => o.isCorrect)?.id || ""}
                onChange={(e) => setCorrectAnswer(question.id, e.target.value)}
              >
                {question.options.map((option, i) => (
                  <option key={option.id} value={option.id}>
                    Option {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Add question button */}
        <button
           onClick={(e) => {
              e.preventDefault() // stop the form from submitting
              addQuestion()       // now it will actually add a question
          }}
          className="w-full p-2 border border-dashed rounded-md"
        >
          + Add Question
        </button>
      </div>

      <button className="w-full bg-primary p-3 font-semibold rounded-md" type="submit">Create Quiz</button>

    </form>
    </div>
  )
}

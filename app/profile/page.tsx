// "use client";
// import { useState } from "react";
// import toast from "react-hot-toast";

// interface User {
//   name: string;
//   studentNo?: string;
//   section?: string;
// }

// export default function ProfilePage() {
//   const [user, setUser] = useState<User>({
//     name: "John Nikko R Puno",
//     studentNo: "2023-12345",
//     section: "CS 2A",
//   });

//   const [editingField, setEditingField] = useState<keyof User | null>(null);
//   const [tempValue, setTempValue] = useState("");

//   const startEditing = (field: keyof User) => {
//     setEditingField(field);
//     setTempValue(user[field] || "");
//   };

//   const saveField = (field: keyof User) => {
//     setUser(prev => ({ ...prev, [field]: tempValue }));
//     setEditingField(null);
//     toast.success(`${field} updated!`);
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col  p-8">
//       <h1 className="text-3xl font-bold mb-8">My Profile</h1>

//       {/* Full Name */}
//       <div className="card flex flex-col w-full items-center p-4">
//       <div className="w-full max-w-7xl mb-6">
//         <p className="text-gray-500 mb-1 text-xl">Full Name</p>
//         <div className="flex items-center gap-2">
//           {editingField === "name" ? (
//             <>
//               <input
//                 className="flex-1 p-2 border border-gray-300 rounded-md"
//                 value={tempValue}
//                 onChange={e => setTempValue(e.target.value)}
//               />
//               <button
//                 className="bg-blue-600 text-white px-3 py-1 rounded-md"
//                 onClick={() => saveField("name")}
//               >
//                 Save
//               </button>
//             </>
//           ) : (
//             <>
//               <span className="flex-1">{user.name}</span>
//               <button
//                 className="text-blue-600 font-semibold"
//                 onClick={() => startEditing("name")}
//               >
//                 Edit
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Student No */}
//       <div className="w-full max-w-7xl mb-6">
//         <p className="text-gray-500 mb-1 text-xl">Student No</p>
//         <div className="flex items-center gap-2">
//           {editingField === "studentNo" ? (
//             <>
//               <input
//                 className="flex-1 p-2 border border-gray-300 rounded-md"
//                 value={tempValue}
//                 onChange={e => setTempValue(e.target.value)}
//               />
//               <button
//                 className="bg-blue-600 text-white px-3 py-1 rounded-md"
//                 onClick={() => saveField("studentNo")}
//               >
//                 Save
//               </button>
//             </>
//           ) : (
//             <>
//               <span className="flex-1">{user.studentNo}</span>
//               <button
//                 className="text-blue-600 font-semibold"
//                 onClick={() => startEditing("studentNo")}
//               >
//                 Edit
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Section */}
//       <div className="w-full max-w-7xl mb-6">
//         <p className="text-gray-500 mb-1 text-xl">Section</p>
//         <div className="flex items-center gap-2">
//           {editingField === "section" ? (
//             <>
//               <input
//                 className="flex-1 p-2 border border-gray-300 rounded-md"
//                 value={tempValue}
//                 onChange={e => setTempValue(e.target.value)}
//               />
//               <button
//                 className="bg-blue-600 text-white px-3 py-1 rounded-md"
//                 onClick={() => saveField("section")}
//               >
//                 Save
//               </button>
//             </>
//           ) : (
//             <>
//               <span className="flex-1">{user.section}</span>
//               <button
//                 className="text-blue-600 font-semibold"
//                 onClick={() => startEditing("section")}
//               >
//                 Edit
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//       </div>


//     </div>
//   );
// }


import React from 'react'

function profile() {
  return (
    <div className='min-h-screen flex items-center justify-center'>Currently Developing</div>
  )
}

export default profile
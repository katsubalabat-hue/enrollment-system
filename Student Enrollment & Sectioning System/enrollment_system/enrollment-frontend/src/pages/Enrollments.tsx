import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Enrollments() {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    api.get("students/").then((res) => setStudents(res.data));
    api.get("subjects/").then((res) => setSubjects(res.data));
  }, []);

  const enroll = async () => {
    if (!studentId || !subjectId) {
      alert("Please select a student and a subject");
      return;
    }

    try {
      const res = await api.post("enrollments/", {
        student: studentId,
        subject: subjectId,
      });
      alert(`Status: ${res.data.status}`); // ENROLLED or WAITLISTED
    } catch (err: any) {
      if (err.response?.data) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Error enrolling student");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Enroll Student</h1>

      <div className="flex gap-2 mb-4">
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>

        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject_name}
            </option>
          ))}
        </select>

        <button
          onClick={enroll}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Enroll
        </button>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [units, setUnits] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("subjects/");
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleSubmit = async () => {
    if (!subjectCode.trim() || !subjectName.trim() || !units.trim()) {
      alert("Please fill in subject code, name, and units");
      return;
    }
    if (isNaN(Number(units))) {
      alert("Units must be a valid number");
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        await api.put(`subjects/${editingId}/`, {
          subject_code: subjectCode,
          subject_name: subjectName,
          units: Number(units),
        });
      } else {
        // CREATE
        await api.post("subjects/", {
          subject_code: subjectCode,
          subject_name: subjectName,
          units: Number(units),
        });
      }

      // Reset form
      setSubjectCode("");
      setSubjectName("");
      setUnits("");
      setEditingId(null);

      fetchSubjects();
    } catch (err: any) {
      if (err.response?.data) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Error saving subject");
      }
    }
  };

  const handleEdit = (subject: any) => {
    setSubjectCode(subject.subject_code);
    setSubjectName(subject.subject_name);
    setUnits(String(subject.units));
    setEditingId(subject.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this subject?")) return;

    await api.delete(`subjects/${id}/`);
    fetchSubjects();
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subjects</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Subject Code"
          className="border p-2"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject Name"
          className="border p-2"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Units"
          className="border p-2"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <div className="bg-white p-4 shadow rounded">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center mb-2"
          >
            <span>
              {s.subject_code} - {s.subject_name} ({s.units})
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(s)}
                className="bg-yellow-400 px-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(s.id)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
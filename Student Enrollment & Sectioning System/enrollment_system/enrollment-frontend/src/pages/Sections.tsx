import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Sections() {
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [subjectId, setSubjectId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchSections = async () => {
    const res = await api.get("sections/");
    setSections(res.data);
  };

  const fetchSubjects = async () => {
    const res = await api.get("subjects/");
    setSubjects(res.data);
  };

  const handleSubmit = async () => {
    if (!subjectId || !sectionName || !maxCapacity) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (editingId) {
        await api.put(`sections/${editingId}/`, {
          subject: subjectId,
          section_name: sectionName,
          max_capacity: Number(maxCapacity),
        });
      } else {
        await api.post("sections/", {
          subject: subjectId,
          section_name: sectionName,
          max_capacity: Number(maxCapacity),
        });
      }

      setSubjectId("");
      setSectionName("");
      setMaxCapacity("");
      setEditingId(null);

      fetchSections();
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data || "Error"));
    }
  };

  const handleEdit = (sec: any) => {
    setSubjectId(sec.subject);
    setSectionName(sec.section_name);
    setMaxCapacity(String(sec.max_capacity));
    setEditingId(sec.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this section?")) return;
    await api.delete(`sections/${id}/`);
    fetchSections();
  };

  useEffect(() => {
    fetchSections();
    fetchSubjects();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sections</h1>

      <div className="flex gap-2 mb-4">
        <select
          className="border p-2"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">Select Subject</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.subject_code} - {sub.subject_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Section Name"
          className="border p-2"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Capacity"
          className="border p-2"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <div className="bg-white p-4 shadow rounded">
        {sections.map((sec) => (
          <div
            key={sec.id}
            className="flex justify-between items-center mb-2"
          >
            <span>
              {/* ✅ FIXED HERE */}
              {sec.subject_code} - {sec.subject_name} — {sec.section_name} ({sec.current_count}/{sec.max_capacity})
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(sec)}
                className="bg-yellow-400 px-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(sec.id)}
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
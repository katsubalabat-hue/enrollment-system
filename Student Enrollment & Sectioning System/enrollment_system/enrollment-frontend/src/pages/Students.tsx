import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [maxUnits, setMaxUnits] = useState(""); // NEW: max units
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const res = await api.get("students/");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to load students");
    }
  };

  // Handle create/update student
  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !maxUnits.trim()) {
      alert("Please fill in all fields including Max Units");
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        await api.put(`students/${editingId}/`, {
          first_name: firstName,
          last_name: lastName,
          email,
          max_units: Number(maxUnits),
        });
      } else {
        // CREATE
        await api.post("students/", {
          first_name: firstName,
          last_name: lastName,
          email,
          max_units: Number(maxUnits),
        });
      }

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setMaxUnits("");
      setEditingId(null);

      fetchStudents();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Something went wrong");
      }
    }
  };

  // Prepare form for editing
  const handleEdit = (student: any) => {
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setEmail(student.email);
    setMaxUnits(String(student.max_units)); // populate max units
    setEditingId(student.id);
  };

  // Delete student
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await api.delete(`students/${id}/`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      {/* Form to add/update student */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="First Name"
          className="border p-2"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          placeholder="Last Name"
          className="border p-2"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Units"
          className="border p-2"
          value={maxUnits}
          onChange={(e) => setMaxUnits(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 rounded"
        >
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {/* List of students */}
      <ul className="bg-white p-4 shadow rounded">
        {students.map((s) => (
          <li
            key={s.id}
            className="flex justify-between items-center mb-2"
          >
            <span>
              {s.first_name} {s.last_name} — {s.email} — Total Units: {s.total_units} / Max Units: {s.max_units}
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
          </li>
        ))}
      </ul>
    </div>
  );
}
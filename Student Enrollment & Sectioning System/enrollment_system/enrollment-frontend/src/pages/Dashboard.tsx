import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await api.get("enrollments/");
      // Only show active enrollments
      const activeEnrollments = res.data.filter(
        (e: any) => e.status !== "DROPPED"
      );
      setData(activeEnrollments);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDrop = async (enrollmentId: number) => {
    const confirmDrop = window.confirm(
      "Are you sure you want to drop this student from the enrollment?"
    );
    if (!confirmDrop) return;

    try {
      // Soft drop: update status to DROPPED
      await api.patch(`enrollments/${enrollmentId}/`, { status: "DROPPED" });

      // Refresh dashboard
      fetchData();
    } catch (err) {
      console.error("Error dropping enrollment:", err);
      alert("Failed to drop enrollment");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Enrollment Summary</h1>

      <div className="bg-white shadow p-4 rounded">
        {data.length === 0 && <p>No active enrollments yet.</p>}

        {data.map((e) => (
          <div
            key={e.id}
            className="border-b py-2 flex justify-between items-center"
          >
            <div>
              <strong>Student:</strong> {e.student_name} |{" "}
              <strong>Subject:</strong> {e.subject_name} |{" "}
              <strong>Section:</strong> {e.section_name || "N/A"} |{" "}
              <strong>Status:</strong>{" "}
              <span
                className={
                  e.status === "ENROLLED"
                    ? "text-green-600"
                    : e.status === "WAITLISTED"
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {e.status}
              </span>
            </div>

            <button
              onClick={() => handleDrop(e.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Drop
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
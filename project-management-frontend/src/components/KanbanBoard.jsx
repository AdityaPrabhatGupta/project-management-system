import { useEffect, useState } from "react";
import API from "../api/axios";
import TaskCard from "./TaskCard";

const kbCss = `
  .kb-board { display:flex; gap:20px; align-items:flex-start; }
  .kb-col-wrap { flex:1; background:#f4f4f4; padding:10px; border-radius:8px; min-height:80px; }
  .kb-col-wrap h3 { font-size:14px; font-weight:700; margin-bottom:10px; color:#374151; }
  .kb-empty-col { font-size:12px; color:#9ca3af; text-align:center; padding:20px 0; }
  @media (max-width:640px) {
    .kb-board { flex-direction:column; }
    .kb-col-wrap { width:100%; }
  }
`;

// Normalize all possible status values from the backend
const normalizeStatus = (status) => {
  if (!status) return "todo";
  const s = status.toLowerCase().trim();
  if (s === "in-progress" || s === "inprogress" || s === "in_progress" || s === "progress") return "in-progress";
  if (s === "done" || s === "completed" || s === "complete" || s === "finished") return "done";
  return "todo";
};

// Extract tasks array from any API response shape
const extractTasks = (data) => {
  if (Array.isArray(data))            return data;
  if (Array.isArray(data?.tasks))     return data.tasks;
  if (Array.isArray(data?.data))      return data.data;
  if (Array.isArray(data?.items))     return data.items;
  return [];
};

function KanbanBoard({ projectId }) {

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchTasks = async () => {
      try {
        const res = await API.get(`/tasks/project/${projectId}`);
        const list = extractTasks(res.data);
        // Normalize status on each task so filtering always works
        setTasks(list.map(t => ({ ...t, status: normalizeStatus(t.status) })));
      } catch (error) {
        console.log("KanbanBoard fetch error:", error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [projectId]);

  const todoTasks     = tasks.filter((task) => task.status === "todo");
  const progressTasks = tasks.filter((task) => task.status === "in-progress");
  const doneTasks     = tasks.filter((task) => task.status === "done");

  return (
    <>
      <style>{kbCss}</style>
      <div className="kb-board">

        {/* TODO COLUMN */}
        <div className="kb-col-wrap">
          <h3>📋 Todo ({todoTasks.length})</h3>
          {todoTasks.length === 0
            ? <div className="kb-empty-col">No tasks</div>
            : todoTasks.map((task) => <TaskCard key={task._id} task={task} />)
          }
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="kb-col-wrap">
          <h3>🔵 In Progress ({progressTasks.length})</h3>
          {progressTasks.length === 0
            ? <div className="kb-empty-col">No tasks</div>
            : progressTasks.map((task) => <TaskCard key={task._id} task={task} />)
          }
        </div>

        {/* DONE COLUMN */}
        <div className="kb-col-wrap">
          <h3>✅ Done ({doneTasks.length})</h3>
          {doneTasks.length === 0
            ? <div className="kb-empty-col">No tasks</div>
            : doneTasks.map((task) => <TaskCard key={task._id} task={task} />)
          }
        </div>

      </div>
    </>
  );
}

export default KanbanBoard;
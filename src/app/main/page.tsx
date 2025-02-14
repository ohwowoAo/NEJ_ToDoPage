"use client";
import { useState, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { nanoid } from "nanoid";
import { Ellipsis } from "lucide-react";

type BoardType = "대기" | "진행" | "보류" | "완료";

interface TaskType {
  id: string;
  content: string;
  board: BoardType;
}

const BOARDS: BoardType[] = ["대기", "진행", "보류", "완료"];

export default function Kanban() {
  const [tasks, setTasks] = useState<TaskType[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? (JSON.parse(savedTasks) as TaskType[]) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (content: string, board: BoardType) => {
    if (!content.trim()) return;
    const newTask = { id: nanoid(), content, board };
    setTasks((prev) => [...prev, newTask]);
  };

  const moveTask = (
    taskId: string,
    toBoard: BoardType,
    targetIndex?: number
  ) => {
    setTasks((prev) => {
      const updatedTasks = [...prev];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return prev;

      const task = { ...updatedTasks[taskIndex], board: toBoard };
      updatedTasks.splice(taskIndex, 1);
      if (targetIndex !== undefined) {
        updatedTasks.splice(targetIndex, 0, task);
      } else {
        updatedTasks.push(task);
      }

      return updatedTasks;
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="p-4 flex flex-col min-h-screen">
      <h1 className="font-bold text-black text-lg">TODO BOARD</h1>
      <div className="flex gap-4 w-full mt-4">
        {BOARDS.map((board) => (
          <Board
            key={board}
            title={board}
            tasks={tasks.filter((t) => t.board === board)}
            moveTask={moveTask}
            deleteTask={deleteTask}
            setTasks={setTasks}
            addTask={addTask}
          />
        ))}
      </div>
    </div>
  );
}

const Board = ({
  title,
  tasks,
  moveTask,
  deleteTask,
  setTasks,
  addTask,
}: {
  title: BoardType;
  tasks: TaskType[];
  moveTask: (taskId: string, toBoard: BoardType, targetIndex?: number) => void;
  deleteTask: (taskId: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  addTask: (content: string, board: BoardType) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => moveTask(item.id, title),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [, drag] = useDrag({
    type: "TASK",
    item: { id: title },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const combinedRef = useRef<HTMLDivElement>(null);

  drag(drop(combinedRef));

  // 엔터 키로 할 일 추가
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask(newTaskContent, title);
      setNewTaskContent("");
      setIsModalOpen(false);
    }
  };

  // 배경 클릭 시 팝업 닫기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    setIsModalOpen(false);
  };

  return (
    <div
      ref={combinedRef}
      className={`w-1/4 bg-gray-200 p-4 rounded shadow min-h-[300px] ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <h2 className="mb-2 text-slate-600">{title}</h2>
        <button
          onClick={() => setIsModalOpen(true)} // + 눌러 팝업창 띄우기
          className="bg-blue-600 text-white p-2 rounded-full w-6 h-6 flex justify-center items-center"
        >
          +
        </button>
      </div>
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          task={task}
          moveTask={moveTask}
          deleteTask={deleteTask}
          setTasks={setTasks}
          index={index}
        />
      ))}
      {/* Task 추가 팝업 */}
      {isModalOpen && (
        <div
          onClick={handleBackgroundClick} // 배경 클릭 시 팝업 닫기
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
        >
          <div
            className="bg-white p-4 rounded shadow-lg w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={handleKeyDown} // 엔터 키 처리
              className="border p-2 w-full rounded text-slate-600"
              placeholder="할 일 입력"
            />
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => {
                  addTask(newTaskContent, title); // 해당 보드에 할 일 추가
                  setNewTaskContent("");
                  setIsModalOpen(false);
                }}
                className="bg-blue-500 text-white p-2 rounded"
              >
                추가
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 p-2 rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Task = ({
  task,
  moveTask,
  index,
  deleteTask,
  setTasks,
}: {
  task: TaskType;
  moveTask: (taskId: string, toBoard: BoardType, targetIndex?: number) => void;
  index: number;
  deleteTask: (taskId: string) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState(task.content); // 수정할 내용
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "TASK",
    hover: (draggedItem: { id: string }) => {
      if (draggedItem.id !== task.id) {
        moveTask(draggedItem.id, task.board, index);
      }
    },
  });

  drag(drop(ref));

  // 배경 클릭 시 팝업 닫기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    setIsModalOpen(false);
  };

  return (
    <div>
      <div
        ref={ref}
        className={`p-2 border rounded bg-white mt-2 text-slate-700 flex justify-between items-center ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <p>{task.content}</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-slate-300 rounded-md w-7 h-5 flex justify-center items-center"
        >
          <Ellipsis className="w-4" />
        </button>
      </div>

      {/* 팝업창 */}
      {isModalOpen && (
        <div
          onClick={handleBackgroundClick}
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
        >
          <div
            className="bg-white p-4 rounded shadow-lg w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="border p-2 w-full rounded text-slate-600"
            />
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => {
                  const updatedTask = { ...task, content: newContent };
                  setTasks((prev) =>
                    prev.map((t) => (t.id === task.id ? updatedTask : t))
                  );
                  setIsModalOpen(false);
                }}
                className="bg-blue-500 text-white p-2 rounded"
              >
                수정
              </button>
              <button
                onClick={() => {
                  deleteTask(task.id);
                  setIsModalOpen(false);
                }}
                className="bg-red-500 text-white p-2 rounded"
              >
                삭제
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 p-2 rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";
import { TaskModal } from "./components/TaskModal";

type Status = "대기" | "진행" | "보류" | "완료";

type Post = {
  id: string;
  title: string;
  status: Status;
};

const initialPosts: Post[] = [
  { id: "1", title: "할 일 1", status: "대기" },
  { id: "2", title: "할 일 2", status: "진행" },
  { id: "3", title: "할 일 3", status: "보류" },
  { id: "4", title: "할 일 4", status: "완료" },
];

const statuses: Status[] = ["대기", "진행", "보류", "완료"];

export const MainPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status>("대기");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem("posts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(initialPosts);
    }
  }, []);

  const savePostsToLocalStorage = (updatedPosts: Post[]) => {
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination } = result;
    if (!destination) return;

    const updatedPosts = [...posts];
    const movedPostIndex = updatedPosts.findIndex(
      (p) => p.id === result.draggableId
    );
    if (movedPostIndex === -1) return;

    const [movedPost] = updatedPosts.splice(movedPostIndex, 1);
    movedPost.status = destination.droppableId as Status;

    const targetBoardItems = updatedPosts.filter(
      (p) => p.status === movedPost.status
    );
    targetBoardItems.splice(destination.index, 0, movedPost);

    const reorderedPosts = [
      ...updatedPosts.filter((p) => p.status !== movedPost.status),
      ...targetBoardItems,
    ];

    savePostsToLocalStorage(reorderedPosts);
  };

  const addTask = () => {
    if (!taskInput.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      title: taskInput,
      status: selectedStatus,
    };

    const updatedPosts = [...posts, newPost];
    savePostsToLocalStorage(updatedPosts);
    setTaskInput("");
    setIsModalOpen(false);
  };

  const updateTask = () => {
    if (!taskInput.trim() || !editingId) return;

    const updatedPosts = posts.map((post) =>
      post.id === editingId ? { ...post, title: taskInput } : post
    );

    savePostsToLocalStorage(updatedPosts);
    setTaskInput("");
    setEditingId(null);
    setIsModalOpen(false);
  };

  const deleteTask = (id: string) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    savePostsToLocalStorage(updatedPosts);
  };

  return (
    <div className="p-4 h-screen flex flex-col">
      <h1 className="text-black font-bold mb-4 text-lg">TODO BOARD</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 text-slate-600 h-[calc(100vh-64px)]">
          {statuses.map((status) => (
            <div
              key={status}
              className="flex flex-col w-full bg-gray-100 p-4 rounded-lg shadow-md h-full"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">{status}</h2>
                <button
                  className="text-xl font-bold text-blue-500"
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsModalOpen(true);
                    setEditingId(null);
                    setTaskInput("");
                  }}
                >
                  +
                </button>
              </div>

              <Droppable droppableId={String(status)}>
                {(provided, snapshot) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 p-2 transition-all flex-grow overflow-auto  
                  ${snapshot.isDraggingOver ? "bg-gray-50" : ""}`}
                  >
                    {posts
                      .filter((post) => post.status === status)
                      .map((post, index) => (
                        <Draggable
                          key={post.id}
                          draggableId={post.id}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-2 rounded-md shadow cursor-grab flex justify-between items-center"
                            >
                              <span
                                className="flex-1 cursor-pointer "
                                onClick={() => {
                                  setEditingId(post.id);
                                  setTaskInput(post.title);
                                  setIsModalOpen(true);
                                }}
                              >
                                {post.title}
                              </span>
                              <button onClick={() => deleteTask(post.id)}>
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* 모달 */}
      <TaskModal
        isOpen={isModalOpen}
        taskInput={taskInput}
        setTaskInput={setTaskInput}
        onClose={() => setIsModalOpen(false)}
        onSave={editingId ? updateTask : addTask}
        isEditing={!!editingId}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

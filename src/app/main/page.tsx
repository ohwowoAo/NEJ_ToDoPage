"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

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
      status: selectedStatus, // 선택한 보드에 추가
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
      {/* ✅ 전체 타이틀 */}
      <h1 className="text-black font-bold mb-4 text-lg">TODO BOARD</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* ✅ 헤더 높이 제외한 나머지를 차지하도록 설정 */}
        <div className="flex gap-4" style={{ height: "calc(100vh - 64px)" }}>
          {statuses.map((status) => (
            <div
              key={status}
              className="flex flex-col w-full bg-gray-100 p-4 rounded-lg shadow-md h-full"
            >
              {/* ✅ 타이틀 + 추가 버튼 */}
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

              {/* ✅ Droppable 적용 (높이 조정, 내용이 많아지면 스크롤) */}
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
                                className="flex-1 cursor-pointer"
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

      {/* ✅ 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80">
            <h2 className="text-lg font-bold mb-2">
              {editingId ? "할 일 수정" : `${selectedStatus}에 할 일 추가`}
            </h2>
            <input
              type="text"
              placeholder="할 일을 입력하세요"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setTaskInput("");
                }}
              >
                취소
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={editingId ? updateTask : addTask}
              >
                {editingId ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

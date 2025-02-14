"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// ✅ 상태 타입 정의
type Status = "대기" | "진행" | "보류" | "완료";

type Post = {
  id: string;
  title: string;
  status: Status;
};

// ✅ 더미 데이터 (초기 상태)
const initialPosts: Post[] = [
  { id: "1", title: "할 일 1", status: "대기" },
  { id: "2", title: "할 일 2", status: "진행" },
  { id: "3", title: "할 일 3", status: "보류" },
  { id: "4", title: "할 일 4", status: "완료" },
];

// ✅ 상태 리스트
const statuses: Status[] = ["대기", "진행", "보류", "완료"];

export const MainPage = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // ✅ 드래그 종료 시 실행될 함수
  const onDragEnd = (result: DropResult) => {
    const { destination } = result;
    if (!destination) return;

    setPosts((prevPosts) => {
      const updatedPosts = [...prevPosts];

      // 드래그한 아이템 찾기
      const movedPostIndex = updatedPosts.findIndex(
        (p) => p.id === result.draggableId
      );
      if (movedPostIndex === -1) return prevPosts;

      const [movedPost] = updatedPosts.splice(movedPostIndex, 1); // 기존 위치에서 제거
      movedPost.status = destination.droppableId as Status; // 새로운 상태 업데이트

      // 새로운 위치 삽입을 위해 해당 보드의 모든 아이템 필터링
      const targetBoardItems = updatedPosts.filter(
        (p) => p.status === movedPost.status
      );
      targetBoardItems.splice(destination.index, 0, movedPost); // 새 위치에 삽입

      // 최종적으로 상태별 정렬을 다시 수행
      const reorderedPosts = [
        ...updatedPosts.filter((p) => p.status !== movedPost.status), // 다른 보드의 아이템 유지
        ...targetBoardItems, // 새로운 상태로 변경된 아이템들 삽입
      ];

      return reorderedPosts;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 p-4">
        {statuses.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-64 bg-gray-100 p-4 rounded-lg shadow-md min-h-[200px]"
              >
                <h2 className="text-lg font-bold mb-2">{status}</h2>
                {posts
                  .filter((post) => post.status === status)
                  .map((post, index) => (
                    <Draggable
                      key={post.id}
                      draggableId={post.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 rounded-md shadow mb-2 cursor-grab"
                        >
                          {post.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

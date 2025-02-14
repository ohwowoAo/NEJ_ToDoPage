interface TaskModalProps {
  isOpen: boolean;
  taskInput: string;
  setTaskInput: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
  selectedStatus: string;
}

export const TaskModal = ({
  isOpen,
  taskInput,
  setTaskInput,
  onClose,
  onSave,
  isEditing,
  selectedStatus,
}: TaskModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-bold mb-2">
          {isEditing ? "할 일 수정" : `${selectedStatus}에 할 일 추가`}
        </h2>
        <input
          type="text"
          placeholder="할 일을 입력하세요"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={onClose}>
            취소
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={onSave}
          >
            {isEditing ? "수정" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
};

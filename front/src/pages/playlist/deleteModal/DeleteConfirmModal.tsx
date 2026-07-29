interface DeleteConfirmModalProps {
    playlistName: string;
    onConfirm: () => void;
    onCancel: () => void;
}
export default function DeleteConfirmModal({ playlistName, onConfirm, onCancel }: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4" onClick={onCancel}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex flex-col gap-6 rounded-2xl bg-[#181818] p-6 text-white max-w-[400px] border border-[#EE10B0]/20"
            >
                <div>
                    <h2 className="text-2xl font-bold">Delete Playlist?</h2>
                    <p className="text-gray-400 mt-2">
                        Are you sure you want to delete <span className="font-semibold text-[#EE10B0]">"{playlistName}"</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3a3a] font-semibold transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-semibold transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
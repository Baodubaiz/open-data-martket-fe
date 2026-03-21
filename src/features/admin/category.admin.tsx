"use client";

import { useState } from "react";
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/hooks/category/useCategory"; // giữ theo chỗ ngài lưu hook
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react"; // Import Save và X (Cancel)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Cookies from "js-cookie";
import { Skeleton } from "@/components/ui/skeleton"; // Thêm Skeleton cho hiệu ứng tải

// Tùy chỉnh màu sắc và hiệu ứng cho UI hiện đại
const PRIMARY_COLOR = "bg-sky-500 hover:bg-sky-600 transition-colors duration-200";
const DELETE_COLOR = "text-red-400 hover:text-red-500 transition-colors duration-200";
const EDIT_COLOR = "text-blue-400 hover:text-blue-500 transition-colors duration-200";
const SAVE_COLOR = "bg-green-500 hover:bg-green-600 transition-colors duration-200";
const CANCEL_COLOR = "hover:bg-gray-700 transition-colors duration-200 text-gray-400";

export default function CategoryManager() {
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken") || "";

    // fetch danh mục
    const { data: categories, isLoading } = useCategories();

    // mutations (token truyền như hook của ngài)
    const createMutation = useCreateCategory(token);
    const updateMutation = useUpdateCategory(token);
    const deleteMutation = useDeleteCategory(token);

    // local state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingDescription, setEditingDescription] = useState("");

    // Thêm category
    const handleAdd = async () => {
        if (!name.trim()) return toast.warning("Tên danh mục không được để trống!");
        try {
            await createMutation.mutateAsync({ name, description });
            setName("");
            setDescription("");
            toast.success("Thêm danh mục thành công! ✅");
        } catch (err) {
            toast.error("Lỗi khi thêm danh mục! Vui lòng thử lại.");
        }
    };

    // Cập nhật category
    const handleUpdate = async (category_id: string) => {
        if (!editingName.trim()) return toast.warning("Tên không được để trống!");
        try {
            await updateMutation.mutateAsync({
                id: category_id,
                data: { name: editingName, description: editingDescription },
            });
            setEditingId(null);
            toast.success("Cập nhật danh mục thành công! 💾");
        } catch {
            toast.error("Lỗi khi cập nhật! Vui lòng thử lại.");
        }
    };

    // Xóa category
    const handleDelete = async (category_id: string) => {
        if (!confirm("Ngài có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.")) return;
        try {
            await deleteMutation.mutateAsync(category_id);
            toast.success("Xóa danh mục thành công! 🗑️");
        } catch {
            toast.error("Không thể xóa danh mục này! Vui lòng kiểm tra ràng buộc.");
        }
    };

    // Hàm bắt đầu chỉnh sửa
    const startEditing = (cat: any) => {
        setEditingId(cat.category_id);
        setEditingName(cat.name);
        setEditingDescription(cat.description || "");
    };

    // Hàm hủy bỏ chỉnh sửa
    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
        setEditingDescription("");
    };

    // Skeleton Loader Component
    const CategorySkeleton = () => (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/70 p-4 rounded-xl">
                    <div className="w-4/5 space-y-2">
                        <Skeleton className="h-4 w-3/5 bg-gray-700" />
                        <Skeleton className="h-3 w-4/5 bg-gray-700" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                        <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 p-6 min-h-screen text-white">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                    QUẢN LÝ DANH MỤC DỮ LIỆU
                </h1>
            </div>

            {/* Add New Category Card */}
            <Card className="bg-gray-800 border-gray-700 shadow-2xl transition-all duration-300 hover:shadow-sky-900/50">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-sky-400 flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> Thêm Danh Mục Mới
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Tên danh mục (ví dụ: Công Nghệ, Tài Chính)..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                            disabled={createMutation.isPending}
                        />
                        <Input
                            placeholder="Mô tả ngắn (tùy chọn)..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-gray-700 text-white border-gray-600 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                            disabled={createMutation.isPending}
                        />
                        <Button
                            onClick={handleAdd}
                            className={`${PRIMARY_COLOR} font-bold flex items-center`}
                            disabled={createMutation.isPending || !name.trim()}
                        >
                            {createMutation.isPending ? 'Đang thêm...' : (
                                <>
                                    <Plus className="w-4 h-4 mr-1" /> Thêm Danh Mục
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>


            {/* List of Categories */}
            <h2 className="text-2xl font-semibold text-gray-200 pt-4">Danh Sách Hiện Có</h2>
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                    {isLoading ? (
                        <CategorySkeleton />
                    ) : categories?.length ? (
                        <div className="space-y-3">
                            {categories.map((cat: any, idx: number) => (
                                <div
                                    key={cat.category_id || idx}
                                    className={`
                                        flex flex-col md:flex-row items-start md:items-center justify-between
                                        bg-gray-700/50 p-4 rounded-xl shadow-md
                                        transition-all duration-300 transform
                                        ${editingId === cat.category_id ? "bg-gray-700 ring-2 ring-sky-500" : "hover:bg-gray-700 hover:scale-[1.01]"}
                                    `}
                                >
                                    {editingId === cat.category_id ? (
                                        // Edit Mode
                                        <div className="flex-1 w-full space-y-3">
                                            <Input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="bg-gray-800 text-white border-gray-600 focus:ring-green-500"
                                                placeholder="Tên danh mục"
                                            />
                                            <Textarea
                                                value={editingDescription}
                                                onChange={(e) => setEditingDescription(e.target.value)}
                                                className="bg-gray-800 text-white border-gray-600 focus:ring-green-500"
                                                rows={2}
                                                placeholder="Mô tả chi tiết (tùy chọn)"
                                            />
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdate(cat.category_id)}
                                                    className={SAVE_COLOR}
                                                    disabled={updateMutation.isPending}
                                                >
                                                    <Save className="w-4 h-4 mr-1" /> {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                    className={CANCEL_COLOR}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Hủy
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex-1 w-full overflow-hidden">
                                                <span className="block text-lg font-bold text-sky-300 truncate">
                                                    {cat.name}
                                                </span>
                                                {cat.description && (
                                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                                        {cat.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-1.5 mt-3 md:mt-0 md:ml-4 flex-shrink-0">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => startEditing(cat)}
                                                    className="rounded-full w-9 h-9"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Edit className={`w-4 h-4 ${EDIT_COLOR}`} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(cat.category_id)}
                                                    className="rounded-full w-9 h-9"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className={`w-4 h-4 ${DELETE_COLOR}`} />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-4 text-center">
                            Hiện chưa có danh mục nào được tạo. Hãy thêm danh mục đầu tiên!
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
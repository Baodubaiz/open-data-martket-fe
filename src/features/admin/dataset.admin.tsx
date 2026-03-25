"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
    useDatasets,
    useDatasetBySellerName,
    useDatasetById,
    useUpdateDataset,
    useDeleteDataset,
} from "@/hooks/dataset/useDataset";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Search, XCircle, Eye, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function AdminDatasetPage() {
    const [sellerName, setSellerName] = useState("");
    const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        "";

    // 🔹 Lấy danh sách dataset (lọc theo seller nếu có)
    const { data: rawData = [], isLoading } = sellerName
        ? useDatasetBySellerName(sellerName)
        : useDatasets(token);

    const datasets = Array.isArray(rawData) ? rawData : [];

    const updateDataset = useUpdateDataset(token);
    const deleteDataset = useDeleteDataset(token);

    // 🔹 Lấy dataset chi tiết khi click “Xem”
    const { data: selectedDataset } = useDatasetById(selectedDatasetId || "");

    const handleToggleActive = async (dataset: any) => {
        try {
            const formData = new FormData();
            formData.append("is_active", String(!dataset.is_active));

            await updateDataset.mutateAsync({
                id: dataset.dataset_id,
                formData: formData,
            });
            toast.success("Cập nhật trạng thái thành công!");
        } catch {
            toast.error("Cập nhật thất bại!");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Ngài có chắc muốn xóa dataset này chứ?")) return;
        try {
            await deleteDataset.mutateAsync(id);
            toast.success("Đã xóa dataset!");
        } catch {
            toast.error("Xóa thất bại!");
        }
    };

    const handleView = (id: string) => {
        setSelectedDatasetId(id);
        setShowDetail(true);
    };

    if (isLoading)
        return (
            <p className="text-gray-400 text-center mt-10">
                Đang tải dữ liệu...
            </p>
        );

    return (
        <div className="space-y-6">
            <Card className="bg-gray-900 border border-gray-700">
                <CardHeader>
                    <CardTitle className="text-sky-400 text-2xl font-semibold">
                        📂 Quản lý Dataset
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* --- Bộ lọc tìm kiếm --- */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Tìm kiếm theo tên người bán..."
                                value={sellerName}
                                onChange={(e) => setSellerName(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white pl-10 placeholder:text-gray-400"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
                        </div>

                        {sellerName && (
                            <Button
                                variant="outline"
                                onClick={() => setSellerName("")}
                                className="flex items-center gap-2 border-red-500 text-red-400 hover:bg-red-900/30"
                            >
                                <XCircle className="w-4 h-4" /> Xóa lọc
                            </Button>
                        )}
                    </div>

                    {/* --- Bảng dataset --- */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-800/50">
                                <TableRow className="border-gray-700">
                                    <TableHead className="text-gray-400">#</TableHead>
                                    <TableHead className="text-sky-400">Tiêu đề Dataset</TableHead>
                                    <TableHead className="text-gray-400">Người bán</TableHead>
                                    <TableHead className="text-right text-gray-400">Giá (VNĐ)</TableHead>
                                    <TableHead className="text-center text-gray-400">Trạng thái</TableHead>
                                    <TableHead className="text-center text-gray-400">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {datasets.map((d: any, i: number) => (
                                    <TableRow
                                        key={d.dataset_id}
                                        className="border-gray-800 hover:bg-gray-800/60 transition-colors"
                                    >
                                        <TableCell className="text-gray-400">{i + 1}</TableCell>
                                        <TableCell className="text-white font-medium truncate max-w-[220px]">
                                            {d.title}
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {d.seller?.full_name || "N/A"}
                                            {d.seller?.email && (
                                                <div className="text-xs text-gray-500">{d.seller.email}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-green-400 font-mono">
                                            {d.price_vnd?.toLocaleString() || "0"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Switch
                                                    checked={d.is_active}
                                                    onCheckedChange={() => handleToggleActive(d)}
                                                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                                                    disabled={updateDataset.isPending}
                                                />
                                                <span
                                                    className={`text-xs ${d.is_active
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                        }`}
                                                >
                                                    {d.is_active ? "Active" : "Hidden"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleView(d.dataset_id)}
                                                    className="w-8 h-8 border-sky-400/50 text-sky-400 hover:bg-sky-900/30"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => handleDelete(d.dataset_id)}
                                                    className="w-8 h-8"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {datasets.length === 0 && (
                        <p className="text-center text-gray-500 mt-4">
                            Không có dataset nào để hiển thị.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* --- Floating form chi tiết dataset --- */}
            <Dialog open={showDetail} onOpenChange={setShowDetail}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-sky-400 text-xl font-semibold">
                            🧾 Chi tiết Dataset
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Thông tin chi tiết của dataset được chọn.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDataset ? (
                        <div className="space-y-3 mt-3">
                            <p><span className="text-gray-400">Tiêu đề: </span>{selectedDataset.title}</p>
                            <p><span className="text-gray-400">Mô tả: </span>{selectedDataset.description || "Không có"}</p>
                            <p><span className="text-gray-400">Giá (VNĐ): </span>{selectedDataset.price_vnd?.toLocaleString()}</p>
                            <p><span className="text-gray-400">Người bán: </span>{selectedDataset.seller?.full_name || "N/A"}</p>
                            {selectedDataset.seller?.email && (
                                <p><span className="text-gray-400">Email: </span>{selectedDataset.seller.email}</p>
                            )}
                            <p><span className="text-gray-400">Danh mục: </span>{selectedDataset.category?.name || "Không có"}</p>
                            <p>
                                <span className="text-gray-400">Trạng thái: </span>
                                <span className={selectedDataset.is_active ? "text-green-400" : "text-red-400"}>
                                    {selectedDataset.is_active ? "Active" : "Hidden"}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm mt-4">Đang tải chi tiết...</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

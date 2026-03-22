"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// Giả định bạn đã import interface/type cho Dataset ở đâu đó
// import { Dataset } from "@/types"; 
import { useDatasetById } from "@/hooks/dataset/useDataset";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function DatasetCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // Lấy dữ liệu dataset
    const { data: dataset, isLoading, isError } = useDatasetById(id);

    // 🧠 Kiểm tra đăng nhập (Login Check)
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập trước khi thanh toán.");
            router.push("/login");
        }
    }, [router]);

    // Hiển thị trạng thái tải và lỗi
    if (isLoading) return <p className="text-center mt-10 text-white">Đang tải dữ liệu...</p>;
    if (isError || !dataset)
        return <p className="text-center mt-10 text-red-400">Không tìm thấy dataset.</p>;

    // Khẳng định dataset tồn tại sau khi kiểm tra
    const currentDataset = dataset;

    // Xử lý URL ảnh
    const imageUrl = currentDataset.thumbnail_url
        ? `${currentDataset.thumbnail_url}`
        : "/placeholder.png";

    return (
        < div className="max-w-4xl mx-auto py-20 min-h-screen flex items-center justify-center" >
            < Card className="shadow-2xl rounded-2xl overflow-hidden bg-gray-800/90 border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:shadow-cyan-500/30 group w-full" >
                <CardHeader className="border-b border-gray-700/50 p-6">
                    <CardTitle className="text-3xl font-bold text-white tracking-wider">
                        {currentDataset.title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 p-8">
                    {/* 🔄 Bố cục chính: Ảnh (trái) và Chi tiết (phải) */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cột Ảnh */}
                        <div className="w-full md:w-2/5 flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={currentDataset.title}
                                className="rounded-xl object-cover w-full h-56 transition-transform duration-300 group-hover:scale-[1.02] shadow-lg"
                            />
                        </div>

                        {/* Cột Chi tiết Dataset */}
                        <div className="flex-1 space-y-4 text-gray-300">
                            <p className="whitespace-pre-line text-sm leading-relaxed border-b border-gray-700 pb-4">
                                {currentDataset.description}
                            </p>
                            <div className="space-y-2 pt-2 text-sm">
                                <p>
                                    <strong className="text-white">Danh mục:</strong> {currentDataset.category?.name}
                                </p>
                                <p>
                                    <strong className="text-white">Người bán:</strong> {currentDataset.seller?.full_name}
                                </p>
                                <p>
                                    <strong className="text-white">Giá VNĐ:</strong>{" "}
                                    <span className="text-green-400 font-medium">
                                        {currentDataset.price_vnd?.toLocaleString("vi-VN")} đ
                                    </span>
                                </p>
                                <p>
                                    <strong className="text-white">Giá ETH:</strong>{" "}
                                    <span className="text-blue-400 font-medium">{currentDataset.price_eth} ETH</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 💰 Khu vực Tổng thanh toán và Nút Xác nhận */}
                    <div className="pt-6 border-t border-gray-700/50 mt-6 flex justify-between items-center">
                        {/* Tổng thanh toán */}
                        <p className="text-xl font-bold text-cyan-400">
                            Tổng thanh toán:{" "}
                            {currentDataset.price_vnd
                                ? `${currentDataset.price_vnd.toLocaleString("vi-VN")} VNĐ`
                                : `${currentDataset.price_eth} ETH`}
                        </p>

                        {/* Nút Xác nhận Thanh toán với hover animation */}
                        <Button
                            onClick={() =>
                                router.push(`/dataset/payment-confirmation?dataset_id=${currentDataset.dataset_id}`)
                            }
                            className="px-8 py-3 text-white bg-blue-600 hover:bg-blue-500 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
                        >
                            Xác nhận thanh toán ✨
                        </Button>
                    </div>
                </CardContent>
            </Card >
        </div >
    );
}
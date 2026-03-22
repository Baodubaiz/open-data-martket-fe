"use client";

import { Brain } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen text-gray-200 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Brain className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 gradient-text">Về OpenDataMarket</h1>
                    <p className="text-gray-400 text-lg">
                        Nền tảng giao dịch datasets phi tập trung hàng đầu Việt Nam, kết nối các nhà phát triển và cộng đồng AI.
                    </p>
                </div>

                {/* Mission */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Sứ mệnh của chúng tôi</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Chúng tôi muốn xây dựng một hệ sinh thái nơi các nhà phát triển, nhà nghiên cứu và doanh nghiệp có thể
                        chia sẻ và giao dịch dữ liệu một cách minh bạch và an toàn. Mục tiêu của chúng tôi là giúp dữ liệu trở nên
                        dễ tiếp cận, thúc đẩy sáng tạo và phát triển AI tại Việt Nam.
                    </p>
                </section>

                {/* Team */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Đội ngũ của chúng tôi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {["Lâm Quốc Bảo", "Đào Quốc Bảo", "Nguyễn Quốc Huy"].map((member, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900 p-6 rounded-xl flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                            >
                                <div className="w-20 h-20 bg-purple-500 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold">
                                    {member.split(" ").map(n => n[0]).join("")}
                                </div>
                                <h3 className="font-semibold mb-1">{member}</h3>
                                <p className="text-gray-400 text-sm">Developer / Data Engineer</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Blog / Updates */}
                <section className="mt-16">
                    <h2 className="text-2xl font-semibold mb-6 gradient-text">Blog & Cập nhật</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Ra mắt nền tảng OpenDataMarket",
                                date: "01/11/2025",
                                description:
                                    "OpenDataMarket chính thức ra mắt nhằm kết nối các nhà phát triển, doanh nghiệp và người dùng trong cộng đồng. Nền tảng cung cấp các dataset chất lượng, minh bạch và an toàn, hỗ trợ nghiên cứu, phát triển sản phẩm và các dự án AI. Chúng tôi cam kết mang đến trải nghiệm giao dịch dữ liệu hiệu quả và bền vững."
                            },
                            {
                                title: "Hướng dẫn tạo tài khoản và giao dịch datasets",
                                date: "05/11/2025",
                                description:
                                    "Hướng dẫn chi tiết cách tạo tài khoản, xác thực và bắt đầu giao dịch datasets trên OpenDataMarket một cách an toàn và nhanh chóng. Bao gồm các bước đăng nhập, nạp tiền, mua bán và quản lý lịch sử giao dịch."
                            }
                        ].map((post, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900 p-6 rounded-2xl hover:shadow-xl transition-shadow flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="font-semibold mb-1 text-lg text-white">{post.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{post.date}</p>
                                    <p className="text-gray-300 text-sm">{post.description}</p>
                                </div>
                                <button className="mt-4 text-purple-400 hover:text-purple-500 text-sm font-medium self-start">
                                    Đọc thêm →
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

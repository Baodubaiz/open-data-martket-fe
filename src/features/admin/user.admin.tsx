"use client";

import { useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Search } from "lucide-react";
import {
    useUsers,
    useUpdateUser,
    useDeleteUser,
} from "@/hooks/user/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"; // Thêm CardHeader
import { Label } from "@/components/ui/label";
import {
    User,
    Mail,
    Phone,
    Banknote,
    Shield,
    Filter,
    Edit,
    Trash2,
    Zap,
    X,
    Save,
    CreditCard, // Thêm icon CreditCard cho đẹp hơn
    Wallet, // Thêm icon Wallet cho địa chỉ ví
} from "lucide-react";
import { Role } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// --- Custom Colors & Styles ---
const PRIMARY_COLOR = "text-sky-400";
const ACCENT_BG = "bg-sky-600 hover:bg-sky-700";
const HOVER_BG = "hover:bg-gray-700/70";
const ROLE_COLORS: { [key in Role]: string } = {
    admin: "bg-red-500/20 text-red-300 ring-1 ring-red-500",
    seller: "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500",
    buyer: "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500",
};

// --- Skeleton Loader Component ---
const UserSkeleton = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center justify-between bg-gray-800/70 p-4 rounded-xl shadow-xl animate-pulse">
                <div className="w-full md:w-4/5 space-y-2">
                    <Skeleton className="h-5 w-3/5 bg-gray-700/50" />
                    <Skeleton className="h-3 w-4/5 bg-gray-700/50" />
                    <Skeleton className="h-3 w-2/5 bg-gray-700/50" />
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                    <Skeleton className="h-8 w-16 bg-gray-700/50" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700/50" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700/50" />
                </div>
            </div>
        ))}
    </div>
);

// --- Initial Form State ---
const initialFormState = {
    id: "",
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    bank_account: "",
    bank_name: "",
    wallet_address: "",
    role: "buyer" as Role,
    is_active: true
};


export default function UserManager() {
    const token = Cookies.get("accessToken") || localStorage.getItem("accessToken") || "";

    const { data: users, isLoading } = useUsers(token);
    const updateUser = useUpdateUser(token);
    const deleteUser = useDeleteUser(token);

    const [form, setForm] = useState(initialFormState);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [filterRole, setFilterRole] = useState<"all" | Role>("all");
    const [search, setSearch] = useState("");

    // 🧠 Reset form
    const resetForm = () => {
        setForm(initialFormState);
        setIsFormOpen(false);
    }

    // 📤 Submit Update
    const handleSubmit = async () => {
        if (!form.id) return toast.error("❌ Lỗi: Không tìm thấy User ID để cập nhật!");

        // --- LOGIC XÁC THỰC MỚI ---
        if (!form.full_name || !form.email) return toast.warning("Thiếu Họ tên hoặc Email!");

        const hasBankAccount = form.bank_account.trim() !== "";
        const hasWalletAddress = form.wallet_address.trim() !== "";

        if (!hasBankAccount && !hasWalletAddress) {
            return toast.warning("⚠️ Phải có ít nhất một thông tin thanh toán (STK Ngân hàng hoặc Địa chỉ ví)!");
        }
        // --- END LOGIC XÁC THỰC MỚI ---

        if (!token) return toast.error("Chưa có token!");

        // Chuẩn hóa payload: gửi undefined nếu trường rỗng
        const payload = {
            full_name: form.full_name,
            email: form.email,
            password: form.password || undefined,
            phone_number: form.phone_number || undefined,
            bank_account: form.bank_account || undefined,
            bank_name: form.bank_name || undefined,
            wallet_address: form.wallet_address || undefined,
            role: form.role,
            is_active: form.is_active,
        };

        // Debug: Kiểm tra xem các trường rỗng có được gửi là undefined không
        // console.log("Payload:", payload);

        try {
            await updateUser.mutateAsync({ id: form.id, data: payload });
            toast.success("✅ Cập nhật user thành công!");
            resetForm();
        } catch (error) {
            // Thêm toast chi tiết hơn nếu có thể
            toast.error("❌ Có lỗi xảy ra khi cập nhật!");
        }
    };

    // ✏️ Open and populate form for editing
    const startEditing = (user: any) => {
        setForm({
            id: user.user_id,
            full_name: user.full_name || "",
            email: user.email || "",
            password: "", // Luôn reset password khi mở form
            phone_number: user.phone_number || "",
            // Đảm bảo các trường này là chuỗi rỗng thay vì null/undefined để dễ chỉnh sửa
            bank_account: user.bank_account || "",
            bank_name: user.bank_name || "",
            wallet_address: user.wallet_address || "",
            role: user.role as Role,
            is_active: user.is_active ?? true,
        });
        setIsFormOpen(true);
    };

    // 🔄 Toggle active
    const handleToggleActive = async (user: any) => {
        try {
            await updateUser.mutateAsync({
                id: user.user_id,
                data: { is_active: !user.is_active },
            });
            toast.success(
                user.is_active ? "🔒 Đã khóa tài khoản" : "🔓 Đã mở khóa tài khoản"
            );
        } catch {
            toast.error("Không thể thay đổi trạng thái!");
        }
    };

    // 🗑️ Handle Delete
    const handleDelete = (userId: string) => {
        if (confirm("Ngài có chắc muốn xóa vĩnh viễn người dùng này? Thao tác này KHÔNG THỂ HOÀN TÁC!")) {
            deleteUser.mutate(userId);
            toast.success("Người dùng đã bị xóa. 💥");
        }
    };

    // 🧩 Lọc user theo role & search
    const filteredUsers =
        users?.filter((u: any) => {
            const matchesRole = filterRole === "all" || u.role === filterRole;
            const matchesSearch =
                u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()) ||
                u.user_id?.toLowerCase().includes(search.toLowerCase()); // Cho phép tìm kiếm bằng ID
            return matchesRole && matchesSearch;
        }) || [];

    if (!token) return <div className="text-gray-400 p-6">Đang tải token...</div>;

    return (
        <div className="space-y-6 min-h-screen p-4 md:p-8 text-white">
            <h2 className={`text-4xl font-extrabold ${PRIMARY_COLOR} flex items-center mb-6 border-b border-gray-700 pb-3`}>
                <Zap className="w-8 h-8 mr-3" /> QUẢN LÝ NGƯỜI DÙNG ⚡
            </h2>

            {/* --- KHU VỰC LỌC & TÌM KIẾM (ĐÃ CẢI TIẾN) --- */}
            <Card className="bg-gray-900 border-gray-700 shadow-2xl">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

                        {/* Search Input (Làm nổi bật và dễ nhìn hơn) */}
                        <div className="relative flex-1 min-w-[200px] max-w-lg">
                            <Input
                                placeholder="Tìm kiếm theo Tên, Email, hoặc ID người dùng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-sky-500 transition-colors pl-10 h-10"
                            />
                            {/* Đã thay User icon bằng Search icon để trực quan hơn */}
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                        </div>

                        {/* Select Filter (Đặt cạnh ô tìm kiếm) */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-gray-400 text-sm hidden sm:block">Vai trò:</span>
                            <Select
                                value={filterRole}
                                onValueChange={(val) => setFilterRole(val as any)}
                            >
                                <SelectTrigger className="w-[160px] bg-gray-800 border-gray-600 text-white focus:ring-sky-500 transition-colors h-10">
                                    <Filter className="w-4 h-4 mr-2 text-sky-400" />
                                    <SelectValue placeholder="Tất cả vai trò" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                    <SelectItem value="buyer">Buyer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- DANH SÁCH NGƯỜI DÙNG --- */}
            <h3 className="text-2xl font-semibold text-gray-200 mt-8 mb-4">Danh sách người dùng ({filteredUsers.length})</h3>

            {/* Danh sách user - KHU VỰC CUỘN ĐỘC LẬP */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"> {/* custom-scrollbar là class giả định */}
                {isLoading ? (
                    <UserSkeleton />
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => (
                        <div
                            key={u.user_id}
                            className={`
                                flex flex-col md:flex-row items-start md:items-center justify-between 
                                bg-gray-800/80 p-5 rounded-xl shadow-lg border-l-4 
                                ${u.is_active ? 'border-green-500' : 'border-red-500'}
                                transition-all duration-300 transform 
                                ${HOVER_BG} hover:scale-[1.005]
                            `}
                        >
                            {/* Thông tin chính */}
                            <div className="flex-1 w-full overflow-hidden space-y-2">
                                <div className="flex items-center space-x-3 mb-1">
                                    <Shield className={`w-5 h-5 flex-shrink-0 ${u.is_active ? 'text-green-500' : 'text-red-500'}`} />
                                    <p className="font-extrabold text-xl text-sky-300 truncate">
                                        {u.full_name || "Vô danh"}
                                    </p>
                                    {/* Tag Vai trò */}
                                    <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${ROLE_COLORS[u.role as Role]}`}
                                    >
                                        {u.role}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" /> {u.email || "Không có email"}
                                </p>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 pt-1">
                                    {u.phone_number && <span className="flex items-center">
                                        <Phone className="w-3 h-3 mr-1 text-gray-600" /> SĐT: {u.phone_number}
                                    </span>}
                                    {u.bank_account && (
                                        <span className="flex items-center">
                                            <CreditCard className="w-3 h-3 mr-1 text-yellow-600" /> STK: {u.bank_account} ({u.bank_name || "N/A"})
                                        </span>
                                    )}
                                    {u.wallet_address && (
                                        <span className="flex items-center truncate max-w-full">
                                            <Wallet className="w-3 h-3 mr-1 text-green-600" /> Ví: {u.wallet_address}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mt-2">ID: {u.user_id}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-4 md:mt-0 md:ml-4 flex-shrink-0 items-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-700 w-full md:w-auto justify-end">
                                <span className={`text-sm font-medium ${u.is_active ? 'text-green-500' : 'text-red-500'} min-w-[80px] text-right`}>
                                    {u.is_active ? "Kích Hoạt" : "Đã Khóa"}
                                </span>
                                {/* Toggle Switch */}
                                <Switch
                                    checked={u.is_active}
                                    onCheckedChange={() => handleToggleActive(u)}
                                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600 transition-colors duration-200"
                                    title={u.is_active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                />

                                {/* Edit Button - GỌI startEditing để mở form */}
                                <Button
                                    size="icon"
                                    onClick={() => startEditing(u)}
                                    className="rounded-full w-9 h-9 text-blue-400 bg-blue-900/30 hover:bg-blue-900/70 transition-colors"
                                    title="Chỉnh sửa người dùng"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>

                                {/* Delete Button */}
                                <Button
                                    size="icon"
                                    onClick={() => handleDelete(u.user_id)}
                                    className="rounded-full w-9 h-9 text-red-400 bg-red-900/30 hover:bg-red-900/70 transition-colors"
                                    title="Xóa người dùng"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-gray-800 p-8 rounded-xl text-center shadow-lg">
                        <p className="text-gray-500 text-lg">
                            Không tìm thấy người dùng nào phù hợp với bộ lọc. 😥
                        </p>
                    </div>
                )}
            </div>

            {/* --- FLOATING EDIT FORM CẢI TIẾN --- */}
            <div
                className={`
                    fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm 
                    flex items-center justify-center 
                    transition-opacity duration-300
                    ${isFormOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
                `}
                onClick={resetForm}
            >
                <Card
                    className="bg-gray-800 border-gray-700 w-11/12 max-w-2xl shadow-2xl transition-all duration-300 transform scale-100 p-0 overflow-y-auto max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CardHeader className="p-4 md:p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
                        <CardTitle className="text-2xl font-bold text-sky-400 flex justify-between items-center">
                            <span>✏️ CẬP NHẬT USER: <span className="text-gray-300 font-normal text-xl">{form.full_name || form.email || form.id.substring(0, 8) + '...'}</span></span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={resetForm}
                                className="rounded-full text-gray-400 hover:bg-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cột 1: Thông tin cơ bản */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-1 flex items-center"><User className="w-4 h-4 mr-2" /> THÔNG TIN CƠ BẢN</h4>

                                {/* Trường Họ tên */}
                                <div className="space-y-1">
                                    <Label htmlFor="full_name" className="text-gray-400">Họ tên <span className="text-red-500">*</span></Label>
                                    <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" />
                                </div>

                                {/* Trường Email */}
                                <div className="space-y-1">
                                    <Label htmlFor="email" className="text-gray-400">Email <span className="text-red-500">*</span></Label>
                                    <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" type="email" />
                                </div>

                                {/* Trường Mật khẩu */}
                                <div className="space-y-1">
                                    <Label htmlFor="password" className="text-gray-400">Mật khẩu (Để trống nếu không đổi)</Label>
                                    <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" placeholder="********" />
                                </div>

                                {/* Trường SĐT */}
                                <div className="space-y-1">
                                    <Label htmlFor="phone_number" className="text-gray-400">Số điện thoại</Label>
                                    <Input id="phone_number" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" />
                                </div>
                            </div>

                            {/* Cột 2: Vai trò & Thanh toán */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-1 flex items-center"><Banknote className="w-4 h-4 mr-2" /> VAI TRÒ & THANH TOÁN</h4>

                                {/* Trường Vai trò và Trạng thái (Flex ngang) */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Select Role */}
                                    <div className="space-y-1">
                                        <Label className="text-gray-400">Vai trò</Label>
                                        <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val as Role })}>
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-sky-500">
                                                <SelectValue placeholder="Chọn vai trò" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="seller">Seller</SelectItem>
                                                <SelectItem value="buyer">Buyer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Kích hoạt */}
                                    <div className="space-y-1">
                                        <Label className="text-gray-400">Trạng thái</Label>
                                        <div className="flex items-center space-x-3 h-10 pt-2">
                                            <Switch
                                                checked={form.is_active}
                                                onCheckedChange={(val) => setForm({ ...form, is_active: val })}
                                                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                                            />
                                            <span className="text-sm text-gray-300">{form.is_active ? 'Kích hoạt' : 'Đã Khóa'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trường Ngân hàng */}
                                <div className="space-y-1">
                                    <Label htmlFor="bank_account" className="text-gray-400">STK Ngân hàng</Label>
                                    <Input id="bank_account" value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" placeholder="Bắt buộc có nếu không có Địa chỉ ví" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="bank_name" className="text-gray-400">Tên Ngân hàng</Label>
                                    <Input id="bank_name" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" />
                                </div>

                                {/* Trường Địa chỉ ví */}
                                <div className="space-y-1">
                                    <Label htmlFor="wallet_address" className="text-gray-400">Địa chỉ ví (Crypto/Tài sản số)</Label>
                                    <Input id="wallet_address" value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} className="bg-gray-700 border-gray-600 text-white focus:border-sky-500" placeholder="Bắt buộc có nếu không có STK Ngân hàng" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-8 pt-4 border-t border-gray-700">
                            {/* Nút Cập nhật */}
                            <Button
                                onClick={handleSubmit}
                                className={`${ACCENT_BG} font-bold transition-all duration-300 shadow-xl shadow-sky-900/50`}
                                disabled={updateUser.isPending}
                            >
                                <Save className="w-4 h-4 mr-2" /> {updateUser.isPending ? "Đang xử lý..." : "Lưu Thay Đổi"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* --- END FLOATING EDIT FORM CẢI TIẾN --- */}
        </div>
    );
}

// Thêm style cho thanh cuộn (nếu cần)
// Bạn có thể thêm CSS này vào file CSS toàn cục nếu đang dùng Tailwind CSS để style cho div có class 'custom-scrollbar'
/*
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #1f2937; // gray-800
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #374151; // gray-700
    border-radius: 20px;
    border: 2px solid #111827; // gray-900
}
*/
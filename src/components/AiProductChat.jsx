import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FiMessageCircle, FiX, FiSend, FiLoader, FiHeart, FiShoppingBag } from "react-icons/fi";

import { filterProducts } from "../services/productFilterApi.js";

// Dùng biến môi trường
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const AiProductChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Chào người đẹp! Mình là chuyên viên tư vấn da liễu AI đây ạ. Da bạn thuộc loại nào (dầu, khô, nhạy cảm...) và bạn đang tìm sản phẩm trị mụn, dưỡng trắng hay chống lão hóa nè?"
        }
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Phân tích ý định
    const analyzeIntent = async (userText) => {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
      Bạn là chuyên gia tư vấn mỹ phẩm.
      INPUT: "${userText}"

      QUY TẮC:
      - "mụn", "mụn ẩn" → search: "mụn"
      - "da dầu", "nhờn", "bóng dầu" → search: "da dầu"
      - "khô", "bong tróc" → search: "cấp ẩm"
      - "trắng", "sáng da", "thâm" → search: "dưỡng trắng"
      - chào hỏi, hỏi cách dùng → type: "chat"

      Trả đúng JSON sau, không thêm chữ thừa:
      {
        "type": "search" | "chat",
        "params": { "search": "từ khóa", "minPrice": null, "maxPrice": null, "sort": "newest" },
        "reply": "nếu chat thì trả lời dễ thương, còn lại để trống"
      }`;

        try {
            const result = await model.generateContent(prompt);
            const text = (await result.response).text().trim();
            console.log("AI Raw Response:", text);
            return JSON.parse(text);
        } catch (error) {
            console.error("AI Error:", error);
            return { type: "search", params: { search: userText } };
        }
    };

    // === CHỨC NĂNG MỚI: Click vào sản phẩm → mở trang chi tiết ===
    const handleProductClick = (productId) => {
        // Đổi thành route đúng từ code: /products/:id
        const detailUrl = `/products/${productId}`;
        window.location.href = detailUrl; // Cách đơn giản nhất
        // Nếu bạn dùng React Router: navigate(`/products/${productId}`)
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const intent = await analyzeIntent(userMsg);

            if (intent.type === "chat") {
                setMessages(prev => [...prev, { role: "model", text: intent.reply || "Dạ chị kể thêm về làn da giúp em tư vấn kỹ hơn nha!" }]);
            } else {
                setMessages(prev => [...prev, { role: "model", text: `Đợi em tí, đang tìm sản phẩm "${intent.params.search}" cho chị nè...` }]);

                try {
                    const data = await filterProducts({
                        ...intent.params,
                        page: 0,
                        size: 5,
                        active: true
                    });

                    const products = data.content || data || [];

                    if (products.length > 0) {
                        const productCards = (
                            <div className="flex flex-col gap-3 mt-3">
                                {products.map(p => (
                                    <div
                                        key={p.id}
                                        className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm flex gap-3 hover:shadow-lg transition-all cursor-pointer group select-none"
                                        onClick={() => handleProductClick(p.id)} // ← CLICK ĐƯỢC RỒI NÈ!
                                    >
                                        {/* ẢNH */}
                                        <div className="w-16 h-16 bg-rose-50 rounded-lg flex-shrink-0 overflow-hidden">
                                            {p.images?.[0] || p.thumbnail ? (
                                                <img
                                                    src={p.images?.[0] || p.thumbnail}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiShoppingBag size={28} className="text-rose-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* TÊN + GIÁ */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-rose-500 transition-colors">
                                                {p.name || "Sản phẩm xinh"}
                                            </h4>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-rose-600 font-bold text-sm whitespace-nowrap">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                        p.price || p.minPrice || 0
                                                    )}
                                                </span>
                                                <span className="text-xs bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Xem chi tiết →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        setMessages(prev => [
                            ...prev,
                            { role: "model", text: `Tìm được ${products.length} sản phẩm hợp với chị nè! Click vào để xem chi tiết nha!`, component: productCards }
                        ]);
                    } else {
                        setMessages(prev => [...prev, { role: "model", text: "Hiện shop đang cập nhật thêm nhiều sản phẩm xịn hơn nha chị! Chị thử hỏi em “kem trị mụn”, “toner da dầu” hay “serum dưỡng trắng” xem sao nè?" }]);
                    }
                } catch (err) {
                    setMessages(prev => [...prev, { role: "model", text: "Oops, server đang ngại ngùng chút xíu, chị thử lại sau 1 phút nha!" }]);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "model", text: "Em bị lag nhẹ, chị hỏi lại em nha!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Nút mở chat */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-5 rounded-full shadow-2xl transition-all hover:scale-110 
                    ${isOpen ? 'bg-gray-600' : 'bg-gradient-to-r from-rose-400 to-pink-500 animate-pulse'} 
                    text-white border-4 border-white`}
            >
                {isOpen ? <FiX size={30} /> : <FiMessageCircle size={34} />}
            </button>

            {/* Khung chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col border-4 border-rose-200 overflow-hidden font-sans">
                    <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-5 text-white flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-full">
                            <FiHeart size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Beauty AI Advisor</h3>
                            <p className="text-sm opacity-90">Tư vấn skincare 24/7</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 bg-rose-50/30 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-md 
                                    ${msg.role === "user"
                                    ? "bg-rose-500 text-white rounded-tr-none"
                                    : "bg-white text-gray-700 border border-rose-100 rounded-tl-none"}`}
                                >
                                    <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                                    {msg.component && <div className="mt-3">{msg.component}</div>}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-rose-100 shadow-md flex items-center gap-3">
                                    <FiLoader className="animate-spin text-rose-400" />
                                    <span className="text-sm text-gray-500 italic">Đang tìm sản phẩm xịn cho chị...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t-2 border-rose-100 flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !isLoading && handleSend()}
                            placeholder="Hỏi em gì cũng được nha..."
                            className="flex-1 bg-gray-100 text-sm rounded-2xl px-5 py-3 focus:outline-none focus:ring-4 focus:ring-rose-200 border-0"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-rose-500 text-white p-4 rounded-2xl hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg"
                        >
                            <FiSend size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiProductChat;
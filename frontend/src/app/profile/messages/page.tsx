"use client";

import React, { useState } from 'react';
import {
    MagnifyingGlass,
    PaperPlaneRight,
    DotsThree,
    Check,
    Checks,
    Image as ImageIcon,
    Paperclip
} from '@phosphor-icons/react';

export default function MessagesPage() {
    const [activeChat, setActiveChat] = useState(1);

    const contacts = [
        { id: 1, name: 'Somchai_K', message: 'รถยังอยู่ไหมครับ สนใจดูรถวันเสาร์นี้', time: '10:30', unread: 2, avatar: 'https://i.pravatar.cc/150?img=68' },
        { id: 2, name: 'Garage_Pro', message: 'โอเคครับ เดี๋ยวผมส่งโลเคชั่นให้', time: 'เมื่อวาน', unread: 0, avatar: 'https://i.pravatar.cc/150?img=33' },
        { id: 3, name: 'Alice_Wonder', message: 'ขอบคุณค่ะ', time: '2 วันที่แล้ว', unread: 0, avatar: 'https://i.pravatar.cc/150?img=45' },
    ];

    const messages = [
        { id: 1, sender: 'me', text: 'สวัสดีครับ สนใจรถ Honda City ครับ', time: '09:00' },
        { id: 2, sender: 'other', text: 'สวัสดีครับ รถยังอยู่ครับ สะดวกเข้ามาดูวันไหนครับ?', time: '09:05' },
        { id: 3, sender: 'me', text: 'วันเสาร์นี้ช่วงบ่ายสะดวกไหมครับ?', time: '09:10' },
        { id: 4, sender: 'other', text: 'ได้ครับ เดี๋ยวผมเตรียมรถไว้ให้', time: '09:15' },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex">

            {/* Sidebar / Contact List */}
            <div className="w-full md:w-80 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800 text-lg mb-3">กล่องข้อความ</h2>
                    <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="ค้นหา..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:border-gray-200 rounded-xl text-sm outline-none transition" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setActiveChat(contact.id)}
                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${activeChat === contact.id ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={contact.avatar} className="w-12 h-12 rounded-full object-cover" alt={contact.name} />
                                {contact.unread > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className={`text-sm truncate ${contact.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{contact.name}</h4>
                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{contact.time}</span>
                                </div>
                                <p className={`text-xs truncate ${contact.unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{contact.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-1 flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <img src={contacts.find(c => c.id === activeChat)?.avatar} className="w-10 h-10 rounded-full" alt="Active User" />
                        <div>
                            <h3 className="font-bold text-gray-800">{contacts.find(c => c.id === activeChat)?.name}</h3>
                            <span className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> ออนไลน์</span>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><DotsThree weight="bold" size={24} /></button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'me'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                <p>{msg.text}</p>
                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {msg.time}
                                    {msg.sender === 'me' && <Checks weight="bold" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition"><Paperclip weight="bold" size={20} /></button>
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition"><ImageIcon weight="bold" size={20} /></button>
                        <div className="flex-1 relative">
                            <input type="text" placeholder="พิมพ์ข้อความ..." className="w-full bg-gray-100 text-gray-800 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition" />
                        </div>
                        <button className="p-2.5 bg-primary text-white rounded-full hover:bg-opacity-90 transition shadow-lg shadow-blue-900/10">
                            <PaperPlaneRight weight="fill" size={20} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

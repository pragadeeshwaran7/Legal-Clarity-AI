
"use client";

import { useState, useRef, useEffect } from 'react';
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askChatbot } from '@/app/actions';
import { Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

type Message = {
    sender: 'user' | 'bot';
    text: string;
};

type LegalChatbotProps = {
    documentText: string;
};

export function LegalChatbot({ documentText }: LegalChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hello! Ask me any questions about your document, including questions about applicable laws or IPC sections." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const formData = new FormData();
        formData.append("documentText", documentText);
        formData.append("question", inputValue);

        const result = await askChatbot(formData);
        
        const botMessage: Message = {
            sender: 'bot',
            text: result.answer || "Sorry, I couldn't process that question. Please try again."
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);


    return (
        <>
            <CardHeader>
                <CardTitle className="font-headline">Legal Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4" ref={scrollAreaRef}>
                     <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                {message.sender === 'bot' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                                {message.sender === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                        id="message"
                        placeholder="e.g., What are the penalties for breaching clause 5.2?"
                        className="flex-1"
                        autoComplete="off"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                        Send
                    </Button>
                </form>
            </CardFooter>
        </>
    );
}

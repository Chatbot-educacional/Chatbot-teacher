import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialMessages = [
  {
    id: 1,
    sender: "Ana Silva",
    message: "Professor, estou com dificuldade nos exercícios de ponteiros.",
    timestamp: "14:30",
    isTeacher: false
  },
  {
    id: 2,
    sender: "Prof. Marcos",
    message: "Olá Ana! Vou preparar alguns exercícios extras para você. Que tal revisarmos na próxima aula?",
    timestamp: "14:35",
    isTeacher: true
  },
  {
    id: 3,
    sender: "Carlos Santos",
    message: "O exercício 15 de Java está muito difícil!",
    timestamp: "15:20",
    isTeacher: false
  }
];

export function ChatPanel() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "Prof. Marcos",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-md h-96">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Chat Professor ↔ Alunos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 px-6">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isTeacher ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isTeacher
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="font-medium text-xs mb-1 opacity-80">
                    {message.sender}
                  </div>
                  <div className="text-sm">{message.message}</div>
                  <div className="text-xs mt-1 opacity-60">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Trash2,
  BookOpen,
  AlertCircle,
  Loader2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  isError?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Здравствуйте! Я AI-консультант учебного центра «Академия Будущего». Подскажу стоимость курсов в сумах, условия рассрочки, расписание преподавателей, правила записи и переноса занятий. О чём вы хотите узнать?',
};

const QUICK_PROMPTS = [
  'Сколько стоят курсы по Python?',
  'Свободные окна на Понедельник',
  'График работы Воронова А.С.',
  'Как перенести занятие?',
];

function renderFormattedText(text: string) {
  // Split by newlines and render **bold** spans safely without dangerouslySetInnerHTML
  return text.split('\n').map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={partIdx}>{part}</React.Fragment>;
        })}
        {lineIdx < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function RagAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== 'welcome' && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: data?.error || 'Не удалось получить ответ от сервера.',
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            sources: data.sources,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Ошибка сети. Проверьте подключение и повторите попытку.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleSync = async () => {
    if (isSyncing || isLoading) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/rag/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sync-err-${Date.now()}`,
            role: 'assistant',
            content: data?.error || 'Не удалось обновить базу знаний.',
            isError: true,
          },
        ]);
      } else {
        const docSummary = Array.isArray(data.documents)
          ? data.documents
              .map(
                (d: { title: string; chunksCount: number }) =>
                  `• ${d.title}: ${d.chunksCount} фрагм.`
              )
              .join('\n')
          : '';
        setMessages((prev) => [
          ...prev,
          {
            id: `sync-ok-${Date.now()}`,
            role: 'assistant',
            content: `**База знаний обновлена из Google Диска!** Загружено фрагментов: **${data.totalChunks}**\n${docSummary}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `sync-err-${Date.now()}`,
          role: 'assistant',
          content: 'Ошибка сети при синхронизации базы знаний.',
          isError: true,
        },
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[400px] h-[550px] max-h-[80vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>AI-консультант</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </div>
                <div className="text-[11px] text-blue-100 font-medium">
                  Vector RAG • gemini-3.5-flash-lite
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSync}
                disabled={isSyncing || isLoading}
                title="Обновить базу знаний из Google Диска"
                aria-label="Обновить базу знаний из Google Диска"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={handleClear}
                title="Очистить диалог"
                aria-label="Очистить диалог"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Свернуть чат"
                aria-label="Свернуть чат"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : msg.isError
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-bl-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-sm'
                  }`}
                >
                  {msg.isError && (
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Внимание</span>
                    </div>
                  )}
                  <div>{renderFormattedText(msg.content)}</div>
                </div>

                {/* RAG Source Badges */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 max-w-[85%]">
                    <BookOpen className="w-3 h-3 text-slate-400 mr-0.5" />
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Quick Prompts when chat just started */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Частые вопросы:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="text-left text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span>Ищу ответ в базе знаний...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите о ценах, графике или FAQ..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Отправить сообщение"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Закрыть AI-консультанта' : 'Открыть AI-консультанта'}
        className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1.5 animate-pulse" />
            </div>
            <span className="hidden sm:inline">AI-консультант</span>
          </>
        )}
      </button>
    </div>
  );
}

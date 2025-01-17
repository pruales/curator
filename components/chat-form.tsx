'use client'

import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'
import { ArrowUpIcon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AutoResizeTextarea } from '@/components/autoresize-textarea'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { MessageLoading } from '@/components/ui/message-loading'

export function ChatForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/chat',
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void append({ content: input, role: 'user' })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <SidebarTrigger className="md:hidden">
        <Menu className="h-6 w-6" />
      </SidebarTrigger>
      <h1 className="text-lg font-semibold">AI Chatbot</h1>
      <div className="w-6" /> {/* Spacer for alignment */}
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {message.content}
          {index === messages.length - 1 && 
           message.role === 'assistant' && 
           isLoading &&
           !message.content && (
            <span className="inline-block ml-1">
              <MessageLoading />
            </span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col',
        className
      )}
      {...props}
    >
      {header}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length ? messageList : (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground">
              Start a conversation by sending a message.
            </p>
          </div>
        )}
      </div>
      <div className="border-t bg-background px-4 py-2">
        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-auto max-w-3xl flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={v => setInput(v)}
            value={input}
            placeholder="Enter a message"
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-1 right-1 size-6 rounded-full"
              >
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </div>
  )
}


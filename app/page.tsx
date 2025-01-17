import { AppSidebar } from '@/components/sidebar'
import { ChatForm } from '@/components/chat-form'

export default function Page() {
  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex">
        <ChatForm />
      </main>
    </>
  )
}


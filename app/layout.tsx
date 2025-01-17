import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OpenAI and AI SDK Chatbot',
  description: 'A simple chatbot built using the AI SDK and gpt-4o-mini.',
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={cn('flex h-full', inter.className)}>
        <TooltipProvider delayDuration={0}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}


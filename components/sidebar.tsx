'use client'

import { LogOut, Rss, Menu } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { createClient } from '@/utils/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Mock feeds data (replace with actual feeds data in a real application)
const feeds = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'Politics' },
  { id: 4, name: 'Entertainment' },
]

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUser(data?.user)
      console.log(data?.user)
    }
    fetchUser()
  }, [])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold px-4 py-2">AI Chatbot</h2>
        <SidebarTrigger className="md:hidden">
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Feeds</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {feeds.map((feed) => (
                <SidebarMenuItem key={feed.id}>
                  <SidebarMenuButton asChild>
                    <button className="w-full text-left">
                      <Rss className="w-4 h-4 mr-2" />
                      <span>{feed.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Avatar className="w-8 h-8 mr-2">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
              <AvatarFallback>{user?.user_metadata?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.user_metadata?.name}</span>
          </div>
          <Button variant="ghost" size="icon" title="Logout" onClick={() => {
            const supabase = createClient()
            supabase.auth.signOut()
            router.push('/')
          }}>
            <LogOut className="w-4 h-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Github } from 'lucide-react'
import { createClient } from "@/utils/server"
import { redirect } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Click the button below to login with your GitHub account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => {
            "use server"
            const supabase = await createClient()
            
            const {data, error} = await supabase.auth.signInWithOAuth({
              provider: 'github',
              options: {
                redirectTo: 'http://localhost:3000/auth/confirm',
              },
            })
            if (error || !data?.url) {
              console.error(error)
            }
            
            redirect(data.url!)
           
          }}>
            <Button type="submit" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Login with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


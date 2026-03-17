import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { cookies } from "next/headers";
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: todos } = await supabase.from('todos').select()
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <ul>
        {todos?.map((todo) => (
          <li>{todo}</li>
        ))}
      </ul>
    </section>
  );
}

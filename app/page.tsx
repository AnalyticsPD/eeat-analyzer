import { UrlForm } from "@/components/url-form-preview"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <PageHeader />
      <UrlForm />
    </main>
  )
}


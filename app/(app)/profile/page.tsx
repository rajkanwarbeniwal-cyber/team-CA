import { Metadata } from "next"
import { ProfileForm } from "@/components/profile/profile-form"
import { SubjectMapper } from "@/components/profile/subject-mapper"

export const metadata: Metadata = {
  title: "Profile - Taksha",
  description: "Manage your exam profile and subject strengths",
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your exam details and track your subject strengths
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ProfileForm />
        </div>

        {/* Subject Mapper Sidebar */}
        <div>
          <SubjectMapper />
        </div>
      </div>
    </div>
  )
}

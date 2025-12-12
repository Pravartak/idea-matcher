"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, UserCheck } from "lucide-react"

interface User {
  id: string
  name: string
  role: string
  skills: string[]
  avatar: string
  isConnected: boolean
  matchPercentage?: number
}

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")

  // Mock data for connected users
  const connectedUsers: User[] = [
    {
      id: "1",
      name: "Pratik Shinde",
      role: "Frontend developer experienced in React and Next.js",
      skills: ["React", "TypeScript", "Next.js"],
      avatar: "/developer-avatar-male.jpg",
      isConnected: true,
    },
    {
      id: "2",
      name: "Malhar Sane",
      role: "Backend engineer specializing in Node.js and databases",
      skills: ["Node.js", "MongoDB", "PostgreSQL"],
      avatar: "/developer-avatar-glasses.png",
      isConnected: true,
    },
    {
      id: "3",
      name: "Saloni Mandhare",
      role: "Full-stack developer with AI/ML interests",
      skills: ["Python", "TensorFlow", "React"],
      avatar: "/creative-developer-avatar-female.jpg",
      isConnected: true,
    },
    {
      id: "4",
      name: "Simran Mishra",
      role: "UI/UX Designer who codes",
      skills: ["Figma", "Design", "React"],
      avatar: "/tech-lead-avatar.png",
      isConnected: true,
    },
    {
      id: "5",
      name: "Zahid Shaikh",
      role: "UI/UX Designer who codes",
      skills: ["Figma", "Design", "React"],
      avatar: "/tech-lead-avatar.png",
      isConnected: true,
    },
  ]

  // Mock data for recommended connections
  const recommendedUsers: User[] = [
    {
      id: "5",
      name: "Pratik Sharma",
      role: "Fullstack dev building tools for developers",
      skills: ["React", "TypeScript", "Node.js"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 92,
    },
    {
      id: "6",
      name: "Zahid Ahmed",
      role: "Product-minded engineer building SaaS",
      skills: ["Product", "React", "UX"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 88,
    },
    {
      id: "7",
      name: "Malhar Patel",
      role: "Designer who codes. Systems, branding, UI.",
      skills: ["Design", "Figma", "Branding"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 85,
    },
    {
      id: "8",
      name: "Simran Kaur",
      role: "Research to reality: prototyping AI/ML applications",
      skills: ["AI/ML", "Python", "Research"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 83,
    },
    {
      id: "9",
      name: "Saloni Verma",
      role: "Early-stage founder exploring go-to-market strategy",
      skills: ["Founder", "Strategy", "Go-To-Market"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 80,
    },
    {
      id: "10",
      name: "Arjun Reddy",
      role: "Mobile developer building cross-platform apps",
      skills: ["React Native", "Flutter", "Mobile"],
      avatar: "/placeholder.svg?height=80&width=80",
      isConnected: false,
      matchPercentage: 78,
    },
  ]

  // Filtering logic for connected users
  const filteredConnectedUsers = connectedUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill =
      skillFilter === "all" || user.skills.some((skill) => skill.toLowerCase() === skillFilter.toLowerCase())
    return matchesSearch && matchesSkill
  })

  // Filtering logic for recommended users
  const filteredRecommendedUsers = recommendedUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill =
      skillFilter === "all" || user.skills.some((skill) => skill.toLowerCase() === skillFilter.toLowerCase())
    return matchesSearch && matchesSkill
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10">
          <Input
            type="text"
            placeholder="Search users by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-card border-border font-mono text-sm"
          />
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border font-mono text-sm">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Skills</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="nodejs">Node.js</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="design">Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Your Connections Section */}
        <section className="mb-10 sm:mb-12">
          <h2 className="font-mono text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Your Connections</h2>
          <p className="font-mono text-sm text-muted-foreground mb-6">People you're already connected with.</p>

          {filteredConnectedUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredConnectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-border">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-mono">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono font-semibold text-sm sm:text-base text-foreground mb-1 truncate">
                        {user.name}
                      </h3>
                      <p className="font-mono text-xs sm:text-sm text-muted-foreground line-clamp-2">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="font-mono text-xs bg-secondary/50 hover:bg-secondary/70"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full font-mono text-sm border-border hover:bg-accent bg-transparent"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="font-mono text-sm text-muted-foreground">No connections found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Recommended Connections Section */}
        <section>
          <h2 className="font-mono text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
            Recommended Connections
          </h2>
          <p className="font-mono text-sm text-muted-foreground mb-6">
            Discover people who match your interests and skills.
          </p>

          {filteredRecommendedUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredRecommendedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-border">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-mono">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-mono font-semibold text-sm sm:text-base text-foreground truncate">
                          {user.name}
                        </h3>
                        {user.matchPercentage && (
                          <span className="font-mono text-xs text-primary font-semibold ml-2 shrink-0">
                            {user.matchPercentage}%
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs sm:text-sm text-muted-foreground line-clamp-2">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="font-mono text-xs bg-secondary/50 hover:bg-secondary/70"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full font-mono text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="font-mono text-sm text-muted-foreground">
                No recommended connections found matching your criteria.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

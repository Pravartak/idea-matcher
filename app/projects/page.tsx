'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X, Menu, Compass, FolderOpen, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Skill {
  name: string
  filled: boolean
}

interface Project {
  id: string
  title: string
  description: string
  logo?: string
  skills: Skill[]
  membersJoined: number
  maxMembers: number
  category: 'explore' | 'your' | 'saved'
}

const mockExploreProjects: Project[] = [
  {
    id: '1',
    title: 'AI Code Review',
    description: 'An AI-powered tool that reviews code quality and provides suggestions',
    logo: '/placeholder.svg',
    skills: [
      { name: 'Python', filled: true },
      { name: 'FastAPI', filled: true },
      { name: 'React', filled: false },
      { name: 'TypeScript', filled: false },
    ],
    membersJoined: 3,
    maxMembers: 6,
    category: 'explore',
  },
  {
    id: '2',
    title: 'Mobile App Dev',
    description: 'Building a cross-platform mobile application for productivity',
    logo: '/placeholder.svg',
    skills: [
      { name: 'React Native', filled: true },
      { name: 'Firebase', filled: true },
      { name: 'Node.js', filled: false },
    ],
    membersJoined: 2,
    maxMembers: 5,
    category: 'explore',
  },
  {
    id: '3',
    title: 'Web Design System',
    description: 'Creating a comprehensive design system for web applications',
    logo: '/placeholder.svg',
    skills: [
      { name: 'Figma', filled: true },
      { name: 'CSS', filled: true },
      { name: 'JavaScript', filled: true },
    ],
    membersJoined: 4,
    maxMembers: 4,
    category: 'explore',
  },
  {
    id: '4',
    title: 'Data Analytics Platform',
    description: 'Platform for real-time data visualization and analytics',
    logo: '/placeholder.svg',
    skills: [
      { name: 'Python', filled: true },
      { name: 'D3.js', filled: false },
      { name: 'PostgreSQL', filled: true },
    ],
    membersJoined: 2,
    maxMembers: 5,
    category: 'explore',
  },
]

const mockYourProjects: Project[] = [
  {
    id: '5',
    title: 'E-Commerce Platform',
    description: 'Building a full-stack e-commerce platform',
    logo: '/placeholder.svg',
    skills: [
      { name: 'Next.js', filled: true },
      { name: 'MongoDB', filled: true },
      { name: 'Stripe', filled: false },
    ],
    membersJoined: 5,
    maxMembers: 8,
    category: 'your',
  },
  {
    id: '6',
    title: 'Open Source Library',
    description: 'Creating a popular open-source utility library',
    logo: '/placeholder.svg',
    skills: [
      { name: 'TypeScript', filled: true },
      { name: 'Testing', filled: true },
    ],
    membersJoined: 3,
    maxMembers: 6,
    category: 'your',
  },
]

const mockSavedProjects: Project[] = [
  {
    id: '7',
    title: 'Blockchain Wallet',
    description: 'Developing a secure blockchain wallet application',
    logo: '/placeholder.svg',
    skills: [
      { name: 'Solidity', filled: true },
      { name: 'Web3.js', filled: true },
      { name: 'React', filled: false },
    ],
    membersJoined: 1,
    maxMembers: 4,
    category: 'saved',
  },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'explore' | 'your' | 'saved'>('explore')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getNavIcon = (id: string) => {
    switch (id) {
      case 'explore':
        return <Compass className="h-5 w-5" />
      case 'your':
        return <FolderOpen className="h-5 w-5" />
      case 'saved':
        return <Bookmark className="h-5 w-5" />
      default:
        return null
    }
  }

  const getProjects = () => {
    switch (activeTab) {
      case 'your':
        return mockYourProjects
      case 'saved':
        return mockSavedProjects
      default:
        return mockExploreProjects
    }
  }

  const filterProjects = (projects: Project[]) => {
    if (!searchQuery.trim()) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.skills.some((s) => s.name.toLowerCase().includes(query))
    )
  }

  const filteredProjects = filterProjects(getProjects())

  const navTabs = [
    { id: 'explore', label: 'Explore' },
    { id: 'your', label: 'Your Projects' },
    { id: 'saved', label: 'Saved Projects' },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-card border-r border-border/70 transition-all duration-300 flex flex-col sticky top-0 h-screen hidden md:flex`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`m-2 flex items-center rounded-lg border border-border/70 transition-colors hover:bg-muted ${
            sidebarOpen ? 'justify-start gap-4 px-4 py-3' : 'justify-center p-3'
          }`}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
          {sidebarOpen && <span className="font-mono text-sm">IdeaMatcher_</span>}
        </button>

        <div className="flex-1 w-full px-2 py-2 space-y-2 flex flex-col">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'explore' | 'your' | 'saved')}
              className={`w-full flex items-center rounded-lg border transition-colors ${
                sidebarOpen ? 'justify-start gap-4 px-4 py-3' : 'justify-center p-3'
              } ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-foreground hover:bg-muted border-border/70'
              }`}
            >
              <div className="flex-shrink-0">{getNavIcon(tab.id)}</div>
              {sidebarOpen && <span className="font-mono text-sm whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="sticky top-0 bg-background border-b border-border/70 z-10">
          <div className="max-w-6xl mx-auto w-full px-4 py-4 flex items-center">
            <div className="w-24 flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-muted rounded-lg border border-border/70 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg border border-border/70 transition-colors md:hidden"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <h1 className="text-lg font-mono font-bold flex-1 text-center">IdeaMatcher</h1>

            <div className="w-24" />
          </div>
        </div>

        <div className="md:hidden overflow-x-auto flex gap-2 px-4 py-3 border-b border-border/70 bg-card">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'explore' | 'your' | 'saved')}
              className={`px-3 py-1 rounded-lg border text-sm font-mono whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-foreground border-border/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-card border-border/70 font-mono"
              />
              {searchQuery && (
                <button
                  title="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-border/70 bg-card rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-3"
                  >
                    {project.logo && (
                      <Avatar className="h-12 w-12 border border-muted">
                        <AvatarImage src={project.logo} alt={project.title} />
                        <AvatarFallback>{project.title.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}

                    <h3 className="font-mono font-bold text-sm">{project.title}</h3>

                    <p className="font-mono text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge
                          key={skill.name}
                          className={`font-mono text-xs ${
                            skill.filled
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground border border-muted-foreground'
                          }`}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/70">
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.membersJoined}/{project.maxMembers} Members
                      </span>
                      <Button size="sm" className="font-mono text-xs h-8">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-center">
                <p className="font-mono text-muted-foreground">
                  {'No projects found for "' + searchQuery + '"'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

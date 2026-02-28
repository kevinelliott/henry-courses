'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function LearnPage({ params }: { params: { slug: string } }) {
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  // Placeholder structure for demo
  const sections = [
    {
      id: 's1', title: 'Getting Started', lessons: [
        { id: 'l1', title: 'Introduction', video_url: '', content: 'Welcome to the course!' },
        { id: 'l2', title: 'Setup', video_url: '', content: 'Let\'s set up your environment.' },
      ]
    },
    {
      id: 's2', title: 'Core Concepts', lessons: [
        { id: 'l3', title: 'Lesson 3', video_url: '', content: 'Core concept 1.' },
      ]
    }
  ]

  const allLessons = sections.flatMap(s => s.lessons)
  const totalLessons = allLessons.length
  const completedCount = completed.size
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const active = currentLesson || allLessons[0]

  function getEmbedUrl(url: string) {
    if (!url) return ''
    if (url.includes('youtube.com/watch')) {
      const v = new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${v}`
    }
    if (url.includes('youtu.be/')) {
      const v = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${v}`
    }
    if (url.includes('vimeo.com/')) {
      const v = url.split('vimeo.com/')[1]
      return `https://player.vimeo.com/video/${v}`
    }
    return url
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Progress bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="h-1 bg-indigo-600" style={{ width: `${progress}%` }} />
        <div className="px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-sm">Henry Courses</Link>
          <span className="text-gray-400 text-sm">{completedCount}/{totalLessons} completed • {progress}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            {sections.map(section => (
              <div key={section.id} className="mb-4">
                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{section.title}</div>
                {section.lessons.map(lesson => (
                  <button key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 ${active?.id === lesson.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs ${completed.has(lesson.id) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500'}`}>
                      {completed.has(lesson.id) ? '✓' : ''}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {active?.video_url && (
            <div className="aspect-video bg-black">
              <iframe src={getEmbedUrl(active.video_url)} className="w-full h-full" allowFullScreen />
            </div>
          )}
          {!active?.video_url && (
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500 text-lg">No video for this lesson</span>
            </div>
          )}
          <div className="p-8 max-w-3xl">
            <h1 className="text-white text-2xl font-bold mb-4">{active?.title}</h1>
            {active?.content && (
              <div className="text-gray-300 mb-8 whitespace-pre-wrap">{active.content}</div>
            )}
            <button
              onClick={() => {
                if (active) setCompleted(prev => new Set([...prev, active.id]))
              }}
              disabled={completed.has(active?.id)}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              {completed.has(active?.id) ? '✓ Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

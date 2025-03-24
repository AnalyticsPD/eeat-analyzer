"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info, Clock, FileText, Link2, Calendar, User, Code } from "lucide-react"

interface AnalysisResultsProps {
  results: {
    overallScore: number
    eeatScore: number
    helpfulContentScore: number
    visualScore: number
    eeatAnalysis: {
      strengths: string[]
      weaknesses: string[]
      recommendations: string[]
    }
    helpfulContentAnalysis: {
      strengths: string[]
      weaknesses: string[]
      recommendations: string[]
    }
    visualAnalysis: {
      strengths: string[]
      weaknesses: string[]
      recommendations: string[]
    }
    screenshot?: string
    url: string
    metadata?: {
      title: string
      description: string
      wordCount: number
      readingTime: number
      hasAuthorInfo: boolean
      hasDates: boolean
      hasReferences: boolean
      hasSchema: boolean
    }
  }
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <div className="mt-8 space-y-6">
      {results.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Page Metadata</CardTitle>
            <CardDescription>Key information about the analyzed page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Title</h3>
                <p className="text-sm text-muted-foreground">{results.metadata.title}</p>
              </div>

              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {results.metadata.description || "No description found"}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetadataItem
                  icon={<FileText className="h-4 w-4" />}
                  label="Word Count"
                  value={results.metadata.wordCount.toString()}
                />
                <MetadataItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Reading Time"
                  value={`${results.metadata.readingTime} min`}
                />
                <MetadataItem
                  icon={<User className="h-4 w-4" />}
                  label="Author Info"
                  value={results.metadata.hasAuthorInfo ? "Yes" : "No"}
                  status={results.metadata.hasAuthorInfo}
                />
                <MetadataItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Publication Date"
                  value={results.metadata.hasDates ? "Yes" : "No"}
                  status={results.metadata.hasDates}
                />
                <MetadataItem
                  icon={<Link2 className="h-4 w-4" />}
                  label="References"
                  value={results.metadata.hasReferences ? "Yes" : "No"}
                  status={results.metadata.hasReferences}
                />
                <MetadataItem
                  icon={<Code className="h-4 w-4" />}
                  label="Schema Markup"
                  value={results.metadata.hasSchema ? "Yes" : "No"}
                  status={results.metadata.hasSchema}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard title="Overall Score" score={results.overallScore} description="Combined analysis of all factors" />
        <ScoreCard title="EEAT Score" score={results.eeatScore} description="Experience, Expertise, Authority, Trust" />
        <ScoreCard
          title="Helpful Content"
          score={results.helpfulContentScore}
          description="Alignment with helpful content guidelines"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyzed URL</CardTitle>
          <CardDescription>The webpage that was analyzed</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={results.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {results.url}
          </a>
        </CardContent>
      </Card>

      <Tabs defaultValue="eeat">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eeat">EEAT Analysis</TabsTrigger>
          <TabsTrigger value="helpful">Helpful Content</TabsTrigger>
          <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="eeat">
          <AnalysisTab
            strengths={results.eeatAnalysis.strengths}
            weaknesses={results.eeatAnalysis.weaknesses}
            recommendations={results.eeatAnalysis.recommendations}
          />
        </TabsContent>

        <TabsContent value="helpful">
          <AnalysisTab
            strengths={results.helpfulContentAnalysis.strengths}
            weaknesses={results.helpfulContentAnalysis.weaknesses}
            recommendations={results.helpfulContentAnalysis.recommendations}
          />
        </TabsContent>

        <TabsContent value="visual">
          <AnalysisTab
            strengths={results.visualAnalysis.strengths}
            weaknesses={results.visualAnalysis.weaknesses}
            recommendations={results.visualAnalysis.recommendations}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetadataItem({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode
  label: string
  value: string
  status?: boolean
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="text-sm">{value}</span>
        {status !== undefined &&
          (status ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-amber-500" />
          ))}
      </div>
    </div>
  )
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string
  score: number
  description: string
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2 flex items-center gap-2">
          <span className={getScoreColor(score)}>{score}/100</span>
        </div>
        <Progress value={score} className="h-2" />
      </CardContent>
    </Card>
  )
}

function AnalysisTab({
  strengths,
  weaknesses,
  recommendations,
}: {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}) {
  return (
    <div className="space-y-6 mt-4">
      <AnalysisSection
        title="Strengths"
        items={strengths}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        badgeText="Strength"
        badgeVariant="success"
      />

      <AnalysisSection
        title="Areas for Improvement"
        items={weaknesses}
        icon={<AlertCircle className="h-5 w-5 text-red-500" />}
        badgeText="Weakness"
        badgeVariant="destructive"
      />

      <AnalysisSection
        title="Recommendations"
        items={recommendations}
        icon={<Info className="h-5 w-5 text-blue-500" />}
        badgeText="Action Item"
        badgeVariant="outline"
      />
    </div>
  )
}

function AnalysisSection({
  title,
  items,
  icon,
  badgeText,
  badgeVariant,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
  badgeText: string
  badgeVariant: "outline" | "secondary" | "destructive" | "success"
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">{icon}</div>
              <div>
                <Badge variant={badgeVariant as any} className="mb-2">
                  {badgeText}
                </Badge>
                <p>{item}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}


'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { bulkUploadQuestions } from '@/app/actions/bulk-upload'

interface BulkUploadDialogProps {
  mockTestId: string
  onUploadComplete?: () => void
}

export function BulkUploadDialog({ mockTestId, onUploadComplete }: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [uploadedCount, setUploadedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const headers = [
      'question_text',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_option',
      'marks',
      'negative_marks',
      'explanation',
    ]

    const sampleData = [
      [
        'What is the capital of France?',
        'London',
        'Berlin',
        'Paris',
        'Madrid',
        'C',
        '1',
        '0',
        'The capital of France is Paris.',
      ],
      [
        'What is 2 + 2?',
        '3',
        '4',
        '5',
        '6',
        'B',
        '1',
        '0',
        'Basic arithmetic: 2 + 2 = 4',
      ],
    ]

    const csv = [headers, ...sampleData].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setStatus('error')
      setMessage('Please upload a valid CSV or Excel file')
      return
    }

    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const buffer = await file.arrayBuffer()
      const result = await bulkUploadQuestions(buffer, mockTestId)

      setStatus('success')
      setMessage(result.message)
      setUploadedCount(result.uploadedCount)

      if (onUploadComplete) {
        onUploadComplete()
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
        setMessage('')
        setUploadedCount(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
          <DialogDescription>
            Upload multiple questions from a CSV or Excel file. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div>
            <Button onClick={downloadTemplate} variant="secondary" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Input */}
          <div>
            <Label htmlFor="file-upload">Select File</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV or Excel files only</p>
                </div>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-3 flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                {message} ({uploadedCount} questions)
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{message}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>question_text: The question (required)</li>
              <li>option_a, option_b, option_c, option_d: Answer options (required)</li>
              <li>correct_option: A/B/C/D (required)</li>
              <li>marks: Points for correct answer (optional, default: 1)</li>
              <li>negative_marks: Penalty for wrong answer (optional, default: 0)</li>
              <li>explanation: Answer explanation (optional)</li>
            </ul>
          </div>

          {/* Upload Button */}
          <Button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Select and Upload File
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

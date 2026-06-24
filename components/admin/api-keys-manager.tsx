"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Eye, EyeOff, Plus } from "lucide-react"
import { addApiKey, deleteApiKey, listApiKeys } from "@/app/actions/api-keys"
import { toast } from "sonner"

interface ApiKey {
  id: number
  provider: string
  key_name: string
  is_active: boolean
  created_at: string
}

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [provider, setProvider] = useState("")
  const [keyName, setKeyName] = useState("")
  const [keyValue, setKeyValue] = useState("")

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      const keys = await listApiKeys()
      setApiKeys(keys)
    } catch (error) {
      toast.error("Failed to load API keys")
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider || !keyName || !keyValue) {
      toast.error("Please fill all fields")
      return
    }

    try {
      setAdding(true)
      await addApiKey(provider, keyName, keyValue)
      toast.success("API key added successfully")
      setProvider("")
      setKeyName("")
      setKeyValue("")
      setShowDialog(false)
      await loadApiKeys()
    } catch (error) {
      toast.error("Failed to add API key")
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      await deleteApiKey(id)
      toast.success("API key deleted")
      await loadApiKeys()
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys Management</CardTitle>
            <CardDescription>Securely store and manage your AI service API keys</CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
                <DialogDescription>Add a new API key for AI services</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddKey} className="space-y-4">
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={provider} onValueChange={(value: string | null) => { if (value) setProvider(value) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (GPT-4, GPT-4o Mini)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="cohere">Cohere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Main Key, Test Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="keyValue">API Key</Label>
                  <Input
                    id="keyValue"
                    type="password"
                    placeholder="Paste your API key here"
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adding}>
                    {adding ? "Adding..." : "Add Key"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API keys configured yet. Add one to enable AI features.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Key Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.provider}</TableCell>
                    <TableCell>{key.key_name}</TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

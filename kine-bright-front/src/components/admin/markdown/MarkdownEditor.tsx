import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MarkdownEditor = ({ value, onChange, className, placeholder }: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState("write");

  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1 p-1 bg-muted rounded-md mb-2">
        <Button variant="ghost" size="sm" onClick={() => insertText('**', '**')} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('*', '*')} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertText('# ')} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('## ')} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertText('- ')} title="List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('1. ')} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('> ')} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertText('[', '](url)')} title="Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('![alt text](', ')')} title="Image">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertText('```\n', '\n```')} title="Code Block">
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Écrire</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Écrivez votre article en Markdown..."}
            className="min-h-[400px] font-mono"
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <Card>
            <CardContent className="p-6 min-h-[400px] prose prose-slate max-w-none dark:prose-invert">
              <Markdown remarkPlugins={[remarkGfm]}>
                {value || "*Rien à afficher*"}
              </Markdown>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarkdownEditor;

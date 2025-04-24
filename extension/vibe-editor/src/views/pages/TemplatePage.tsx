import React, { useEffect, useState } from 'react'

import { CreatePrompt, Prompt, Template } from '../../types/template'
import { Message } from '../../types/webview'
import { PromptForm, PromptSelector } from '../components'

interface TemplatePageProps {
  postMessageToExtension: (message: Message) => void
}

export function TemplatePage({ postMessageToExtension }: TemplatePageProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  )
  const [selectedPromptId, setSelectedPromptId] = useState<number>(0)

  useEffect(() => {
    postMessageToExtension({ type: 'WEBVIEW_READY' })
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'TEMPLATE_SELECTED') {
        setSelectedTemplate(message.payload.template)
      } else if (message.type === 'GET_TEMPLATES') {
        postMessageToExtension({ type: 'GET_TEMPLATES' })
      } else if (message.type === 'GET_SNAPSHOTS') {
        postMessageToExtension({ type: 'GET_SNAPSHOTS' })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [postMessageToExtension])

  const onSubmit = (data: CreatePrompt) => {
    postMessageToExtension({
      type: 'SUBMIT_PROMPT',
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }
  return (
    <div className="app-container">
      <h1>프롬프트 생성기</h1>
      <PromptSelector
        selectedTemplate={selectedTemplate}
        selectedPromptId={selectedPromptId}
        selectPromptId={(promptId: number) => setSelectedPromptId(promptId)}
      />
      {selectedTemplate && selectedTemplate.prompts && (
        <PromptForm
          defaultPrompt={selectedTemplate.prompts[selectedPromptId]}
          onSubmit={onSubmit}
          localSnapshots={selectedTemplate.snapshots || []}
        />
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'

import { CreatePrompt, Template } from '../../types/template'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PromptForm, PromptSelector } from '../components'

export function TemplatePage({ postMessageToExtension }: WebviewPageProps) {
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

  const submitPrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.SUBMIT_PROMPT,
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }
  const updatePrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.UPDATE_PROMPT,
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const createPrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.CREATE_PROMPT,
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const deletePrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.DELETE_PROMPT,
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }
  return (
    <div className="app-container flex flex-col gap-8">
      <h1>프롬프트 생성기 {selectedTemplate?.templateId}</h1>
      <PromptSelector
        selectedTemplate={selectedTemplate}
        selectedPromptId={selectedPromptId}
        selectPromptId={(promptId: number) => setSelectedPromptId(promptId)}
      />
      {selectedTemplate && selectedTemplate.prompts && (
        <PromptForm
          defaultPrompt={selectedTemplate.prompts[selectedPromptId]}
          submitPrompt={submitPrompt}
          updatePrompt={updatePrompt}
          createPrompt={createPrompt}
          localSnapshots={selectedTemplate.snapshots || []}
        />
      )}
    </div>
  )
}

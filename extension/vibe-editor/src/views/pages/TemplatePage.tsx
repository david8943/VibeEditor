import React, { useEffect, useRef, useState } from 'react'

import { sampleOptionList } from '../../constants/sampleData'
import { Database } from '../../types/database'
import { CreatePrompt, Prompt, Template } from '../../types/template'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PromptForm, PromptSelector } from '../components'
import { DBSelector } from '../components'
import { DatabaseModal } from '../components/database/DatabaseModal'

export function TemplatePage({ postMessageToExtension }: WebviewPageProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  )
  const [selectedPromptId, setSelectedPromptId] = useState<number>(0)
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    postMessageToExtension({ type: MessageType.GET_TEMPLATES })
    const handleMessage = (event: MessageEvent) => {
      console.log('handleMessage 템플릿 페이지 안에 있음', event)
      const message = event.data
      if (message.type === MessageType.TEMPLATE_SELECTED) {
        console.log('TEMPLATE_SELECTED', message.payload.template)
        setSelectedTemplate(message.payload.template)
      } else if (message.type === MessageType.GET_TEMPLATES) {
        console.log('GET_TEMPLATES')
        postMessageToExtension({ type: MessageType.GET_TEMPLATES })
      } else if (message.type === MessageType.GET_SNAPSHOTS) {
        console.log('GET_SNAPSHOTS')
        postMessageToExtension({ type: MessageType.GET_SNAPSHOTS })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const submitPrompt = (data: Prompt) => {
    postMessageToExtension({
      type: MessageType.SUBMIT_PROMPT,
      payload: {
        prompt: data,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }
  const updatePrompt = (data: Prompt) => {
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

  const selectPrompt = (promptId: number) => {
    setSelectedPromptId(promptId)
    postMessageToExtension({
      type: MessageType.PROMPT_SELECTED,
      payload: {
        selectedPromptId: promptId,
      },
    })
  }

  const deletePrompt = (data: CreatePrompt) => {
    if (selectedTemplate) {
      postMessageToExtension({
        type: MessageType.DELETE_PROMPT,
        payload: {
          templateId: selectedTemplate.templateId,
          template: selectedTemplate,
        },
      })
    }
  }

  const saveDatabase = (database: Database) => {
    console.log('saveDatabase', database)

    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })
  }
  const getDatabases = () => {
    postMessageToExtension({
      type: MessageType.GET_DATABASE,
      payload: null,
    })
  }
  const deleteSnapshot = (attachId: number) => {
    console.log('deleteSnapshot', attachId)
    postMessageToExtension({
      type: MessageType.DELETE_SNAPSHOT,
      payload: {
        attachId,
        selectedPromptId,
        selectedTemplateId: selectedTemplate?.templateId,
      },
    })
  }
  const [selectedDbUid, setSelectedDbUid] = useState('')
  const [showDbModal, setShowDbModal] = useState(false)

  useEffect(() => {
    console.log('useEffect selectedPromptId', selectedPromptId)
    if (selectedTemplate?.prompts) {
      setSelectedPrompt(
        selectedTemplate.prompts.find(
          (prompt) => prompt.promptId === selectedPromptId,
        ) || null,
      )
    }
    console.log('useEffect selectedPrompt', selectedPrompt)
  }, [selectedPromptId, selectedTemplate])
  return (
    <div className="app-container flex flex-col gap-8">
      <h1>프롬프트 생성기 templateId: {selectedTemplate?.templateId}</h1>
      <h1>프롬프트 생성기 promptId: {selectedPromptId}</h1>

      <DBSelector
        selectedId={selectedDbUid}
        onChange={setSelectedDbUid}
        getDatabases={getDatabases}
        onAddClick={() => setShowDbModal(true)}
      />

      {showDbModal && (
        <DatabaseModal
          saveDatabase={saveDatabase}
          onClose={() => setShowDbModal(false)}
        />
      )}

      <PromptSelector
        selectedTemplate={selectedTemplate}
        selectedPromptId={selectedPromptId}
        selectPromptId={selectPrompt}
      />
      {selectedTemplate && selectedPrompt && (
        <PromptForm
          defaultPrompt={selectedPrompt}
          selectedPromptId={selectedPromptId}
          submitPrompt={submitPrompt}
          updatePrompt={updatePrompt}
          createPrompt={createPrompt}
          deleteSnapshot={deleteSnapshot}
          localSnapshots={selectedTemplate.snapshots || []}
          optionList={sampleOptionList}
        />
      )}
    </div>
  )
}

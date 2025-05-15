import React, { useEffect, useRef, useState } from 'react'
import { DotLoader } from 'react-spinners'

import { AIAPIKey } from '../../types/ai'
import { CreateDatabase } from '../../types/database'
import {
  CreatePrompt,
  Option,
  PostType,
  Prompt,
  PromptAttach,
  SubmitPrompt,
  Template,
} from '../../types/template'
import { MessageType, WebviewPageProps } from '../../types/webview'
import { PromptForm, PromptSelector } from '../components'
import { DBSelector } from '../components'
import { DatabaseModal } from '../components/database/DatabaseModal'
import { CreatePromptForm } from '../components/template/CreatePromptForm'

export function TemplatePage({ postMessageToExtension }: WebviewPageProps) {
  const [loading, setLoading] = useState(false)
  const [optionList, setOptionList] = useState<Option[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  )
  const [selectedPromptId, setSelectedPromptId] = useState<number>(0)
  const [createPromptData, setCreatePromptData] = useState<CreatePrompt>({
    parentPromptId: null,
    templateId: 0,
    promptName: '기본 프롬프트',
    postType: PostType.TROUBLE_SHOOTING,
    comment: '합리적 의심',
    promptAttachList: [],
    promptOptionList: [],
    notionDatabaseId: 0,
    userAIProviderId: null,
  })
  const [notionDatabaseId, setNotionDatabaseId] = useState(0)
  const [showDbModal, setShowDbModal] = useState(false)

  const [defaultPostType, setDefaultPostType] = useState<
    'TECH_CONCEPT' | 'TROUBLE_SHOOTING'
  >('TECH_CONCEPT')
  const [defaultPromptOptionIds, setDefaultPromptOptionIds] = useState<
    number[]
  >([])
  const [defaultNotionDatabaseId, setDefaultNotionDatabaseId] = useState(0)

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    postMessageToExtension({ type: MessageType.GET_TEMPLATE })
    postMessageToExtension({ type: MessageType.GET_OPTIONS })
    postMessageToExtension({ type: MessageType.GET_CONFIG })
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === MessageType.TEMPLATE_SELECTED) {
        setSelectedTemplate(message.payload.template)
      } else if (message.type === MessageType.OPTIONS_LOADED) {
        setOptionList(message.payload)
      } else if (message.type === MessageType.START_LOADING) {
        setLoading(true)
      } else if (message.type === MessageType.STOP_LOADING) {
        setLoading(false)
      } else if (message.type === MessageType.PROMPT_SELECTED) {
        console.log('PROMPT_SELECTED', message.payload.prompt)
        if (message.payload.prompt) {
          setSelectedPrompt(message.payload.prompt)
          setSelectedPromptId(message.payload.prompt.promptId)
          setNotionDatabaseId(message.payload.prompt.notionDatabaseId)
        }
      } else if (message.type === MessageType.SNAPSHOT_SELECTED) {
        addSnapshotCode(message.payload.snapshot)
      } else if (message.type === MessageType.CONFIG_LOADED) {
        const config = message.payload
        console.log('config', config)
        setDefaultPostType(config.defaultPostType)
        setDefaultPromptOptionIds(config.defaultPromptOptionIds)
        setDefaultNotionDatabaseId(config.defaultNotionDatabaseId ?? 0)
      } else if (message.type === MessageType.NAVIGATE) {
        postMessageToExtension({ type: MessageType.GET_TEMPLATE })
        postMessageToExtension({ type: MessageType.GET_OPTIONS })
        postMessageToExtension({ type: MessageType.GET_PROMPT })
      } else if (message.type === MessageType.RESET_CREATE_PROMPT) {
        resetCreatePrompt()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const resetCreatePrompt = () => {
    setCreatePromptData({
      parentPromptId: null,
      templateId: selectedPromptId,
      promptName: '새 프롬프트 생성하기',
      postType: defaultPostType,
      comment: '',
      promptAttachList: [],
      promptOptionList: defaultPromptOptionIds,
      notionDatabaseId: notionDatabaseId,
      userAIProviderId: null,
    })
  }
  const generatePost = (selectedPromptId: number) => {
    postMessageToExtension({
      type: MessageType.GENERATE_POST,
      payload: {
        templateId: selectedPrompt?.templateId,
        promptId: selectedPromptId,
      },
    })
  }

  const addSnapshotCode = (data: PromptAttach) => {
    console.log('addSnapshotCode', data)
    console.log('selectedPromptId', selectedPromptId)
    if (selectedPromptId == 0) {
      setCreatePromptData((currentPrompt) => {
        if (!currentPrompt) return currentPrompt
        return {
          ...currentPrompt,
          promptAttachList: [...currentPrompt.promptAttachList, data],
        }
      })
    }
    setSelectedPrompt((currentPrompt) => {
      console.log('setSelectedPrompt 내부 currentPrompt:', currentPrompt)
      if (!currentPrompt) return currentPrompt
      const updatedPrompt = {
        ...currentPrompt,
        promptAttachList: [...currentPrompt.promptAttachList, data],
      }
      console.log('업데이트된 prompt:', updatedPrompt)
      return updatedPrompt
    })
  }

  const submitPrompt = (data: SubmitPrompt) => {
    const prompt = { ...data, notionDatabaseId }
    postMessageToExtension({
      type: MessageType.SUBMIT_PROMPT,
      payload: {
        prompt: prompt,
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const createPrompt = (data: CreatePrompt) => {
    postMessageToExtension({
      type: MessageType.CREATE_PROMPT,
      payload: {
        prompt: {
          ...data,
          templateId: selectedTemplate?.templateId,
          notionDatabaseId,
        },
        selectedTemplateId: selectedTemplate?.templateId,
        selectedPromptId: selectedPromptId,
      },
    })
  }

  const selectPromptId = (promptId: number) => {
    setSelectedPromptId(promptId)
    postMessageToExtension({
      type: MessageType.PROMPT_SELECTED,
      payload: {
        promptId: promptId,
        templateId: selectedTemplate?.templateId,
      },
    })
  }

  const deletePrompt = (data: CreatePrompt) => {
    if (selectedTemplate) {
      postMessageToExtension({
        type: MessageType.DELETE_PROMPT,
        payload: {
          templateId: selectedTemplate.templateId,
          promptId: selectedPromptId,
        },
      })
    }
  }

  const saveDatabase = (database: CreateDatabase) => {
    postMessageToExtension({
      type: MessageType.SAVE_DATABASE,
      payload: database,
    })
  }

  const getDatabases = () =>
    postMessageToExtension({
      type: MessageType.GET_DATABASE,
      payload: null,
    })

  const getAIProviders = () =>
    postMessageToExtension({
      type: MessageType.GET_AI_PROVIDERS,
    })

  const saveAIProvider = (aiProvider: AIAPIKey) =>
    postMessageToExtension({
      type: MessageType.SAVE_AI_PROVIDER,
      payload: aiProvider,
    })

  const deleteSnapshot = (attachId: number) => {
    postMessageToExtension({
      type: MessageType.DELETE_SNAPSHOT,
      payload: {
        attachId,
        selectedPromptId,
        selectedTemplateId: selectedTemplate?.templateId,
      },
    })
  }

  useEffect(() => {
    resetCreatePrompt()
  }, [
    selectedTemplate,
    defaultPostType,
    defaultPromptOptionIds,
    defaultNotionDatabaseId,
  ])

  useEffect(() => {
    if (selectedPromptId == 0) {
      setNotionDatabaseId(defaultNotionDatabaseId)
    }
  }, [defaultNotionDatabaseId])

  return (
    <div className="app-container flex flex-col gap-8">
      <h1>
        {selectedTemplate?.templateName}의 템플릿 promptId: {selectedPromptId}
      </h1>
      <h1>
        templateId:
        {selectedTemplate?.templateId}
      </h1>

      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <DotLoader color="var(--vscode-button-background)" />
        </div>
      )}

      <div className="flex flex-col gap-8">
        <PromptSelector
          selectedTemplate={selectedTemplate}
          selectedPromptId={selectedPromptId}
          selectPromptId={selectPromptId}
        />
        <DBSelector
          selectedId={notionDatabaseId}
          onChange={setNotionDatabaseId}
          getDatabases={getDatabases}
          onAddClick={() => setShowDbModal(true)}
        />

        {showDbModal && (
          <DatabaseModal
            saveDatabase={saveDatabase}
            onClose={() => setShowDbModal(false)}
          />
        )}

        {selectedTemplate && selectedPrompt && (
          <PromptForm
            defaultPrompt={selectedPrompt}
            selectedPromptId={selectedPromptId}
            generatePost={generatePost}
            submitPrompt={submitPrompt}
            deleteSnapshot={deleteSnapshot}
            localSnapshots={selectedTemplate.snapshotList || []}
            optionList={optionList}
            defaultPromptOptionIds={defaultPromptOptionIds}
            defaultPostType={defaultPostType}
            saveDatabase={saveDatabase}
            getDatabases={getDatabases}
            getAIProviders={getAIProviders}
            saveAIProvider={saveAIProvider}
          />
        )}

        {selectedTemplate && selectedPromptId == 0 && (
          <CreatePromptForm
            defaultPrompt={createPromptData}
            selectedPromptId={selectedPromptId}
            createPrompt={createPrompt}
            deleteSnapshot={deleteSnapshot}
            localSnapshots={selectedTemplate.snapshotList || []}
            optionList={optionList}
            defaultPromptOptionIds={defaultPromptOptionIds}
            defaultPostType={defaultPostType}
            saveDatabase={saveDatabase}
            getDatabases={getDatabases}
            getAIProviders={getAIProviders}
            saveAIProvider={saveAIProvider}
          />
        )}
      </div>
    </div>
  )
}

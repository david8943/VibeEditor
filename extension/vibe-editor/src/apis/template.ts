import { Template, UpdateTemplateRequest } from '../types/template'
import {
  deleteBooleanRequest,
  getRequest,
  postBooleanRequest,
  putRequest,
} from './api'

export const getTemplateDetail = async (templateId: number) =>
  await getRequest<Template>(`/template/${templateId}`)

export const updateTemplate = async ({
  templateId,
  templateName,
}: UpdateTemplateRequest) =>
  await putRequest<Template[]>(`/template/${templateId}`, {
    templateName,
  })

export const removeTemplate = async (templateId: number) =>
  await deleteBooleanRequest(`/template/${templateId}`)

export const getTemplateList = async () =>
  await getRequest<Template[]>(`/template`)

export const addTemplate = async (templateName: string) =>
  await postBooleanRequest(`/template`, { templateName })

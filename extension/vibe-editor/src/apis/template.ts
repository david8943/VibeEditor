import { Template } from '../types/template'
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postBooleanRequest,
  postRequest,
} from './api'

// getTemplateDetail
// updateTemplate
// deleteTemplate
export const getTemplateList = async () =>
  await getRequest<Template[]>(`/template`)

export const addTemplate = async (templateName: string) =>
  await postBooleanRequest(`/template`, { templateName })

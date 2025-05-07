import { User } from '../types/user'
import { getRequest } from './api'

export const getCurrentUser = async () => await getRequest<User>('/user')

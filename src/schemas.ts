export interface IPasswordBody {
  password: string
}

export const passwordBodySchema = {
  type: 'object',
  properties: {
    password: { type: 'string' }
  }
}

export interface IUpdatePasswordBody {
  password: string,
  newPassword: string
}

export const updatePasswordBodySchema = {
  type: 'object',
  properties: {
    password: { type: 'string' },
    newPassword: { type: 'string' }
  }
}

export interface INameUri {
  name: string
}

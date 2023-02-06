export interface IPasswordBody {
  password: string
}

export const passwordBodySchema = {
  type: 'object',
  properties: {
    password: { type: 'string' }
  }
}

export interface IPutPassword {
  password: string,
  newPassword: string
}

export const putPasswordSchema = {
  type: 'object',
  properties: {
    password: { type: 'string' },
    newPassword: { type: 'string' }
  }
}

export interface INameUrl {
  name: string
}

export interface IPostUser {
  name: string
}

export const postUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' }
  }
}

export interface IPutFirstPassword {
  firstPasswordToken: string,
  password: string
}

export const putFirstPasswordSchema = {
  type: 'object',
  properties: {
    firstPasswordToken: { type: 'string' },
    password: { type: 'string' }
  }
}

export interface IGetToken {
  password: string
}

export const getTokenSchema = {
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

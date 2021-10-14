declare global {
  namespace NodeJs {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: 'development' | 'production'
      SMS_SID: string
      SMS_AUTH_TOKEN: string
    }
  }
}

export {}

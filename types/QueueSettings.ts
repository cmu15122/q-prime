export type QueueSettings = {
  adminSettings: {
    currSem: string,
    slackURL: string | undefined,
    questionsURL: string | undefined,
    rejoinTime: number
  },
  settings: any,
}

export type QueueSettings = {
  currSem: string,
  slackURL: string | undefined,
  questionsURL: string | undefined,
  rejoinTime: number,

  // user specific settings
  videoChatEnabled: boolean,
  videoChatURL: string
}

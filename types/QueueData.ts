export type QueueData = {
  // most important global data
  title: string,
  uninitializedSem: boolean,
  queueFrozen: boolean,

  // user state
  isOwner: boolean,
  isAuthenticated: boolean,
  isTA: boolean,
  isAdmin: boolean,
  andrewID: string,
  preferred_name: string,

  // global stats
  numStudents: number
  rejoinTime: number,
  waitTime: number,
  numUnhelped: number,
  minsPerStudent: number,
  numTAs: number,

  // queue data
  announcements: {
    id: number,
    content: string
  }[],

  topics: {
    assignment_id: number,
    name: string,
    category: string,
    start_date: string,
    end_date: string,
  }[],
  locations: {
    dayDictionary: any,
    roomDictionary: any
  },

  tas: {
    ta_id: number,
    name: string,
    preferred_name: string,
    email: string,
    isAdmin: boolean,
  }[],
}

/**
 * Type of a queue user's data, where users means all TAs and students
 */
export type UserData = {
    // user state
    isOwner: boolean,
    isAuthenticated: boolean,
    isTA: boolean,
    isAdmin: boolean,
    andrewID: string,
    preferredName: string,

    taSettings?: {
        // user specific settings
        videoChatEnabled: boolean,
        videoChatURL: string
        joinNotifsEnabled: boolean,
        remindNotifsEnabled: boolean,
        remindTime: number
    }
}

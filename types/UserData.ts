export type UserData = {
    // user state
    isOwner: boolean,
    isAuthenticated: boolean,
    isTA: boolean,
    isAdmin: boolean,
    andrewID: string,
    preferred_name: string,

    taSettings?: {
        // user specific settings
        videoChatEnabled: boolean,
        videoChatURL: string
        joinNotifsEnabled: boolean,
        remindNotifsEnabled: boolean,
        remindTime: number
    }
}

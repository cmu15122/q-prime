export type StudentData = {
    name: string,
    andrewID: string,
    taID: number,
    taAndrewID: string,
    taPrefName: string,
    location: string,
    topic: {
        assignment_id: number,
        name: string,
    },
    question: string,
    isFrozen: boolean,
    message: string,
    messageBuffer: string[],
    status: number,
    position: number,
}

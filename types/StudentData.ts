export type StudentData = {
    name: string,
    andrewID: string,
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
    helpingTAInfo?: {
        taId: number,
        taAndrewID: string,
        taName: string,

        taZoomEnabled: boolean,
        taZoomUrl: string,
    }
}

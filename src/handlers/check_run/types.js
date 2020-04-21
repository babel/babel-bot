export type CheckRunPayload = {
    action: "completed" | "created" | "requested_action" | "rerequested",
    check_run: {
        id: number,
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "timed_out" | "action_required" | "stale" | null,
        name: string,
        output: {
          summary: string
        }
    },
}

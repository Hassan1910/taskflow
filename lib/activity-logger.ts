import { prisma } from "./prisma"

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "moved"
  | "assigned"
  | "unassigned"
  | "completed"
  | "commented"
  | "attached"
  | "member_added"
  | "member_removed"
  | "role_changed"

export type EntityType = "project" | "board" | "task" | "comment" | "attachment"

interface LogActivityParams {
  type: ActivityType
  entity: EntityType
  entityId: string
  userId: string
  projectId: string
  details?: string
}

/**
 * Log an activity to the activity feed
 */
export async function logActivity({
  type,
  entity,
  entityId,
  userId,
  projectId,
  details,
}: LogActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        type,
        entity,
        entityId,
        userId,
        projectId,
        details,
      },
    })
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break the main flow
    console.error("Failed to log activity:", error)
  }
}

/**
 * Generate human-readable activity message
 */
export function getActivityMessage(activity: {
  type: string
  entity: string
  user: { name: string | null }
  details?: string | null
}): string {
  const userName = activity.user.name || "Someone"
  const entity = activity.entity

  switch (activity.type) {
    case "created":
      return `${userName} created a ${entity}`
    case "updated":
      return `${userName} updated a ${entity}`
    case "deleted":
      return `${userName} deleted a ${entity}`
    case "moved":
      return `${userName} moved a ${entity}${activity.details ? ` ${activity.details}` : ""}`
    case "assigned":
      return `${userName} assigned a ${entity}`
    case "unassigned":
      return `${userName} unassigned a ${entity}`
    case "completed":
      return `${userName} completed a ${entity}`
    case "commented":
      return `${userName} commented on a ${entity}`
    case "attached":
      return `${userName} attached a file to a ${entity}`
    case "member_added":
      return `${userName} added a member to the project`
    case "member_removed":
      return `${userName} removed a member from the project`
    case "role_changed":
      return `${userName} changed a member's role`
    default:
      return `${userName} performed an action on a ${entity}`
  }
}

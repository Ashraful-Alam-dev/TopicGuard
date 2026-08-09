"use client"

import * as React from "react"
import { Loader2, Users, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAvailableTopicMembers } from "@/lib/hooks/use-topics"
import type { TopicMember } from "@/lib/types"

interface TopicMemberPickerProps {
  submissionId: string
  selected: TopicMember[]
  onChange: (members: TopicMember[]) => void
  disabled?: boolean
}

export function TopicMemberPicker({
  submissionId,
  selected,
  onChange,
  disabled,
}: TopicMemberPickerProps) {
  const {
    data: availableMembers,
    isLoading,
    isError,
  } = useAvailableTopicMembers(submissionId)

  /*
   * Members removed during the current editing session.
   *
   * The backend still considers them attached to the saved topic until
   * the leader saves the changes, so they won't appear in the backend
   * available-members response.
   *
   * This local list makes them immediately selectable again.
   */
  const [releasedMembers, setReleasedMembers] = React.useState<
    TopicMember[]
  >([])

  /*
   * Backend-available members
   * +
   * currently selected members
   * +
   * locally released members
   */
  const options = React.useMemo(() => {
    const byId = new Map<string, TopicMember>()

    for (const member of availableMembers ?? []) {
      byId.set(member.id, member)
    }

    for (const member of selected) {
      byId.set(member.id, member)
    }

    for (const member of releasedMembers) {
      byId.set(member.id, member)
    }

    return Array.from(byId.values())
  }, [availableMembers, selected, releasedMembers])

  function toggle(member: TopicMember, checked: boolean) {
    if (checked) {
      onChange([...selected, member])

      /*
       * The member was selected again, so they no longer need
       * to be kept in the locally released list.
       */
      setReleasedMembers((current) =>
        current.filter((m) => m.id !== member.id),
      )

      return
    }

    /*
     * Remove from selected members.
     */
    onChange(
      selected.filter(
        (m) => m.id !== member.id,
      ),
    )

    /*
     * Keep the removed member available in the dropdown
     * for the rest of this editing session.
     */
    setReleasedMembers((current) => {
      if (current.some((m) => m.id === member.id)) {
        return current
      }

      return [...current, member]
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1.5">
        <Label>Team Members (Optional)</Label>

        <p className="text-xs text-muted-foreground">
          Add members to your topic. Selected students become team
          members immediately — no invitation needed.
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              disabled={disabled || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Users className="mr-2 size-4" />
              )}

              Select team members
            </Button>
          }
        />

        <DropdownMenuContent
          align="start"
          className="w-72"
        >
          <DropdownMenuLabel>
            Classmates available
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {isError && (
            <p className="px-1.5 py-1.5 text-xs text-destructive">
              Couldn&apos;t load available students.
            </p>
          )}

          {!isError &&
            !isLoading &&
            options.length === 0 && (
              <p className="px-1.5 py-1.5 text-xs text-muted-foreground">
                No students available to add right now.
              </p>
            )}

          {options.map((member) => {
            const checked = selected.some(
              (m) => m.id === member.id,
            )

            return (
              <DropdownMenuCheckboxItem
                key={member.id}
                checked={checked}
                onCheckedChange={(value) =>
                  toggle(member, !!value)
                }
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">
                    {member.name}
                  </span>

                  <span className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="gap-1"
            >
              {member.name}

              <button
                type="button"
                onClick={() =>
                  toggle(member, false)
                }
                disabled={disabled}
                className="ml-0.5 rounded-full hover:text-destructive"
                aria-label={`Remove ${member.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

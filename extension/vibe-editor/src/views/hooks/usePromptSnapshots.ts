import { useCallback, useEffect, useMemo, useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { EditPrompt, EditSnapshot } from '@/types/template'
import { PromptAttach } from '@/types/template'

import { Snapshot } from '../../types/snapshot'

interface UsePromptSnapshotsProps {
  localSnapshots: Snapshot[]
  promptAttachList: PromptAttach[]
  deleteSnapshot: (snapshotId: number) => void
  setValue: UseFormSetValue<EditPrompt>
}

interface UsePromptSnapshotsReturn {
  snapshots: EditSnapshot[]
  handleDeleteSnapshot: (attachId: number | null) => void
  handleDescriptionChange: (attachId: number | null, value: string) => void
  addSnapshot: (newSnapshot: PromptAttach) => void
}

export const usePromptSnapshots = ({
  localSnapshots,
  promptAttachList,
  deleteSnapshot,
  setValue,
}: UsePromptSnapshotsProps): UsePromptSnapshotsReturn => {
  const [internalSnapshots, setInternalSnapshots] = useState<EditSnapshot[]>([])

  useEffect(() => {
    if (!promptAttachList) return
    setInternalSnapshots((prev) => {
      // 기존 스냅샷 중 promptAttachList에 없는 것들은 유지
      const existingSnapshots = prev.filter((snapshot) =>
        promptAttachList.some(
          (attach) => attach.attachId === snapshot.attachId,
        ),
      )

      // 새로운 스냅샷만 추가
      const newSnapshots = promptAttachList
        .filter(
          (attach) =>
            !prev.some((snapshot) => snapshot.attachId === attach.attachId),
        )
        .map((snapshot) => {
          const localSnapshot = localSnapshots.find(
            (localSnapshot) => localSnapshot.snapshotId === snapshot.snapshotId,
          )
          return {
            attachId: snapshot.attachId,
            snapshotId: snapshot.snapshotId,
            snapshotContent: localSnapshot?.snapshotContent ?? '',
            description: snapshot.description,
            snapshotName: localSnapshot?.snapshotName ?? '',
          }
        })

      return [...existingSnapshots, ...newSnapshots]
    })
  }, [localSnapshots, promptAttachList])

  useEffect(() => {
    setValue('snapshots', internalSnapshots)
  }, [internalSnapshots, setValue])

  const handleDeleteSnapshot = useCallback(
    (attachId: number | null) => {
      if (attachId === null) return
      deleteSnapshot(attachId)
      setInternalSnapshots((prev) =>
        prev.filter((snapshot) => snapshot.attachId !== attachId),
      )
    },
    [deleteSnapshot],
  )

  const handleDescriptionChange = useCallback(
    (attachId: number | null, value: string) => {
      if (attachId === null) return
      setInternalSnapshots((prev) =>
        prev.map((snapshot) =>
          snapshot.attachId === attachId
            ? { ...snapshot, description: value }
            : snapshot,
        ),
      )
    },
    [],
  )

  const addSnapshot = useCallback(
    (newSnapshot: PromptAttach) => {
      const localSnapshot = localSnapshots.find(
        (localSnapshot) => localSnapshot.snapshotId === newSnapshot.snapshotId,
      )
      setInternalSnapshots((prev) => [
        ...prev,
        {
          attachId: newSnapshot.attachId,
          snapshotId: newSnapshot.snapshotId,
          description: newSnapshot.description,
          snapshotContent: localSnapshot?.snapshotContent ?? '',
          snapshotName: localSnapshot?.snapshotName ?? '',
        },
      ])
    },
    [localSnapshots],
  )

  return {
    snapshots: internalSnapshots,
    handleDeleteSnapshot,
    handleDescriptionChange,
    addSnapshot,
  }
}

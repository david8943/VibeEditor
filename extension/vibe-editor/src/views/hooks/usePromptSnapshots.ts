import { useCallback, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { EditPrompt, EditSnapshot } from '@/types/template'

import { Snapshot } from '../../types/snapshot'

interface UsePromptSnapshotsProps {
  localSnapshots: Snapshot[]
  promptAttachList: {
    attachId: number
    snapshotId: number
    description: string
  }[]
  deleteSnapshot: (snapshotId: number) => void
  setValue: UseFormSetValue<EditPrompt>
}

interface UsePromptSnapshotsReturn {
  snapshots: EditSnapshot[]
  handleDeleteSnapshot: (attachId: number) => void
  handleDescriptionChange: (attachId: number, value: string) => void
}

export const usePromptSnapshots = ({
  localSnapshots,
  promptAttachList,
  deleteSnapshot,
  setValue,
}: UsePromptSnapshotsProps): UsePromptSnapshotsReturn => {
  const snapshots = useMemo(() => {
    if (!promptAttachList) return []
    return promptAttachList.map((snapshot) => {
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
  }, [localSnapshots, promptAttachList])

  const handleDeleteSnapshot = useCallback(
    (attachId: number) => {
      deleteSnapshot(attachId)
      setValue(
        'snapshots',
        snapshots.filter((snapshot) => snapshot.attachId !== attachId),
      )
    },
    [deleteSnapshot, setValue, snapshots],
  )

  const handleDescriptionChange = useCallback(
    (attachId: number, value: string) => {
      setValue(
        'snapshots',
        snapshots.map((snapshot) =>
          snapshot.attachId === attachId
            ? { ...snapshot, description: value }
            : snapshot,
        ),
      )
    },
    [setValue, snapshots],
  )

  return {
    snapshots,
    handleDeleteSnapshot,
    handleDescriptionChange,
  }
}

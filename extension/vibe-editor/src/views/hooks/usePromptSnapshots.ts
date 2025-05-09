import { useCallback, useEffect, useMemo } from 'react'
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
  console.log('usePromptSnapshots 호출됨', {
    localSnapshots,
    promptAttachList,
  })

  const snapshots = useMemo(() => {
    console.log('snapshots useMemo 실행됨', {
      promptAttachList,
      localSnapshots,
    })

    if (!promptAttachList) return []
    return promptAttachList.map((snapshot) => {
      const localSnapshot = localSnapshots.find(
        (localSnapshot) => localSnapshot.snapshotId === snapshot.snapshotId,
      )
      console.log('snapshot 매핑 중', {
        snapshot,
        localSnapshot,
      })

      return {
        attachId: snapshot.attachId,
        snapshotId: snapshot.snapshotId,
        snapshotContent: localSnapshot?.snapshotContent ?? '',
        description: snapshot.description,
        snapshotName: localSnapshot?.snapshotName ?? '',
      }
    })
  }, [localSnapshots, promptAttachList])

  console.log('생성된 snapshots', snapshots)

  useEffect(() => {
    console.log('promptAttachList 변경됨', promptAttachList)
    setValue('snapshots', snapshots)
  }, [promptAttachList, snapshots, setValue])

  const handleDeleteSnapshot = useCallback(
    (attachId: number | null) => {
      console.log('handleDeleteSnapshot 호출됨', {
        attachId,
        snapshots,
        promptAttachList,
      })
      if (attachId === null) return
      deleteSnapshot(attachId)
      setValue(
        'snapshots',
        snapshots.filter((snapshot) => snapshot.attachId !== attachId),
      )
    },
    [deleteSnapshot, setValue, snapshots],
  )

  const handleDescriptionChange = useCallback(
    (attachId: number | null, value: string) => {
      console.log('handleDescriptionChange 호출됨', {
        attachId,
        value,
        snapshots,
        promptAttachList,
      })
      if (attachId === null) return
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

  const addSnapshot = useCallback(
    (newSnapshot: PromptAttach) => {
      console.log('addSnapshot 호출됨', {
        newSnapshot,
        currentSnapshots: snapshots,
      })
      setValue('snapshots', [
        ...snapshots,
        {
          attachId: newSnapshot.attachId,
          snapshotId: newSnapshot.snapshotId,
          description: newSnapshot.description,
          snapshotContent: '',
          snapshotName: '',
        },
      ])
    },
    [snapshots, setValue],
  )

  return {
    snapshots,
    handleDeleteSnapshot,
    handleDescriptionChange,
    addSnapshot,
  }
}

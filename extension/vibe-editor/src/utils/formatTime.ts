import { formatDistanceToNow } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { ko } from 'date-fns/locale'

const timeZone = 'Asia/Seoul'
export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const diffInHours = Math.floor((Date.now() - date.getTime()) / 3600000)
  const kstDate = utcToZonedTime(date, timeZone)
  if (diffInHours < 24) {
    return formatDistanceToNow(kstDate, { addSuffix: true, locale: ko })
  }
  const nowKST = utcToZonedTime(new Date(), timeZone)

  return format(nowKST, 'PPPppp', { timeZone, locale: ko })
}

'use client'

import StatsWidget from './sidebar/StatsWidget'
import OnlineMembersWidget from './sidebar/OnlineMembersWidget'
import QuickActionsWidget from './sidebar/QuickActionsWidget'
import PinnedNoticeWidget from './sidebar/PinnedNoticeWidget'
import UrgentTasksWidget from './sidebar/UrgentTasksWidget'
import UpcomingEventsWidget from './sidebar/UpcomingEventsWidget'
import MyActivityWidget from './sidebar/MyActivityWidget'

export default function StudySidebar({ studyId }) {
  return (
    <div>
      <StatsWidget studyId={studyId} />
      <OnlineMembersWidget studyId={studyId} />
      <QuickActionsWidget studyId={studyId} />
      <PinnedNoticeWidget studyId={studyId} />
      <UrgentTasksWidget studyId={studyId} />
      <UpcomingEventsWidget studyId={studyId} />
      <MyActivityWidget studyId={studyId} />
    </div>
  )
}

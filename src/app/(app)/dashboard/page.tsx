import { createClient } from '@/lib/supabase/server'
import DashboardView from './DashboardView'
import type { EntryWithRels } from '@/lib/roi'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let entries: EntryWithRels[] = []
  let hideAmounts = false

  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('hide_amounts')
      .eq('id', user.id)
      .maybeSingle()
    hideAmounts = prof?.hide_amounts ?? false

    const { data } = await supabase
      .from('entries')
      .select('*, tournament:tournaments(*, series:series(*, brand:brands(*)))')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('played_at', { ascending: false })

    entries = (data ?? []) as EntryWithRels[]
  }

  return <DashboardView entries={entries} hideAmounts={hideAmounts} loggedIn={!!user} />
}

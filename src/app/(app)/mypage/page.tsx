import { createClient } from '@/lib/supabase/server'
import MypageView from './MypageView'

export const dynamic = 'force-dynamic'

export default async function MypagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="px-5 pt-8">
        <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
          マイページ
        </h1>
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            ログインしてください
          </p>
        </div>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <MypageView
      user={{
        id: user.id,
        email: user.email ?? '',
        avatar: user.user_metadata?.avatar_url ?? null,
      }}
      profile={
        profile ?? {
          id: user.id,
          display_name: null,
          x_handle: null,
          hide_amounts: false,
          avatar_url: null,
          created_at: '',
        }
      }
    />
  )
}

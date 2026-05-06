export type Brand = {
  id: string
  name: string
  created_at: string
}

export type Series = {
  id: string
  brand_id: string | null
  name: string
  started_at: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  brand?: Brand
}

export type Tournament = {
  id: string
  series_id: string
  number: number
  name: string
  default_buy_in: number | null
  scheduled_at: string | null
  created_by: string | null
  created_at: string
}

export type Entry = {
  id: string
  user_id: string
  tournament_id: string
  buy_in: number
  entry_count: number
  cash_amount: number
  total_invest_override: number | null
  total_entries: number | null
  finish_position: number | null
  played_at: string
  note: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type Profile = {
  id: string
  display_name: string | null
  x_handle: string | null
  hide_amounts: boolean
  avatar_url: string | null
  created_at: string
}

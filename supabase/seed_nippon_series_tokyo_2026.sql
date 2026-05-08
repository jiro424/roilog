-- NIPPON SERIES ブランド作成
insert into public.brands (name) values ('NIPPON SERIES')
on conflict do nothing;

-- NIPPON SERIES TOKYO 2026 シリーズ作成 ＋ トナメ一括登録
with brand as (select id from public.brands where name = 'NIPPON SERIES' limit 1),
     ins_series as (
       insert into public.series (brand_id, name, started_at, is_published, created_by)
       select id, 'NIPPON SERIES TOKYO 2026', '2026-05-01', true, null from brand
       returning id
     )
insert into public.tournaments (series_id, number, name, default_buy_in, created_by)
select s.id, t.number, t.name, t.buy_in, null
from ins_series s,
(values
  (1,  'NLH TAG MATCH sponsored by Sky Realty',                  20000),
  (2,  'FL 2-7 Triple Draw',                                     15000),
  (3,  'NLH MONSTER STACK',                                      15000),
  (4,  'NLH MINI MAIN EVENT',                                    20000),
  (5,  'NLH Escalating Bounty',                                  15000),
  (6,  'NLH Guerrilla sponsored by peccori',                     10000),
  (7,  'NLH Deep Stack Turbo',                                   10000),
  (8,  'NLH QUEENS sponsored by 湯屋やまざくら',                  10000),
  (9,  'FL Seven Card Stud Hi-Lo 8 or Better',                   15000),
  (10, 'NLH Super Deep Stack sponsored by VICTAS',               15000),
  (11, 'NLH Guerrilla',                                          10000),
  (12, 'NLH m HOLD''EM × NIPPON SERIES',                         10000),
  (13, 'MIX Draw Mix (2-7 TD & Badugi)',                         15000),
  (14, 'NLH MAIN EVENT',                                         30000),
  (15, 'NLH MONSTER STACK',                                      15000),
  (16, 'NLH Escalating Bounty',                                  15000),
  (17, 'NLH Guerrilla',                                          10000),
  (18, 'NLH Deep Stack Turbo',                                   10000),
  (19, 'MIX Triple Stud Mix (Stud, Razz, Stud8)',                15000),
  (20, 'NLH Super Deep Stack sponsored by ナンバーナイン',        15000),
  (21, 'NLH Escalating Bounty',                                  15000),
  (22, 'NLH Guerrilla',                                          10000),
  (23, 'NLH PARADISE CITY × NIPPON SERIES',                      10000),
  (24, 'MIX HORSE',                                              15000),
  (25, 'NLH NIPPON SERIES CHAMPIONSHIP',                         15000),
  (26, 'NLH Escalating Bounty',                                  15000),
  (27, 'NLH Guerrilla',                                          10000),
  (28, 'NLH Deep Stack Turbo',                                   10000),
  (29, 'MIX 7-Game Limit Mix',                                   15000),
  (30, 'NLH Mystery Bounty sponsored by STARRACE',               15000),
  (31, 'NLH NIPPON SERIES Finale',                               10000)
) as t(number, name, buy_in);

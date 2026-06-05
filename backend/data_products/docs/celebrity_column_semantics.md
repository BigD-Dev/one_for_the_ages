# Celebrity Column Semantics

Maps the generic `attr_desc_N` / `attr_value_N` pairs on `ofta_prod.ofta_celebrity` to their
meaning per celebrity category. All value columns are `TEXT[]` arrays.

## Column Overview

| Column             | Type         | Purpose |
|--------------------|--------------|---------|
| `primary_category` | VARCHAR      | Top-level type: `Footballer`, `Actor`, `Musician`, `Basketballer`, `Rugby Player`, `NFL Player` |
| `secondary_category`| VARCHAR     | Sub-type: `Premier League`, `NBA`, `Hollywood`, `Hip-hop`, `Six Nations`, `NFL`, etc. |
| `nationality`      | VARCHAR      | Primary nationality (international team / passport country) |
| `attr_desc_N`      | VARCHAR(100) | Human-readable label for attribute N (e.g. `"Nationality"`, `"Clubs"`) |
| `attr_value_N`     | TEXT[]       | Array of values for attribute N (e.g. `ARRAY['French']`, `ARRAY['Arsenal','Barcelona']`) |

Attributes 1–4 hold factual/categorical data. Attributes 5–7 hold notable facts (equivalent to "known for").

---

## Semantics by Category

### Footballer

| Attr | Desc label        | Value examples |
|------|-------------------|----------------|
| 1    | `Nationality`     | `ARRAY['French']`, `ARRAY['English','Jamaican']` |
| 2    | `Clubs`           | `ARRAY['Arsenal','Barcelona','New York Red Bulls']` |
| 3    | `Career Status`   | `ARRAY['Active']`, `ARRAY['Retired']` |
| 4    | `Position(s)`     | `ARRAY['Forward']`, `ARRAY['Midfielder','Defensive Midfielder']` |
| 5    | `Record / Trophy` | `ARRAY['Premier League all-time top scorer with 260 goals']` |
| 6    | `Career Moment`   | `ARRAY['Part of Arsenal''s unbeaten Invincibles 2003–04']` |
| 7    | `Notable Fact`    | `ARRAY['Turned down Arsenal to stay at Leicester after winning the title']` |

### Actor / Actress

| Attr | Desc label        | Value examples |
|------|-------------------|----------------|
| 1    | `Nationality`     | `ARRAY['Australian']`, `ARRAY['American','British']` |
| 2    | `Genre(s)`        | `ARRAY['Drama']`, `ARRAY['Action','Comedy']` |
| 3    | `Career Status`   | `ARRAY['Active']`, `ARRAY['Deceased']` |
| 4    | `Award(s)`        | `ARRAY['Oscar winner']`, `ARRAY['BAFTA winner','SAG winner']` |
| 5    | `Iconic Role`     | `ARRAY['The Lord of the Rings — played Galadriel']` |
| 6    | `Major Film / TV` | `ARRAY['Tár (2022)']` |
| 7    | `Notable Fact`    | `ARRAY['Youngest actor to win back-to-back Oscars']` |

### Musician / Rapper

| Attr | Desc label        | Value examples |
|------|-------------------|----------------|
| 1    | `Nationality`     | `ARRAY['Canadian']`, `ARRAY['American','Nigerian']` |
| 2    | `Genre(s)`        | `ARRAY['Hip-hop','R&B']`, `ARRAY['Pop','Dance']` |
| 3    | `Career Status`   | `ARRAY['Active']`, `ARRAY['Deceased']` |
| 4    | `Label / Era`     | `ARRAY['OVO Sound']`, `ARRAY['Cash Money Records']` |
| 5    | `Signature Song`  | `ARRAY['Started From the Bottom (2013)']` |
| 6    | `Iconic Album`    | `ARRAY['Take Care (2011)']` |
| 7    | `Notable Fact`    | `ARRAY['Beef with Kendrick Lamar — ''Not Like Us'' (2024)']` |

### Basketballer

| Attr | Desc label          | Value examples |
|------|---------------------|----------------|
| 1    | `Nationality`       | `ARRAY['American']`, `ARRAY['Greek']` |
| 2    | `Team(s)`           | `ARRAY['Los Angeles Lakers','Cleveland Cavaliers']` |
| 3    | `Career Status`     | `ARRAY['Active']`, `ARRAY['Retired']` |
| 4    | `Position(s)`       | `ARRAY['Small Forward']`, `ARRAY['Point Guard']` |
| 5    | `Championship(s)`   | `ARRAY['4x NBA Champion (2 Heat, 1 Cavs, 1 Lakers)']` |
| 6    | `Individual Award`  | `ARRAY['NBA all-time scoring leader (2023)']` |
| 7    | `Notable Fact`      | `ARRAY['Space Jam: A New Legacy (2021)']` |

### Rugby Player

| Attr | Desc label        | Value examples |
|------|-------------------|----------------|
| 1    | `Nationality`     | `ARRAY['New Zealand']`, `ARRAY['South African']` |
| 2    | `Team(s)`         | `ARRAY['All Blacks','Chiefs']` |
| 3    | `Career Status`   | `ARRAY['Active']`, `ARRAY['Retired']`, `ARRAY['Deceased']` |
| 4    | `Position(s)`     | `ARRAY['Wing']`, `ARRAY['Fly-half','Centre']` |
| 5    | `International`   | `ARRAY['63 Test caps for New Zealand']` |
| 6    | `Career Moment`   | `ARRAY['1999 Rugby World Cup — 8 tries in the tournament']` |
| 7    | `Notable Fact`    | `ARRAY['Bulldozed Mike Catt in 1995 RWC semi-final']` |

### NFL Player

| Attr | Desc label        | Value examples |
|------|-------------------|----------------|
| 1    | `Nationality`     | `ARRAY['American']` |
| 2    | `Team(s)`         | `ARRAY['New England Patriots','Tampa Bay Buccaneers']` |
| 3    | `Career Status`   | `ARRAY['Active']`, `ARRAY['Retired']` |
| 4    | `Position(s)`     | `ARRAY['Quarterback']`, `ARRAY['Wide Receiver']` |
| 5    | `Super Bowl(s)`   | `ARRAY['7x Super Bowl winner — most of any player']` |
| 6    | `Award(s)`        | `ARRAY['3x NFL MVP']` |
| 7    | `Notable Fact`    | `ARRAY['28-3 comeback vs Falcons in Super Bowl LI']` |

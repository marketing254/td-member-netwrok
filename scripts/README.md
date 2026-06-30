# Scripts

## import-resources

Bulk-imports every kit folder under your `Resources/` root into Supabase.

### Run order

1. Run migrations through `0027` against the target Supabase project.
2. Make sure `landing/.env.local` has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Verify the buckets exist in Supabase Storage:
   - `member-resources` (content files)
   - `kit-thumbnails` (cover artwork)

### What it does

For every direct subfolder of the root **and** every subfolder of
`Book club resources/`:

1. Detects whether it's a **standard kit** or a **Book Club kit**
   (presence of `Book Study Guide.pdf` or any `Short N (9x16) - <name>.mp4`).
2. Uploads `Card - Portal Grid.png` or `Cover - Square (social).png` to
   `kit-thumbnails/<slug>/portal-card.<ext>`.
3. Uploads `Cover - Detail Hero (wide).png` to
   `kit-thumbnails/<slug>/resource-card.<ext>`.
4. Uploads every content file to `member-resources/<slug>/<safe-name>`.
5. Inserts one row in `resources` per content file with the right `kind`
   + `position`, plus topic-level metadata (`portal_card_url`,
   `resource_card_url`, `kit_type`, `book_club_payload`).

The importer is **idempotent** — if a `topic_slug` already exists in
the DB, the kit is skipped entirely. To re-import a kit, delete its
rows first (then re-run).

### Commands

```bash
# Dry run — prints the plan, uploads nothing
npm run import-resources -- \
  --root "D:/TD - Member Network/Resources" \
  --category "Practice Management" \
  --dry-run

# Real run — imports as pending_review (admin must approve)
npm run import-resources -- \
  --root "D:/TD - Member Network/Resources" \
  --category "Practice Management"

# Publish on insert (skips the review queue)
npm run import-resources -- \
  --root "D:/TD - Member Network/Resources" \
  --category "Practice Management" \
  --publish

# Import only a single kit (exact folder-name match)
npm run import-resources -- \
  --root "D:/TD - Member Network/Resources" \
  --only "Atomic Habits" \
  --publish
```

### Options

| Flag                       | Default              | Notes                                                 |
| -------------------------- | -------------------- | ----------------------------------------------------- |
| `--root <path>`            | (required)           | Absolute path to the `Resources/` folder.             |
| `--category <name>`        | `null`               | Default category for **standard** kits.               |
| `--book-club-category <s>` | `Book Club`          | Category written on Book Club kits.                   |
| `--only "<name>"`          | (none, repeatable)   | Import only the named kit folders.                    |
| `--publish`                | off                  | Insert rows as `approved` + `is_published=true`.      |
| `--dry-run`                | off                  | Print the plan; don't upload or insert anything.      |

### How files map to `resources.kind`

| File on disk                          | Resource kind        |
| ------------------------------------- | -------------------- |
| `Training Video.mp4`                  | `video_full`         |
| `Action Guide.pdf`                    | `action_guide`       |
| `Book Study Guide.pdf` (Book Club)    | `book_study_guide`   |
| `Discussion Questions.pdf` (BC)       | `discussion_questions` |
| `Key Takeaways.pdf`                   | `key_takeaways`      |
| `Infographic.pdf` (BC)                | `infographic`        |
| `Infographic.png` (BC)                | `infographic_image`  |
| `Checklist.pdf`                       | `checklist`          |
| `Worksheet.pdf`                       | `worksheet`          |
| `Slide Deck.pdf` / `.pptx`            | `slide_deck`         |
| `Wall Poster.pdf`                     | `other`              |
| `Short N (9x16) - <principle>.mp4`    | `video_short` (title = principle name) |

### Book Club kits — `book_club_payload`

When a kit is detected as Book Club, the importer ALSO writes a JSON blob
to every row's `book_club_payload`:

```json
{
  "shorts": [
    { "index": 1, "principle": "Make It Obvious", "public_url": "https://…" },
    { "index": 2, "principle": "Make It Easy",    "public_url": "https://…" },
    { "index": 3, "principle": "Make It Satisfying","public_url": "https://…" }
  ],
  "has_infographic": true
}
```

The member portal reads `kit_type === 'book_club'` and renders the
shorts as a "Key Principles" reel above the standard player + curriculum.

### Troubleshooting

- **`Missing SUPABASE env`** — check `landing/.env.local` and confirm
  `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set.
- **`Upload failed (...): The resource already exists`** — re-running with
  the same slug. Either delete the old rows first or accept the skip.
- **`DB read failed`** — usually means a migration is missing
  (`kit_type` / `book_club_payload` columns require migration 0027).
- **Storage bucket missing** — create `member-resources` and
  `kit-thumbnails` in Supabase Storage with public read enabled.

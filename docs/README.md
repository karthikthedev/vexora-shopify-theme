# docs/

Drop your screenshots and walkthrough video in this folder. The main
[README](../README.md) already links to them by these exact filenames.

## Expected files

| File | What it is |
|---|---|
| `s1.png` … `s10.png` | Store screenshots, in the order they appear in the README gallery |
| `v1.mp4` | Full store walkthrough video |

**Filenames must match exactly**, including the extension and lowercase `s`/`v`.
If your files are `.jpg` or `.mov` instead, either rename them or update the
paths in the root `README.md` to match — otherwise the images render as broken
icons on GitHub.

Keep the video under **100 MB** — that is GitHub's hard per-file limit, and
files over 50 MB produce a warning. If your walkthrough is larger, either
compress it or upload it to YouTube and link to it instead.

## Making the video play inline on GitHub

A `<video>` tag pointing at a file committed in the repo does **not** reliably
play on github.com — GitHub's HTML sanitizer strips it, so visitors get a
download link rather than an inline player. The README currently uses a plain
link, which always works.

If you want a real inline player, use GitHub's own upload flow:

1. Open a new issue in this repository (you do not have to submit it).
2. Drag `v1.mp4` into the comment box and wait for it to finish uploading.
3. GitHub replaces it with a URL like
   `https://github.com/user-attachments/assets/…`.
4. Copy that URL into the root `README.md` in place of the
   `[Watch the full store walkthrough →](docs/v1.mp4)` link, on its own line.
5. Close the issue without submitting.

That CDN-hosted URL renders as an embedded, playable video on the README.

## Screenshot tips for a recruiter audience

- Capture at a consistent width so the two-column gallery table stays even.
- Full-page screenshots read better than viewport crops for showing layout.
- Include at least one mobile-width capture — responsive work is worth showing.
- Update the captions in the root README to match what you actually captured.

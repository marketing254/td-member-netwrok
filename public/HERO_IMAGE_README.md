# Hero background imagery

The home page hero looks for `hero-dental.jpg` in this folder. Drop a JPG
(or PNG/WebP — just rename the file accordingly and update the path in
`src/components/sections/WaitlistHero.tsx`) and the photo will wash through
the right side of the hero with a cream/gold filter so it always feels
on-brand.

## What works best
- Landscape orientation, minimum 2000px wide
- A US dental practice scene: smiling team, modern operatory, a practice
  owner at the front desk, or a patient consult
- Avoid clinical close-ups of teeth or procedures — keep it warm and human
- Light, naturally-lit photos read best behind the cream overlay

## Royalty-free sources
- Unsplash: https://unsplash.com/s/photos/dentist
- Pexels: https://www.pexels.com/search/dental%20office/
- Mixkit (video): https://mixkit.co/free-stock-video/dentist/

## To swap in a different file
Change the `backgroundImage: "url('/hero-dental.jpg')"` line in
`WaitlistHero.tsx` to your filename. If the file doesn't exist the hero
falls back gracefully to the cream gradient + 3D network — no broken
image icon.

## To swap in a video instead
Replace the photo `<Box>` block in `WaitlistHero.tsx` with a `<video>` tag
pointing at a `.mp4` in this folder. Set `autoPlay loop muted playsInline`
and the same mask/filter wrapper.

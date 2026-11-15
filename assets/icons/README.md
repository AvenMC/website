# Shared network icons

User-provided transparent PNG originals:

| File | Use |
| --- | --- |
| `sword.png` | Sword gamemode |
| `crystal.png` | CrystalPvP gamemode |
| `globe.png` | Regions and global navigation |
| `mace.png` | Mace gamemode |
| `apple.png` | UHC gamemode |
| `fireball.png` | Fireball gamemode |
| `tnt.png` | TNT Cart gamemode |

All originals are 452 x 452 pixels except Mace, which is 32 x 32 pixels.

The canonical cross-project copies are in
`AvenMC/avenmc-network`, under `resource-pack/shared/icons/`.
Keep these website copies byte-identical when updating them.

Other projects can copy the originals from the monorepo. The website also serves
them publicly at `https://avenmc.github.io/website/assets/icons/<filename>`.
For reproducible imports from GitHub, use a raw URL pinned to a commit instead of
`main`. No additional redistribution license was supplied with these files.

The website uses their alpha channels as CSS masks so each mode or region can
apply its own accent color. Resolve paths from `import.meta.url` to support the
GitHub Pages repository subpath.

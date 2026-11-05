# Ember & Rime

A two-player, same-screen game of *n* in a row, played on a dark canvas arena
where fire and ice fight for the line. Chains light up as they grow, glow
white-hot one stone from the end, and go to ash when they are walled in.

No build step, no dependencies, no server. Open the file and play.

```
open index.html
```

(Or serve the folder — `python3 -m http.server` — if you prefer. Both work.)

## Playing

Fire (×) opens, then players alternate. First to line up the agreed number of
tokens — in a row, a column, or either diagonal — wins.

| | |
|---|---|
| **Place a stone** | click or tap a cell |
| **Pan** | drag, scroll, or hold the arrow keys |
| **Zoom** | `+` / `−` buttons, pinch, or ⌘/Ctrl + scroll |
| **Jump** | `Last` returns to the newest stone, `Centre`/`Origin` to the middle (`0` key) |
| **Overview** | click anywhere on the minimap to travel there |

The board tells you where you stand. A chain two short of the win starts to
flow — lava or meltwater. One short, it runs white-hot or spines over with
crystal, and open ends are marked with a diamond. A chain with no room left to
reach the win goes dull: it is dead, and you can stop defending it.

## Setting the terms

The opening card configures each match. **Terms** in the top bar reopens it at
any time — mid-match it offers *Keep playing*, so looking is free; *Begin the
duel* starts fresh on the new board. **Reset** replays the same terms, and asks
once before it clears the board.

**Combatants** — names for fire and ice, up to 14 characters.

**Board** — one of two shapes:

- **Fixed** — any `rows × columns` from 3 × 3 up to 60 × 60. The edge is a real
  wall: space beyond it is not room to grow, so a chain can be smothered
  against the side of the board, and a board that fills with no line drawn ends
  in a stalemate.
- **Infinite** — the board opens 15 cells across and widens whenever a stone
  lands near its edge, so it never runs out and never draws. The frontier
  fades in as it unrolls, and the origin stays marked however far play travels.

**Win** — how many tokens in a row it takes, from 3 to 12. On a fixed board the
win cannot exceed the longer side; the card says so and holds the duel until
you widen the board or lower the number.

A few combinations worth trying: `3 × 3` with a win of 3 is tic-tac-toe.
`15 × 15` with a win of 5 is gomoku. Infinite with a win of 5 is the original
game. A long win condition on a wide board — 8 on a 40 × 40 — plays slowly and
rewards building two threats at once.

## Files

```
index.html    the whole game: markup, styles, rules, renderer
infinite.js   the endless-board engine, loaded on demand
README.md
```

`index.html` is self-contained and plays fixed boards on its own.
`infinite.js` is fetched the first time someone actually begins an infinite
duel, and cached for the rest of the session — selecting "Infinite" on the card
does not fetch it, and neither does the sample skirmish behind the card. If the
file cannot be reached, the setup card says so and the fixed boards keep
working.

It loads through a classic `<script>` tag rather than `import()` so that the
game still works when opened straight off the filesystem, where ES modules are
blocked by the origin rules.

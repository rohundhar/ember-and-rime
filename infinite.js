/* ---------------------------------------------------------------------------
   infinite.js — the endless-board engine for Ember & Rime.

   This file is NOT referenced by index.html's markup. It is fetched on demand
   by loadInfinite(), the first time a duel is fought on an infinite board, and
   then cached for the rest of the session. A fixed-size match never pays for
   the generation bookkeeping, the frontier motes or the unbounded camera.

   It registers one factory on window.EmberRime. Calling it returns a fresh
   board mode — see the "board modes" contract in index.html.
--------------------------------------------------------------------------- */
(function(){
  'use strict';

  var ER = window.EmberRime = window.EmberRime || {};

  ER.infinite = function(env){
    var CELL = env.CELL, hash = env.hash, clamp = env.clamp, K = env.key;

    var START = 7;   // half-width of the opening grid (15 x 15)
    var GROW  = 5;   // cells added when the frontier is pushed
    var NEAR  = 3;   // how close a stone must land to push it

    var bounds = { minX:-START, maxX:START, minY:-START, maxY:START };

    /* Each generation records a rectangle and the moment it was revealed, so
       newly unlocked cells can fade in from the edge that unlocked them. */
    var gens = [{ minX:-START, maxX:START, minY:-START, maxY:START, t:performance.now() }];

    /* When was this cell revealed? Oldest matching generation wins. */
    function bornAt(x, y){
      for(var i = 0; i < gens.length; i++){
        var g = gens[i];
        if(x >= g.minX && x <= g.maxX && y >= g.minY && y <= g.maxY) return g.t;
      }
      return Infinity;
    }

    return {
      infinite: true,
      bounds: bounds,
      size: Infinity,          // never fills, so there is no stalemate
      pad: 4.5 * CELL,         // how far past the frontier the camera may drift
      minZoom: 0.42,
      fit: false,              // the opening grid is sized to feel infinite, not to fit
      homeLabel: 'Origin',
      homeTitle: 'Return to the starting point',
      shape: 'endless board',
      blurb: 'The grid starts fifteen cells across and widens whenever a stone lands near its edge.',

      /* Re-seat the engine on a restored board (hot reload). */
      adopt: function(b, t){
        bounds.minX = b.minX; bounds.maxX = b.maxX;
        bounds.minY = b.minY; bounds.maxY = b.maxY;
        gens.length = 0;
        gens.push({ minX:b.minX, maxX:b.maxX, minY:b.minY, maxY:b.maxY, t:t });
      },

      /* The board is genuinely endless, so empty space counts as room for a
         chain to grow no matter which side of the current frontier it sits on. */
      open: function(x, y){
        return !env.cells().has(K(x, y));
      },

      reveal: function(x, y, now){
        var t = bornAt(x, y);
        if(t === Infinity) return 0;
        var delay = Math.max(Math.abs(x), Math.abs(y)) * 22 + hash(x, y) * 160;
        return clamp((now - t - delay) / 380, 0, 1);
      },

      /* A stone near the frontier pushes it outward. */
      onPlace: function(x, y){
        var widened = [];
        if(x - bounds.minX <= NEAR){ bounds.minX -= GROW; widened.push('west'); }
        if(bounds.maxX - x <= NEAR){ bounds.maxX += GROW; widened.push('east'); }
        if(y - bounds.minY <= NEAR){ bounds.minY -= GROW; widened.push('north'); }
        if(bounds.maxY - y <= NEAR){ bounds.maxY += GROW; widened.push('south'); }
        if(widened.length){
          gens.push({
            minX:bounds.minX, maxX:bounds.maxX,
            minY:bounds.minY, maxY:bounds.maxY,
            t:performance.now()
          });
        }
        return widened;
      },

      home: function(){ return [CELL / 2, CELL / 2]; },

      decorate: function(now){
        var ctx = env.ctx;
        var d = env.dims(), W = d[0], H = d[1];
        var s = CELL * env.scale();
        var toSX = env.toSX, toSY = env.toSY, cx = env.cx;

        /* the void just past the frontier: faint motes, so the edge reads as "more to come" */
        var vx0 = Math.floor(env.toWX(0) / CELL) - 1, vx1 = Math.ceil(env.toWX(W) / CELL) + 1;
        var vy0 = Math.floor(env.toWY(0) / CELL) - 1, vy1 = Math.ceil(env.toWY(H) / CELL) + 1;
        ctx.fillStyle = 'rgba(135,148,166,0.14)';
        for(var vy = vy0; vy <= vy1; vy++){
          for(var vx = vx0; vx <= vx1; vx++){
            if(env.inBounds(vx, vy)) continue;
            var dist = Math.max(
              bounds.minX - vx, vx - bounds.maxX,
              bounds.minY - vy, vy - bounds.maxY, 0
            );
            if(dist > 3) continue;
            ctx.globalAlpha = (1 - dist / 4) * 0.5;
            ctx.fillRect(toSX(cx(vx)) - 1, toSY(cx(vy)) - 1, 2, 2);
          }
        }
        ctx.globalAlpha = 1;

        /* the starting point stays marked, however far play travels from it */
        var f0 = this.reveal(0, 0, now);
        if(f0 > 0 && !env.cells().has('0,0')){
          var mx = toSX(cx(0)), my = toSY(cx(0)), r = s * 0.17;
          ctx.save();
          ctx.strokeStyle = 'rgba(135,148,166,' + (0.4 * f0) + ')';
          ctx.lineWidth = Math.max(1, s * 0.018);
          ctx.beginPath();
          ctx.moveTo(mx, my - r); ctx.lineTo(mx + r, my);
          ctx.lineTo(mx, my + r); ctx.lineTo(mx - r, my);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      }
    };
  };
})();

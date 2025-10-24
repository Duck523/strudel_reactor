

const stranger_tune = `setcps(0.7);

<p1_Radio>p1: n("1 1 1 6 7 6 4 2")
  .scale("<c3:major>/2")
  .s("supersaw")
  .distort(0.7)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);
p2: "<a1 e2>/8".clip(0.8).struct("x*8").s("supersaw").note();
// Grabbed from Hacker News: https://news.ycombinator.com/item?id=44939874
// @version 1.2`;

const jump_tune = `setcps(2.166); 

<p1_Bass>p1: n("0 0 2 4 5 4 2 0")
  .scale("c3:minor")
  .s("bass")
  .gain(0.8)
  .legato(1.2);

<p2_Synth>p2: n("0 0 7 7 9 9 7")
  .scale("c4:maj")
  .s("supersaw")
  .gain(0.7)
  .legato(1)
  .distort(0.3)
  .lpf(perlin.slow(2).range(200, 2000));

<p3_Arp>p3: n("0 4 7 12 11 7 4 0")
  .scale("c4:maj")
  .s("supersaw")
  .gain(0.5)
  .legato(0.5)
  .pan("<0 1>")
  .superimpose(x => x.detune("<0.5>"));

<p4_Drums>p4: stack(
  s("bd*4").gain(0.9),
  s("hh*8").gain(0.5),
  s("sd").every(2, s => s.gain(0.8))
);

<fx>fx: stack(
  $.room(0.4),
  $.delay(0.2)
);

// @version 1.0 - Van Halen "Jump" approximation`;

export const tunes = [stranger_tune, jump_tune];
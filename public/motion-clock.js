// Active time drives the progress indicator and slide change together.
export function createSlideClock({ duration = 6400, now, request, cancel, progress, advance }) {
  let frame = 0, running = false, elapsed = 0, started = 0;
  function tick(time) {
    if (!running) return;
    const total = elapsed + Math.max(0, time - started);
    if (total >= duration && advance()) { elapsed = 0; started = time; progress(0); }
    else progress(Math.min(1, total / duration));
    frame = request(tick);
  }
  return {
    setRunning(value) {
      if (value === running) return;
      if (value) { running = true; started = now(); frame = request(tick); }
      else { elapsed = Math.min(duration, elapsed + Math.max(0, now() - started)); running = false; cancel(frame); progress(elapsed / duration); }
    },
    reset() { elapsed = 0; started = now(); progress(0); },
  };
}

// Require two complete low-FPS windows, so one slow frame cannot trigger a prompt.
export function createFpsSampler(report) {
  let started = null, frames = 0, lowWindows = 0;
  return {
    reset() { started = null; frames = 0; lowWindows = 0; },
    sample(time) {
      if (started === null) { started = time; return; }
      frames++;
      const elapsed = time - started;
      if (elapsed < 2500) return;
      const fps = Math.round(frames * 1000 / elapsed);
      lowWindows = fps < 42 ? lowWindows + 1 : 0;
      started = time; frames = 0;
      if (lowWindows >= 2) report(fps);
    },
  };
}

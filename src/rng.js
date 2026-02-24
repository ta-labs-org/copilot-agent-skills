// Simple seedable RNG (mulberry32)
function createRng(seed = Date.now()) {
  let t = seed >>> 0;
  function next() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    // nextInt(n): 0..n-1
    nextInt(n) {
      return Math.floor(next() * n);
    }
  };
}

module.exports = { createRng };

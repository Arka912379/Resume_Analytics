const map = new Map();

export function get(key) {
  return map.get(key);
}

export function set(key, value) {
  map.set(key, value);
}

export { get, set }
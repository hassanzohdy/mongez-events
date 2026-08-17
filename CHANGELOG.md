# Changelog

All notable changes to `@mongez/events` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.7] — 2026-08-17

### Security

- **The listener registry is now a `Map` instead of a plain object.** Event names are caller-supplied strings, and on a plain object the names `__proto__`, `constructor` and `toString` resolve through the prototype chain rather than being treated as data. Subscribing to `toString` found `Object.prototype.toString` where the code expected an array of callbacks, subscribing to `__proto__` wrote into the registry's prototype instead of the registry, and either could make `trigger` throw or silently drop every listener for an unrelated event. Where event names are derived from user or server data — a common pattern for per-record or per-channel topics — this was a denial-of-service on the bus itself. A `Map` has no prototype-chain lookup, so every event name is plain data. The public API (`subscribe` / `trigger` / `unsubscribe`, namespace cleanup, `EventSubscription`) is unchanged.

---

## [2.2.6]

### Added

- This changelog. No code changes — the package remains the namespace-aware global event bus (`subscribe` / `trigger` / `unsubscribe` / namespace cleanup) with `EventSubscription` and `EventTriggerResponse` types.

> Version history prior to 2.2.6 is available via the git tags and GitHub releases on [hassanzohdy/events](https://github.com/hassanzohdy/events). Future releases will be documented here.

# Contributing

Please do!

## Bug reports & feature requests

Please submit bug reports and feature requests to https://github.com/SKalt/brzozowski-ts/issues/new/choose

## Development

### setup

```sh
pnpm install # install dev-dependencies
./node_modules/.bin/husky # ensure git hooks are set up
```

#### required software

- [`pnpm >= 8.6.12`](https://pnpm.io/)
- [`node.js >= 20.11.1`](https://nodejs.org/)
- `bash >= 3`

#### recommended software

- [`direnv >= 2.32.3`](https://direnv.net/)

### Formatting

`prettier --experimental-ternaries` is enforced.

### Tests

...are a work-in-progress.
For now, run `./scripts/test.sh`.

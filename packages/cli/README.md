# nirium-cli

Scaffold Stellar agent projects — including one that charges for itself.

```bash
npm install -g nirium-cli
```

## Charge for your API in five minutes

```bash
nirium create x402 --name my-paid-api
cd my-paid-api && npm install
```

Fill two values in the generated `.env`:

| Variable | Where it comes from |
|---|---|
| `STELLAR_PAY_TO` | the Stellar account that receives payments (`G...`) |
| `X402_FACILITATOR_API_KEY` | free at [channels.openzeppelin.com/gen](https://channels.openzeppelin.com/gen) |

The API key is not optional. The facilitator rejects unauthenticated servers
on testnet as well as mainnet, so without it your routes never get as far as
offering a 402.

```bash
npm run dev
```

Everything under `/premium` now bills before it answers. A caller without
payment gets a 402 carrying the terms; one that pays gets the data, and the
transfer settles on Stellar before your handler returns. No subscription, no
card, no invoice, no human in the middle.

The generated server is about ten lines, because `x402Serve()` from the
[`nirium`](https://www.npmjs.com/package/nirium) SDK carries the facilitator
client, the scheme registration and the route shape.

## Listen to protocol signals

```bash
nirium create bot --name my-agent          # TypeScript
nirium create bot --name my-agent -t py    # Python
```

Scaffolds a project that connects to a Nirium agent and prints incoming
signals, which the autonomous loop produces on testnet. Defaults to `https://nirium-agent.fly.dev` (testnet); set
`NIRIUM_API_URL` and `NIRIUM_API_KEY` in `.env` to point somewhere else.

## Check an agent

```bash
nirium status
```

## Options

| Option | Values | Default |
|---|---|---|
| `-n, --name <name>` | project directory name | `nirium-bot-v1` |
| `-t, --template <template>` | `ts` or `py` — `bot` only | `ts` |

## Links

- [nirium.xyz](https://nirium.xyz)
- [TypeScript SDK](https://www.npmjs.com/package/nirium) · [Python SDK](https://pypi.org/project/nirium/)
- [SDK and examples on GitHub](https://github.com/nirium-protocol/nirium-sdk)

## License

Apache 2.0 — Nirium Protocol

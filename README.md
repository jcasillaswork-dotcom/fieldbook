# Fieldbook — proof of concept

Business operations platform for service businesses: CRM with a unified customer record, inbox with an AI receptionist, dispatch board, invoices and card/ACH payments, automations, assistant, AI agents, AI website builder, and expenses & stock.

Everything runs on mock data in the browser. There is no backend; the AI features are rule-based simulations.

## Requirements

- Node.js 18 or newer (20 LTS recommended)
- npm

## Run in development

```bash
npm install
npm run dev
```

Open `http://<vm-ip>:5173`. The dev server listens on all interfaces (see `vite.config.js`), so open port 5173 in the VM firewall if needed:

```bash
sudo ufw allow 5173/tcp   # Ubuntu with ufw
```

## Production build

```bash
npm install
npm run build        # outputs static files to dist/
npm run preview      # serves dist/ on http://<vm-ip>:4173
```

`dist/` is plain static files. You can serve it with any web server (nginx, Apache, Caddy). There is a sample `nginx.conf` in this folder.

## Run with Docker

```bash
docker build -t fieldbook .
docker run -d -p 8080:80 --name fieldbook fieldbook
```

Open `http://<vm-ip>:8080`.

## Project layout

```
src/
  main.jsx            entry point
  App.jsx             shell: sidebar navigation, routing by #hash, toast
  lib.js              constants, helpers, mock data (seed + 6-month history generator)
  components.jsx      shared UI: Modal, Switch, Tag, lookup helpers
  styles.css          design tokens (light + dark) and all styles
  views/
    Today.jsx         dashboard
    Inbox.jsx         calls, texts, chat + AI receptionist simulation
    Customers.jsx     customer list, unified record, New job form
    Dispatch.jsx      tech schedule board
    Billing.jsx       invoices, New invoice, Record payment
    Automations.jsx   trigger → action rules
    Assistant.jsx     question answering over workspace data
    Agents.jsx        AI agent configuration
    Website.jsx       AI website builder with live booking form
    Expenses.jsx      expenses and inventory
```

## Mock data

- Generated in `src/lib.js` (`baseSeed` plus `addHistory`). The generator is seeded, so the data is the same on every machine.
- State is saved to the browser's localStorage under the key `fieldbook-demo-v2`. "Reset demo data" in the sidebar restores the original mock data.
- After you change the mock data in code, bump `KEY` in `src/lib.js` (for example to `fieldbook-demo-v3`) so browsers pick up the new seed instead of the saved copy.

## Next steps toward a real product

- Replace localStorage with an API and database (e.g. FastAPI or Node + PostgreSQL).
- Telephony/SMS through a provider such as Twilio; payments through Stripe (card + ACH).
- Swap the rule-based assistant and agents for calls to an LLM through your backend. Don't call the model directly from the browser, because that would expose your API key.

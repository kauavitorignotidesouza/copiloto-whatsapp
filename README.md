This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Banco de dados (Neon + Netlify)

O projeto usa **Neon** (PostgreSQL) com suporte à **integração oficial da Netlify**.

### Na Netlify (recomendado)

1. No painel do site: **Integrations** → busque **Neon** → **Add integration** (ou **Connect**).
2. Siga o fluxo para conectar/criar o banco. A Netlify define automaticamente a variável **`NETLIFY_DATABASE_URL`**.
3. O código usa `import { neon } from '@netlify/neon'` e `neon()` — não é preciso configurar URL manualmente.

Alternativa via CLI: `netlify db init` (com Netlify CLI configurado).

### Local (desenvolvimento)

1. Crie `.env.local` com a connection string do Neon:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
2. Pegue a URL no projeto em [neon.tech](https://neon.tech).

### Migrações

Depois de ter o banco configurado (Netlify ou local com `DATABASE_URL`):

```bash
npm run db:init
```

Ou copie o conteúdo de `drizzle/0000_init.sql` e rode no **SQL Editor** do Neon.

Veja `.env.example` para outras variáveis opcionais.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

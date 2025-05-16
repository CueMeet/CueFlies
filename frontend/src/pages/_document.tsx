import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Meeting Note Taker - Organize and manage your meeting notes efficiently" />
        <meta name="keywords" content="meeting notes, note taking, calendar, scheduling, productivity" />
        <meta property="og:title" content="Meeting Note Taker" />
        <meta property="og:description" content="Organize and manage your meeting notes efficiently" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Meeting Note Taker" />
        <meta name="twitter:description" content="Organize and manage your meeting notes efficiently" />
        <link rel="icon" href="/calendar.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

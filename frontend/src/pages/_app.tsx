import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../graphql';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <Head>
        <title>CueFlies Meeting Notetaker</title>
      </Head>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
        />
    </ApolloProvider>
  );
}

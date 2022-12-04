import { useRouter } from "next/router";
import { useEffect } from "react";
import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";

import getLibrary from "../getLibrary";
import "../styles/globals.css";
import NavBar from "../components/Navbar";

function NextWeb3App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  useEffect(() => {
    router.push('/home');
  }, [])

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <NavBar></NavBar>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default NextWeb3App;

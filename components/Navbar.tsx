import { useWeb3React } from "@web3-react/core";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { useRouter } from 'next/router'
import Head from "next/head";

import Account from "../components/Account";
import useEagerConnect from "../hooks/useEagerConnect";

const navItems = [{ key: 'home', label: 'Home' }, { key: 'mint', label: 'Mint' }, { key: 'collection', label: 'Collection' }, { key: 'profile', label: 'Profile' }];

function Home() {
    const router = useRouter();
    const { account, library } = useWeb3React();
    const triedToEagerConnect = useEagerConnect();

    const isConnected = typeof account === "string" && !!library;

    return (
        <div>
            <Head>
                <title>LimeAcademy-boilerplate</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header>
                <nav style={{ height: '64px' }}>
                    <AppBar position="static">
                        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }} variant="dense">
                            <Typography variant="h6" color="inherit" component="div">
                                Marketplace
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <List style={{ display: 'flex' }}>
                                    {navItems.map((item) => (
                                        <ListItem key={item.key} disablePadding>
                                            <ListItemButton onClick={() => { router.push(`/${item.key}`) }} sx={{ textAlign: 'center' }}>
                                                <ListItemText primary={item.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                                <List style={{ display: 'flex' }}>
                                    <ListItem key="Account" disablePadding>
                                        <Account triedToEagerConnect={triedToEagerConnect} />
                                    </ListItem>
                                </List>
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <Account triedToEagerConnect={triedToEagerConnect} />
                </nav>
            </header>

            <main>
                {isConnected && (
                    <section>
                    </section>
                )}
            </main>

            <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style>
        </div>
    );
}

export default Home;

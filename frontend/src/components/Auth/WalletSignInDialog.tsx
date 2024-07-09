'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

//import { CIP30Wallet } from 'kuber-client';
import { CIP30Provider } from 'kuber-client/types';
import { OctagonAlert, Wallet } from 'lucide-react';
import { X } from 'lucide-react';

import { Dialog, DialogContent } from '@app/components/atoms/Dialog';

interface IWalletInfo {
    name: string;
    icon: string;
}

function listProviders(): CIP30Provider[] {
    const pluginMap = new Map();
    if (!window.cardano) {
        return [];
    }
    Object.keys(window.cardano).forEach((x) => {
        const plugin: IWalletInfo = window.cardano[x];
        //@ts-ignore
        if (plugin.enable && plugin.name) {
            pluginMap.set(plugin.name, plugin);
        }
    });
    const providers = Array.from(pluginMap.values());
    console.info('Provides', providers);
    // yoroi doesn't work (remove this after yoroi works)
    return providers.filter((x) => x.name != 'yoroi');
}

export default function WalletSignIn() {
    //to do save to atom
    //const [walletApi, setWalletApi] = useState<CIP30Wallet | null>(null);
    const [walletProviders, setWalletProviders] = useState<CIP30Provider[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(true);

    //async function enableWallet(wallet: CIP30ProviderProxy) {
    //  const enabledApi = await wallet.enable();
    //setWalletApi(enabledApi);
    // local storage
    // wallet name
    //}

    useEffect(() => {
        console.log('use effect started');
        const wallets = listProviders();
        setWalletProviders(wallets);
    }, []);

    //async function verifyWallet() {
    //  if (!walletApi) return;
    // const changeAddress = await walletApi.changeAddress();
    // const signature = await walletApi.signData(
    //   changeAddress.to_hex(),
    //   'hello world'
    //);
    //console.log(signature);
    // }

    function toggleDialog() {
        dialogOpen ? setDialogOpen(false) : setDialogOpen(true);
    }

    const textHiglight = 'text-blue-500';
    return (
        <div>
            <Dialog open={dialogOpen}>
                <DialogContent
                    className="max-w-4xl px-8 pb-24 focus:outline-none"
                    defaultCross={false}
                >
                    <div className="flex flex-col gap-y-4 ">
                        <div className="mb-4 flex justify-end">
                            <X
                                onClick={toggleDialog}
                                className="hover:cursor-pointer"
                            />
                        </div>
                        <div className="mb-4 flex items-center justify-center gap-2">
                            <Wallet size={28} stroke="#2595FCFA" />
                            <span className="text-2xl font-semibold">
                                {' '}
                                Connect <span className="text-blue-600">
                                    CIP-30
                                </span>{' '}
                                Wallet
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-x-4">
                            {walletProviders.length > 0 ? (
                                walletProviders.map((wallet, index) => (
                                    <div className="basix-1/4" key={index}>
                                        <WalletProviderDiv wallet={wallet} />
                                    </div>
                                ))
                            ) : (
                                <WalletProviderListEmptyMessage />
                            )}
                        </div>
                        <div className="mt-4 px-4 text-center">
                            By connecting your Wallet , you agree to the{' '}
                            <span className={textHiglight}>Terms & Conditons </span> and{' '}
                            <span className={textHiglight}>Privacy Policy.</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function WalletProviderDiv({ wallet }: { wallet: CIP30Provider }) {
    return (
        <div className="flex justify-center rounded-lg bg-gray-100 p-8 hover:cursor-pointer hover:bg-gray-200">
            <Image src={wallet.icon} alt={wallet.name} width={48} height={48} />
        </div>
    );
}

const cip30walletsListLink = 'https://docs.muesliswap.com/cardano/cardano-wallets';

function WalletProviderListEmptyMessage() {
    return (
        <div className="h6 flex gap-2 rounded-lg bg-gray-100 p-8 text-gray-600">
            <OctagonAlert />
            <span>
                No Wallets found ! Click here to see a list of{' '}
                <Link
                    href={cip30walletsListLink}
                    target="_blank"
                    className="underline-offset-5 underline"
                >
                    CIP-30 Supported Wallets.{' '}
                </Link>
            </span>
        </div>
    );
}

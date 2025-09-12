import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { LAMPORTS_PER_SOL, PublicKey, } from "@solana/web3.js";
import { useEffect, useState } from "react";
export function Balance() {
    const { accounts, connection } = useSolanaWallet();
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchBalance = async () => {
        if (connection && accounts && accounts.length > 0) {
            try {
                setIsLoading(true);
                setError(null);
                const publicKey = new PublicKey(accounts[0]);
                const balance = await connection.getBalance(publicKey);
                setBalance(balance);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            }
            finally {
                setIsLoading(false);
            }
        }
    };
    useEffect(() => {
        fetchBalance();
    }, [connection, accounts]);
    return (_jsxs("div", { children: [_jsx("h2", { children: "Balance" }), _jsx("div", { children: balance !== null && `${balance / LAMPORTS_PER_SOL} SOL` }), isLoading && _jsx("span", { className: "loading", children: "Loading..." }), error && _jsxs("span", { className: "error", children: ["Error: ", error] }), _jsx("button", { onClick: fetchBalance, type: "submit", className: "card", children: "Fetch Balance" })] }));
}

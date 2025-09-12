import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSolanaWallet, useSignTransaction } from "@web3auth/modal/react/solana";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
export function SignTransaction() {
    const { data: signedTransaction, error, loading: isPending, signTransaction, } = useSignTransaction();
    const { accounts, connection } = useSolanaWallet();
    async function submit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const to = formData.get('address');
        const value = formData.get('value');
        const block = await connection.getLatestBlockhash();
        const TransactionInstruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(accounts[0]),
            toPubkey: new PublicKey(to),
            lamports: Number(value) * LAMPORTS_PER_SOL,
        });
        const transaction = new Transaction({
            blockhash: block.blockhash,
            lastValidBlockHeight: block.lastValidBlockHeight,
            feePayer: new PublicKey(accounts[0]),
        }).add(TransactionInstruction);
        signTransaction(transaction);
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Sign Transaction" }), _jsxs("form", { onSubmit: submit, children: [_jsx("input", { name: "address", placeholder: "Address", required: true }), _jsx("input", { name: "value", placeholder: "Amount (SOL)", type: "number", step: "0.01", required: true }), _jsx("button", { disabled: isPending, type: "submit", children: isPending ? 'Signing...' : 'Sign' })] }), signedTransaction && _jsxs("div", { children: ["Signed Trasaction: ", signedTransaction] }), error && (_jsxs("div", { children: ["Error: ", error.message] }))] }));
}

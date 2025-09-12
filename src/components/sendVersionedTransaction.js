import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSolanaWallet, useSignAndSendTransaction } from "@web3auth/modal/react/solana";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
export function SendVersionedTransaction() {
    const { data: hash, error, loading: isPending, signAndSendTransaction } = useSignAndSendTransaction();
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
        const transactionMessage = new TransactionMessage({
            recentBlockhash: block.blockhash,
            instructions: [TransactionInstruction],
            payerKey: new PublicKey(accounts[0]),
        });
        const transaction = new VersionedTransaction(transactionMessage.compileToV0Message());
        signAndSendTransaction(transaction);
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Send Versioned Transaction" }), _jsxs("form", { onSubmit: submit, children: [_jsx("input", { name: "address", placeholder: "Address", required: true }), _jsx("input", { name: "value", placeholder: "Amount (SOL)", type: "number", step: "0.01", required: true }), _jsx("button", { disabled: isPending, type: "submit", children: isPending ? 'Confirming...' : 'Send' })] }), hash && _jsxs("div", { children: ["Transaction Hash: ", hash] }), error && (_jsxs("div", { children: ["Error: ", error.message] }))] }));
}

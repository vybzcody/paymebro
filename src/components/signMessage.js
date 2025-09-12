import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSignMessage } from "@web3auth/modal/react/solana";
export function SignMessage() {
    const { data: hash, error, loading: isPending, signMessage } = useSignMessage();
    async function submit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const message = formData.get('message');
        signMessage(message.toString());
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Sign Message" }), _jsxs("form", { onSubmit: submit, children: [_jsx("input", { name: "message", placeholder: "Message", required: true }), _jsx("button", { disabled: isPending, type: "submit", children: isPending ? 'Signing...' : 'Sign' })] }), hash && _jsxs("div", { className: "hash", children: ["Message Hash: ", hash] }), error && (_jsxs("div", { className: "error", children: ["Error: ", error.message] }))] }));
}

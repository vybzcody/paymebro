import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSwitchChain, useWeb3Auth } from '@web3auth/modal/react';
export function SwitchChain() {
    const { web3Auth } = useWeb3Auth();
    const { switchChain, error } = useSwitchChain();
    return (_jsxs("div", { children: [_jsx("h2", { children: "Switch Chain" }), _jsxs("h3", { children: ["Connected to ", web3Auth?.currentChain?.displayName] }), web3Auth?.coreOptions.chains?.map((chain) => {
                if (chain.chainId === "0x67" || chain.chainId === "0x66" || chain.chainId === "0x65") {
                    return (_jsx("button", { disabled: web3Auth?.currentChain?.chainId === chain.chainId, onClick: () => switchChain(chain.chainId), type: "button", className: "card", children: chain.displayName }, chain.chainId));
                }
            }), error?.message] }));
}

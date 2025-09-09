interface User {
    name?: string;
    email?: string;
    profileImage?: string;
}
interface NavbarProps {
    user: User | null;
    address?: string;
    network?: string;
    onLogout: () => void;
}
export declare function Navbar({ user, address, network, onLogout }: NavbarProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=navbar.d.ts.map
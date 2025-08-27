import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Fast transition without loading state
    setIsVisible(false);
    
    // Use requestAnimationFrame for immediate transition
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [location.pathname]);

  return (
    <div 
      className={`transition-all duration-150 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-1'
      }`}
    >
      {children}
    </div>
  );
};

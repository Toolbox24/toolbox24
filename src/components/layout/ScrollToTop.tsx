import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log("ScrollToTop triggered for:", pathname);
    // Delay scroll to ensure DOM is ready
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      console.log("Scrolled to top");
    }, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
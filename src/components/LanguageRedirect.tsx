import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LanguageRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're on the root path without language prefix
    if (location.pathname === "/") {
      navigate("/de/", { replace: true });
    }
    // Check if we're on any path without language prefix that should have one
    else if (!location.pathname.startsWith("/de/") && !location.pathname.startsWith("/en/")) {
      // Only redirect if this is not already a 404 or specific route
      const path = location.pathname;
      if (!path.includes("/404") && path !== "*") {
        navigate(`/de${path}${location.search}${location.hash}`, { replace: true });
      }
    }
  }, [navigate, location.pathname, location.search, location.hash]);

  return null;
};

export default LanguageRedirect;
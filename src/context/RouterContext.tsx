import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  activeSlug?: string;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

export const useRouter = () => useContext(RouterContext);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('#')) {
      const el = document.querySelector(path);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Determine active slug if on /treatments/:slug, /shop/:slug, /admin/appointments/:id, or /admin/orders/:id
  let activeSlug: string | undefined;
  if (currentPath.startsWith('/treatments/') && currentPath !== '/treatments/') {
    activeSlug = currentPath.replace('/treatments/', '').replace(/\/$/, '');
  } else if (currentPath.startsWith('/shop/') && currentPath !== '/shop/') {
    activeSlug = currentPath.replace('/shop/', '').replace(/\/$/, '');
  } else if (currentPath.startsWith('/admin/appointments/') && currentPath !== '/admin/appointments/') {
    activeSlug = currentPath.replace('/admin/appointments/', '').replace(/\/$/, '');
  } else if (currentPath.startsWith('/admin/orders/') && currentPath !== '/admin/orders/') {
    activeSlug = currentPath.replace('/admin/orders/', '').replace(/\/$/, '');
  }

  return (
    <RouterContext.Provider value={{ currentPath, navigate, activeSlug }}>
      {children}
    </RouterContext.Provider>
  );
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Link({ to, href, className, children, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  const targetPath = to || href || '/';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !targetPath.startsWith('http') && !targetPath.startsWith('tel:') && !targetPath.startsWith('mailto:')) {
      e.preventDefault();
      navigate(targetPath);
    }
  };

  return (
    <a href={targetPath} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}

import { NavItem, NavItemProps } from "_client/layout/navItem";
import { TelemetryLink } from "_client/telemetryLink";

import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useCallback, useState } from "react";
import { ToggleStatsButton } from "./toggleStatsButton";
import { ToggleThemeButton } from "./toggleThemeButton";

type HeaderProps = {
  logo: {
    alt: string;
    href: string;
    src: string;
  };
  nav: Omit<NavItemProps, "active">[];
};

function getParentNodeByClass(target: HTMLElement, className: string, i = 0) {
  if (i > 20) {
    return false;
  }
  if (target?.classList?.contains(className)) {
    return target;
  }
  if (target.parentNode) {
    return getParentNodeByClass(target.parentNode as HTMLElement, className, i++);
  }
  return false;
}

const initialNavPosition = { width: 0, left: 0, opacity: 0, transition: "0.1s opacity" };

export const Header: FC<HeaderProps> = ({ nav, logo }) => {
  const router = useRouter();
  const [navHover, setNavHover] = useState(initialNavPosition);

  const handleNavHover = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setNavHover(() => initialNavPosition);
    }
    if (e.target !== e.currentTarget) {
      const navItemRef = getParentNodeByClass(e.target, "nav-item");
      if (navItemRef) {
        setNavHover(({ opacity }) => ({
          width: navItemRef.offsetWidth,
          left: navItemRef.offsetLeft,
          opacity: 0.7,
          transition: opacity ? "0.18s" : "0.1s opacity",
        }));
      }
    }
  }, []);

  const handleNavFocus = useCallback((e) => {
    if (!e.currentTarget.matches(":focus-within")) {
      setNavHover(() => initialNavPosition);
      return;
    }
    const navItemRef = getParentNodeByClass(e.target, "nav-item");
    if (navItemRef) {
      setNavHover((currentNavHover) => {
        const { opacity, left, width } = currentNavHover;
        if (left === navItemRef.offsetLeft && width === navItemRef.offsetWidth) {
          return currentNavHover;
        }
        return {
          width: navItemRef.offsetWidth,
          left: navItemRef.offsetLeft,
          opacity: 0.7,
          transition: opacity ? "0.18s" : "0.1s opacity",
        };
      });
    }
  }, []);

  return (
    <>
      <header className="h-header border-b border-gray-200 border-solid">
        <div className="flex px-2 mx-auto w-wrapper max-w-full">
          <div className="flex items-center h-header">
            <TelemetryLink href={logo.href} name="headerLogo">
              <Image alt={logo.alt} height={66} src={logo.src} width={110} />
            </TelemetryLink>
          </div>
          <nav
            className="flex overflow-auto relative mt-[2px] ml-4 scrollbar-none"
            onBlur={handleNavFocus}
            onMouseLeave={() => setNavHover(() => initialNavPosition)}
            onMouseOver={handleNavHover}
          >
            <div
              className="absolute top-1/2 z-0 h-8 bg-gray-200 rounded opacity-60 transform -translate-y-1/2"
              style={{
                width: `${navHover.width}px`,
                left: `${navHover.left}px`,
                transition: navHover.transition,
                opacity: navHover.opacity,
              }}
            />
            {nav.map((navItem, i) => (
              <NavItem
                key={navItem.href + navItem.name + i}
                active={router.asPath === navItem.href}
                href={navItem.href}
                name={navItem.name}
                onFocus={handleNavFocus}
              />
            ))}
          </nav>
          <nav className="flex items-center ml-auto">
            <ToggleThemeButton className="mr-2" />
            <ToggleStatsButton />
          </nav>
        </div>
      </header>
    </>
  );
};

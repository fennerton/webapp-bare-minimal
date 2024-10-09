import { Link } from "react-router-dom";
import { ReactElement, useEffect, useState } from "react";
import { AppRoute, privateRoutes } from "../routes/route.config";
import { useBoundStore } from "../states/bound.store";

type SideNavGroup = {
  name: string;
  items: SideNavItem[];
};

type SideNavItem = {
  name: string;
  path: string;
  icon: ReactElement;
  showBadge?: boolean;
};

export const SideNavigation = () => {
  const sideNavDisplay = useBoundStore().displaySideNav;

  const [sideNavGroups, setSideNavGroups] = useState<SideNavGroup[]>([]);

  useEffect(() => {
    const allSideNavRoutes: AppRoute[] = [];
    const collectSideNav = (appRoute: AppRoute, parentUrl: string) => {
      if (appRoute.sideNav) {
        const canAccess = appRoute.canAccess ? appRoute.canAccess : () => true;
        if (canAccess()) {
          allSideNavRoutes.push({
            ...appRoute,
            path:
              parentUrl +
              (!parentUrl.length || parentUrl.endsWith("/") ? "" : "/") +
              appRoute.path,
          });
        }
      }
      if (appRoute.children) {
        appRoute.children.forEach((c) => collectSideNav(c, appRoute.path));
      }
    };
    privateRoutes.forEach((ap) => collectSideNav(ap, ""));
    const groups: SideNavGroup[] = [];
    allSideNavRoutes.forEach((r) => {
      const sideNav = r.sideNav;
      if (!!sideNav) {
        const existingGroup = groups.find((g) => g.name === sideNav.group);
        if (!!existingGroup) {
          existingGroup.items.push({
            name: sideNav.displayName,
            icon: sideNav.icon,
            path: r.path,
          });
        } else {
          groups.push({
            name: sideNav.group,
            items: [
              { name: sideNav.displayName, icon: sideNav.icon, path: r.path },
            ],
          });
        }
      }
    });
    setSideNavGroups(groups);
  }, []);

  const NavSection = (navGroup: SideNavGroup, key: number) => {
    const NavItem = (navItem: SideNavItem, itemKey: number) => {
      return (
        <li className="mb-1 group" key={itemKey}>
          <Link
            to={navItem.path}
            className="flex font-semibold items-center py-2 px-4 text-gray-900 hover:bg-gray-950 hover:text-gray-100 rounded-md group-[.active]:bg-gray-800 group-[.active]:text-white group-[.selected]:bg-gray-950 group-[.selected]:text-gray-100"
          >
            <span className="mr-3 text-lg">{navItem.icon}</span>
            <span className="text-sm">{navItem.name}</span>
          </Link>
        </li>
      );
    };
    return (
      <div key={key}>
        <span className="text-gray-400 font-bold">{navGroup.name}</span>
        {navGroup.items.map((item, i) => NavItem(item, i))}
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed left-0 top-0 w-64 h-full bg-primary-foreground p-4 z-50 transition-transform overflow-y-auto ${sideNavDisplay ? "" : "hidden"}`}
      >
        <Link
          to="/"
          className="flex items-center pb-4 border-b border-b-gray-800"
        >
          <h2 className="font-bold text-2xl">
            Logo{" "}
            <span className="bg-accent text-white px-2 rounded-md">Here</span>
          </h2>
        </Link>
        <ul className="mt-4">
          {sideNavGroups.map((g, i) => NavSection(g, i))}
        </ul>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-40 md:hidden sidebar-overlay"></div>
    </>
  );
};

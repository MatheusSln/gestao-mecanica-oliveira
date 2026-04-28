import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Wrench, Package, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MobileLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Recibos (OS)', path: '/recibos', icon: Wrench },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Equipe', path: '/equipe', icon: Users },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <header className="bg-primary text-primary-foreground p-4 shadow-md z-10 sticky top-0">
        <h1 className="text-lg font-bold text-center">Gestão Mecânica Oliveira</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 pb-safe z-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
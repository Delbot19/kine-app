import React, { useState } from 'react';
import KineSidebar from '@/components/kine/KineSidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const ProLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-[#1e3a5f]">PhysioCenter</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <KineSidebar className="flex h-full w-full" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Hidden on mobile via CSS classes in KineSidebar default) */}
      <KineSidebar />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ProLayout;

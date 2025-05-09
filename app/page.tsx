// app/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';

export default function Page() {
  const [section, setSection] = useState<0 | 1>(0);
  const overscroll = useRef(0);
  const touchStartY = useRef<number | null>(null);

  // Baja el threshold para que en móviles funcione:
  const threshold = 80; // px

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  // --- Desktop wheel handler ---
  const handleWheel = (e: React.WheelEvent) => {
    const ref = section === 0 ? section1Ref.current : section2Ref.current;
    if (!ref) return;
    const { scrollTop, clientHeight, scrollHeight } = ref;

    // avanzar si estás al fondo y scrolleas hacia abajo
    if (section === 0 && scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
      overscroll.current += e.deltaY;
      if (overscroll.current > threshold) {
        setSection(1);
        overscroll.current = 0;
      }
      return;
    }
    // volver si estás al tope y scrolleas hacia arriba
    if (section === 1 && scrollTop <= 0 && e.deltaY < 0) {
      overscroll.current += e.deltaY;
      if (overscroll.current < -threshold) {
        setSection(0);
        overscroll.current = 0;
      }
      return;
    }

    // en cualquier otro caso, reinicia
    overscroll.current = 0;
  };

  // --- Mobile touch handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    overscroll.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;

    const ref = section === 0 ? section1Ref.current : section2Ref.current;
    if (!ref) return;
    const { scrollTop, clientHeight, scrollHeight } = ref;

    // swipe-up en sección 1
    if (section === 0 && scrollTop + clientHeight >= scrollHeight && deltaY > 0) {
      overscroll.current += deltaY;
      if (overscroll.current > threshold) {
        setSection(1);
        overscroll.current = 0;
      }
    }
    // swipe-down en sección 2
    else if (section === 1 && scrollTop <= 0 && deltaY < 0) {
      overscroll.current += deltaY;
      if (overscroll.current < -threshold) {
        setSection(0);
        overscroll.current = 0;
      }
    } else {
      overscroll.current = 0;
    }

    touchStartY.current = currentY;
  };
  const handleTouchEnd = () => {
    touchStartY.current = null;
    overscroll.current = 0;
  };

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-screen h-[100dvh] overflow-hidden"
    >
      <motion.div
        className="flex flex-col"
        animate={{ y: section === 0 ? '0' : '-100dvh' }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        {/* Sección 1: HomePage */}
        <div
          ref={section1Ref}
          className="h-[100dvh] overflow-y-auto"
        >
          <HomePage isHomeSection={section === 0} />
        </div>

        {/* Sección 2: CouponsPage */}
        <div
          ref={section2Ref}
          className="h-[100dvh] overflow-y-auto"
        >
          <CouponsPage />
        </div>
      </motion.div>
    </div>
  );
}

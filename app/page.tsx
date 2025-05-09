// app/page.tsx o donde tengas tu Page
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage';

export default function Page() {
  const [height, setHeight] = useState(0);
  const [section, setSection] = useState<0 | 1>(0);
  const threshold = 1000;

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const overscroll = useRef(0);

  // medir altura del viewport
  useEffect(() => {
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // maneja rueda (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    const ref = section === 0 ? section1Ref.current : section2Ref.current;
    if (!ref) return;

    const { scrollTop, clientHeight, scrollHeight } = ref;
    // avanzar sección
    if (section === 0 && scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
      overscroll.current += e.deltaY;
      if (overscroll.current > threshold) {
        setSection(1);
        overscroll.current = 0;
      }
      return;
    }
    // volver sección
    if (section === 1 && scrollTop <= 0 && e.deltaY < 0) {
      overscroll.current += e.deltaY;
      if (overscroll.current < -threshold) {
        setSection(0);
        overscroll.current = 0;
      }
      return;
    }

    overscroll.current = 0;
  };

  // touchstart (móvil)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    overscroll.current = 0;
  };

  // touchmove (móvil)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY.current - currentY;

    const ref = section === 0 ? section1Ref.current : section2Ref.current;
    if (!ref) return;
    const { scrollTop, clientHeight, scrollHeight } = ref;

    // swipe up para avanzar
    if (section === 0 && scrollTop + clientHeight >= scrollHeight && deltaY > 0) {
      overscroll.current += deltaY;
      if (overscroll.current > threshold) {
        setSection(1);
        overscroll.current = 0;
      }
    }
    // swipe down para volver
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

  // touchend limpia
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
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <motion.div
        style={{ display: 'flex', flexDirection: 'column' }}
        animate={{ y: -section * height }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        {/* Sección 1 */}
        <div ref={section1Ref} style={{ height, overflowY: 'auto' }}>
          <HomePage isHomeSection={section === 0} />
        </div>

        {/* Sección 2 */}
        <div ref={section2Ref} style={{ height, overflowY: 'auto' }}>
          <CouponsPage />
        </div>
      </motion.div>
    </div>
  );
}

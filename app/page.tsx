'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HomePage from '@/components/HomePage';
import CouponsPage from '@/components/CouponsPage'; // <-- Importa el nuevo componente

export default function Page() {
  const [height, setHeight] = useState(0);
  const [section, setSection] = useState<0 | 1>(0);
  const [overscroll, setOverscroll] = useState(0);
  const threshold = 1000;

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  // medir altura del viewport
  useEffect(() => {
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    const ref = section === 0 ? section1Ref.current : section2Ref.current;
    if (!ref) return;
    const { scrollTop, clientHeight, scrollHeight } = ref;

    // avanzar a sección 2
    if (section === 0 && scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
      setOverscroll(prev => {
        const next = prev + e.deltaY;
        if (next > threshold) {
          setSection(1);
          return 0;
        }
        return next;
      });
      return;
    }

    // volver a sección 1
    if (section === 1 && scrollTop <= 0 && e.deltaY < 0) {
      setOverscroll(prev => {
        const next = prev + e.deltaY;
        if (next < -threshold) {
          setSection(0);
          return 0;
        }
        return next;
      });
      return;
    }

    setOverscroll(0);
  };

  return (
    <div
      onWheel={handleWheel}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <motion.div
        style={{ display: 'flex', flexDirection: 'column' }}
        animate={{ y: -section * height }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        {/* Sección 1: HomePage */}
        <div ref={section1Ref} style={{ height, overflowY: 'auto' }}>
          <HomePage isHomeSection={section === 0} />
        </div>

        {/* Sección 2: CouponsPage */}
        <div
          ref={section2Ref}
          style={{
            height,
            overflowY: 'auto',
          }}
        >
          <CouponsPage />
        </div>
      </motion.div>
    </div>
  );
}

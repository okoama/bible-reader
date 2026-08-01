import { useEffect, useState } from 'react';
import type { Prayer } from '../../types';
import { PrayerRepository } from '../repositories/PrayerRepository';

const prayerRepository = new PrayerRepository();

export function usePrayers(refreshKey = 0): { prayers: Prayer[]; loading: boolean } {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const load = async () => {
      try {
        const all = await prayerRepository.findAll();
        if (isActive) {
          setPrayers(all);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return { prayers, loading };
}

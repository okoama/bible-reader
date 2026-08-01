import { useEffect, useState } from 'react';
import type { Prayer } from '../../types';
import { PrayerRepository } from '../repositories/PrayerRepository';

const prayerRepository = new PrayerRepository();

export function usePrayers(refreshKey = 0): Prayer[] {
  const [prayers, setPrayers] = useState<Prayer[]>([]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const all = await prayerRepository.findAll();
      if (isActive) {
        setPrayers(all);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  return prayers;
}

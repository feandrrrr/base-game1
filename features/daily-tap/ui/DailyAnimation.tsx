'use client';

import styles from './DailyTap.module.css';

const DAY_THEMES = [
  { day: 'Sunday', label: 'Aurora Burst' },
  { day: 'Monday', label: 'Blue Pulse' },
  { day: 'Tuesday', label: 'Orbital Sweep' },
  { day: 'Wednesday', label: 'Wave Bloom' },
  { day: 'Thursday', label: 'Nebula Drift' },
  { day: 'Friday', label: 'Starlight Flash' },
  { day: 'Saturday', label: 'Solar Crown' },
];

export function DailyAnimation() {
  const index = new Date().getUTCDay();
  const theme = DAY_THEMES[index];

  return (
    <div className={styles.animation}>
      <div className={styles.orb} />
      <div className={styles.ring} />
      <div className={styles.spark} />
      <div className={styles.caption}>
        <strong>{theme.day}</strong>
        <span>{theme.label}</span>
      </div>
    </div>
  );
}

import { GAME_COPY } from '@/shared/config/game';
import { LinkButton } from '@/shared/ui/LinkButton';

import styles from './Menu.module.css';

export function Menu() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <p className={styles.kicker}>Base mini app</p>
        <h1>{GAME_COPY.title}</h1>
        <p className={styles.slogan}>{GAME_COPY.slogan}</p>
      </header>

      <div className={styles.actions}>
        <LinkButton fullWidth href="/leaderboards">
          Leaderboards
        </LinkButton>
        <LinkButton fullWidth href="/mode-daily" variant="ghost">
          Daily Onchain Tap
        </LinkButton>
        <LinkButton fullWidth href="/mode-rapid" variant="ghost">
          Rapid Tap Sprint
        </LinkButton>
      </div>
    </div>
  );
}

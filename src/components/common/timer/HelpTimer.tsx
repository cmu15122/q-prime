import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { Id } from '../../../../convex/_generated/dataModel';

export type HelpTimerProps = {
  /** Start time as a `Date` or epoch ms. The chip self-ticks every second when set. */
  startTime?: Date | number;
  /** Externally tracked elapsed milliseconds. When provided, overrides self-ticking. */
  elapsedMs?: number;
  className?: string;
  helpingTa: {
    zoom_url?: string | undefined;
    preferred_name: string;
    zoom_enabled: boolean;
    ta_id: Id<"tas">;
  }
};

const Root = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontFamily: theme.fonts.mono,
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '0.02em',
  color: theme.palette.forest.main,
  lineHeight: 1,
}));

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const formatElapsed = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

const toEpoch = (start: Date | number): number => (start instanceof Date ? start.getTime() : start);

export default function HelpTimer(props: HelpTimerProps): JSX.Element {
  const { startTime, elapsedMs, className, helpingTa } = props;
  const externallyControlled = elapsedMs !== undefined;

  const computeFromStart = React.useCallback((): number => {
    if (startTime === undefined) return 0;
    return Math.max(0, Date.now() - toEpoch(startTime));
  }, [startTime]);

  const [tick, setTick] = React.useState<number>(() =>
    externallyControlled ? 0 : computeFromStart(),
  );

  React.useEffect(() => {
    if (externallyControlled || startTime === undefined) return undefined;
    setTick(computeFromStart());
    const id = window.setInterval(() => {
      setTick(computeFromStart());
    }, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [externallyControlled, startTime, computeFromStart]);

  const display = externallyControlled ? (elapsedMs as number) : tick;

  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {helpingTa.preferred_name} helping
      </Typography>
      <Root className={className}>
        <span className="ohq-helptimer__dot" aria-hidden="true" />
        <span>{formatElapsed(display)}</span>
      </Root>
    </>
  );
}

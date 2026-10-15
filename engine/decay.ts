import { DecayState, TidySettings } from './types.js';

export function calculateDecay(
  fileAgeMs: number,
  isInstallerOrArchive: boolean,
  settings: TidySettings
): { decayState: DecayState; daysUntilDecay: number } {
  if (!settings.enableDecay || !isInstallerOrArchive) {
    return { decayState: 'exempt', daysUntilDecay: 999 };
  }

  const ageDays = fileAgeMs / (1000 * 60 * 60 * 24);
  const daysUntilDecay = Math.max(0, Math.ceil(settings.decayDays - ageDays));

  if (ageDays >= settings.decayDays) {
    return { decayState: 'expired', daysUntilDecay: 0 };
  }

  if (daysUntilDecay <= settings.expiringThresholdDays) {
    return { decayState: 'expiring', daysUntilDecay };
  }

  return { decayState: 'active', daysUntilDecay };
}

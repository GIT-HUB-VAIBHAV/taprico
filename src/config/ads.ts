/**
 * Centralized Google AdSense Configuration for taprico.com
 *
 * IMPORTANT FOR ADSENSE APPROVAL:
 * Keep `enabled: false` while submitting your domain for initial Google AdSense review
 * so reviewers never see empty placeholder ad boxes. Once approved, set `enabled: true`,
 * paste your `ca-pub-...` Publisher ID, and add your Ad Unit Slot IDs below + in `public/ads.txt`.
 */
export const ADS_CONFIG = {
  enabled: false,
  publisherId: 'ca-pub-0000000000000000',
  slots: {
    toolTopLeaderboard: {
      slotId: '1111111111',
      format: 'horizontal',
      minHeightClass: 'min-h-[90px]',
    },
    toolInContent: {
      slotId: '2222222222',
      format: 'auto',
      minHeightClass: 'min-h-[120px] md:min-h-[250px]',
    },
    guideSidebar: {
      slotId: '3333333333',
      format: 'rectangle',
      minHeightClass: 'min-h-[250px]',
    },
  },
} as const;

export type AdSlotKey = keyof typeof ADS_CONFIG.slots;

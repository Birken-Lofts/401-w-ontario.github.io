// <progress-feed> is a custom element defined by the progress-photos service's
// embed.js (see app/progress/page.tsx); declare it so TSX accepts the tag.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'progress-feed': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        project: string;
      };
    }
  }
}

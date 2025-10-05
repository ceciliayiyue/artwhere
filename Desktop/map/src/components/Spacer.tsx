import React from 'react';

type SpacerProps = {
  /** CSS height value (e.g. '64px', '4rem', 'var(--top-strip-height)') */
  height?: string;
  className?: string;
};

const Spacer: React.FC<SpacerProps> = ({ height = 'var(--top-strip-height)', className }) => {
  return <div aria-hidden="true" style={{ height }} className={className} />;
};

export default Spacer;

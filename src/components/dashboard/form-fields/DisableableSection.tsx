import React from 'react';

interface DisableableSectionProps {
  isDisabled: boolean;
  children: React.ReactNode;
}

export const DisableableSection: React.FC<DisableableSectionProps> = ({ 
  isDisabled, 
  children 
}) => (
  <div className={isDisabled ? "opacity-60 pointer-events-none" : ""}>
    {isDisabled && (
      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          This section is auto-filled from your existing voter record for non-registration applications.
        </p>
      </div>
    )}
    {children}
  </div>
);

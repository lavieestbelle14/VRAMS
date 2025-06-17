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
    {children}
  </div>
);
        

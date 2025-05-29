
'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password?: string;
}

const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL_CHAR = /[^A-Za-z0-9]/;

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) {
    return (
      <div className="space-y-1 mt-2">
        <Progress value={0} className="h-2" aria-label="Password strength: Enter password" />
        <p className="text-xs text-muted-foreground">Enter password to see strength.</p>
      </div>
    );
  }

  let strengthScore = 0;
  const checks = [];

  if (password.length >= MIN_LENGTH) {
    strengthScore++;
    checks.push("At least 8 characters");
  }
  if (HAS_UPPERCASE.test(password)) {
    strengthScore++;
    checks.push("At least one uppercase letter");
  }
  if (HAS_LOWERCASE.test(password)) {
    strengthScore++;
    checks.push("At least one lowercase letter");
  }
  if (HAS_NUMBER.test(password)) {
    strengthScore++;
    checks.push("At least one number");
  }
  if (HAS_SPECIAL_CHAR.test(password)) {
    strengthScore++;
    checks.push("At least one special character");
  }

  let strengthText = 'Very Weak';
  let strengthColorClass = 'bg-destructive'; // Red for very weak

  if (strengthScore === 1) {
    strengthText = 'Weak';
    strengthColorClass = 'bg-destructive';
  } else if (strengthScore === 2) {
    strengthText = 'Weak';
    strengthColorClass = 'bg-orange-500';
  } else if (strengthScore === 3) {
    strengthText = 'Medium';
    strengthColorClass = 'bg-yellow-500';
  } else if (strengthScore === 4) {
    strengthText = 'Strong';
    strengthColorClass = 'bg-green-500';
  } else if (strengthScore === 5) {
    strengthText = 'Very Strong';
    strengthColorClass = 'bg-green-600';
  }
  
  // Handle case where password has some length but doesn't meet the 8-char minimum yet
  if (password.length > 0 && password.length < MIN_LENGTH && strengthScore <=1){
     strengthText = 'Very Weak';
     strengthColorClass = 'bg-destructive';
     // Adjust score so it's not 0 if other criteria are met but length isn't
     strengthScore = (password.length > 0 && strengthScore === 0) ? 0 : strengthScore;
  }


  const progressValue = password.length === 0 ? 0 : (strengthScore / 5) * 100;

  return (
    <div className="space-y-1 mt-2">
      <Progress
        value={progressValue}
        className={cn('h-2 transition-all duration-300 ease-in-out', strengthScore > 0 ? strengthColorClass : 'bg-muted')}
        aria-label={`Password strength: ${strengthText}`}
      />
      <p className={cn('text-xs',
        strengthColorClass === 'bg-destructive' && 'text-destructive',
        strengthColorClass === 'bg-orange-500' && 'text-orange-600 dark:text-orange-500',
        strengthColorClass === 'bg-yellow-500' && 'text-yellow-600 dark:text-yellow-500',
        (strengthColorClass === 'bg-green-500' || strengthColorClass === 'bg-green-600') && 'text-green-600 dark:text-green-500',
        strengthScore === 0 && password.length > 0 && 'text-destructive',
        !(strengthScore > 0 && password.length > 0) && 'text-muted-foreground'
      )}>
        Password strength: {strengthText}
      </p>
    </div>
  );
}

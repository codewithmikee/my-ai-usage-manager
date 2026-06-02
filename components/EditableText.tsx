import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  textClassName?: string;
  trigger?: 'click' | 'doubleClick';
  autoFocus?: boolean;
}

export function EditableText({ value, onChange, className, textClassName, trigger = 'doubleClick', autoFocus = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue.trim() !== value) {
      onChange(localValue.trim() || 'Untitled');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn('h-8 px-2 py-1 text-base', className)}
      />
    );
  }

  return (
    <div
      onClick={trigger === 'click' ? () => setIsEditing(true) : undefined}
      onDoubleClick={trigger === 'doubleClick' ? () => setIsEditing(true) : undefined}
      className={cn(
        'cursor-text rounded px-2 py-1 hover:bg-muted/50 transition-colors border border-transparent',
        textClassName,
        className
      )}
    >
      {value}
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmationMessage } from './ConfirmationMessage';

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  return <ConfirmationMessage status={status} message={message} />;
}
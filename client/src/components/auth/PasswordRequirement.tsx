import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  met: boolean;
  text: string;
}

const PasswordRequirement: React.FC<Props> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-300" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-500'}>
      {text}
    </span>
  </div>
);

export default PasswordRequirement;

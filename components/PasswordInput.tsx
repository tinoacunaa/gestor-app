"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Contraseña",
  required,
  className = "w-full border border-noche-100 rounded-lg px-3 py-2 text-sm",
  autoComplete,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${className} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-noche-400"
        tabIndex={-1}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}

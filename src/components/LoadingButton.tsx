import React from "react";
import { Button } from "./ui/button";
import { Loader2, Variable } from "lucide-react";

interface LoadingButtonProps {
  children: React.ReactNode;
  isPending: boolean;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  onClick?: () => void;
}

export default function LoadingButton({
  children,
  isPending,
  variant,
  onClick,
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      type="submit"
      variant={variant}
    >
      {isPending && <Loader2 className="animate-spin w-5 h-5" />}
      {children}
    </Button>
  );
}

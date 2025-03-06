import React from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps {
  children: React.ReactNode;
  isPending: boolean;
}

export default function LoadingButton({
  children,
  isPending,
}: LoadingButtonProps) {
  return (
    <Button disabled={isPending} type="submit">
      {isPending && <Loader2 className="animate-spin w-5 h-5" />}
      {children}
    </Button>
  );
}

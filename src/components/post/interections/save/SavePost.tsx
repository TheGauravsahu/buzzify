"use client";

import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getSavedPostDetails, toggleSavePost } from "@/actions/save.action";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavePostProps {
  postId: string;
  initialState: InitialState;
}
interface InitialState {
  isSavedByUser: boolean;
}

export default function SavePost({ postId, initialState }: SavePostProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["save-post", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getSavedPostDetails(postId),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: toggleSavePost,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<InitialState>(queryKey);

      queryClient.setQueryData(queryKey, () => ({
        isSavedByUser: !previousState?.isSavedByUser,
      }));

      return { previousState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast.error(error.message);
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => {
        mutate(postId);
      }}
    >
      <Bookmark className={data.isSavedByUser ? "fill-current" : "fill-none"} />
      Save
    </Button>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { createPost } from "@/actions/post.action";
import LoadingButton from "../general/LoadingButton";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ImageUploader from "../general/ImageUploader";
import { useState } from "react";

export const createPostSchema = z.object({
  description: z.string().min(1, "Description is required."),
  title: z.string().min(1, "Title is required.").max(255, "Title is too long."),
  image: z.string().url(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

export default function CreatePostForm() {
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      description: "",
      title: "",
      image: "",
    },
  });

  const onUploadSuccess = (url: string) => {
    setIsImageUploading(true);
    form.setValue("image", url);
    setIsImageUploading(false);
  };

  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setIsImageUploading(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(data: CreatePostData) {
    await mutation.mutate(data);
    router.push("/");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter post title." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter post description." {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({}) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <ImageUploader onUploadSuccess={onUploadSuccess} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          isPending={form.formState.isSubmitting || isImageUploading}
        >
          Add
        </LoadingButton>
      </form>
    </Form>
  );
}

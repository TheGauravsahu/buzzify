import CreatePostForm from "@/components/CreatePost";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreatePostPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>Your post will be public.</CardDescription>
      </CardHeader>
      <CardContent>
        <CreatePostForm />
      </CardContent>
    </Card>
  );
}

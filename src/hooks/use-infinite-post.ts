import { getPosts } from "@/actions/post.action";
import { useInfiniteQuery } from "@tanstack/react-query";

const useInfinitePost = () => {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) => getPosts({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export default useInfinitePost;

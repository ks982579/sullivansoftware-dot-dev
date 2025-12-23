import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/atom-one-light.css";
import "katex/dist/katex.min.css";

interface MdxContentProps {
  source: string;
}

export default function MdxContent({ source }: MdxContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-text-primary prose-a:text-primary prose-a:hover:text-secondary prose-a:transition-colors prose-strong:text-text-primary prose-code:text-text-primary prose-code:bg-gray-100 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-primary/20 katex-display">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeHighlight, rehypeKatex],
          },
        }}
      />
    </div>
  );
}

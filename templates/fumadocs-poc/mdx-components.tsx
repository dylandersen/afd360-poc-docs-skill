import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  const defaults =
    defaultMdxComponents && typeof defaultMdxComponents === 'object'
      ? defaultMdxComponents
      : {};

  return {
    ...defaults,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre className="fd-code-wrap">{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
  };
}

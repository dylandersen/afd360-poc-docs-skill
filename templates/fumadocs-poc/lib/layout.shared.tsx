import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <span className="font-semibold">__CUSTOMER_NAME__ — __POC_NAME__</span>
        </div>
      ),
      transparentMode: 'top',
    },
    links: [],
  };
}

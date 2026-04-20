import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { CustomerLogo } from '../components/customer-logo';
import { resolveTheme } from './resolve-theme';
import siteConfig from '../site.config';

export function baseOptions(): BaseLayoutProps {
  const theme = resolveTheme();
  return {
    nav: {
      title: (
        <div className="flex items-center gap-3">
          <CustomerLogo theme={theme} customerName={siteConfig.customer.name} />
          <span className="text-fd-muted-foreground">·</span>
          <span className="font-semibold">{siteConfig.poc.name}</span>
        </div>
      ),
      transparentMode: 'top',
    },
    links: [],
  };
}

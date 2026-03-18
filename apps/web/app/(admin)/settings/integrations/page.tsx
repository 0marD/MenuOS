import type { Metadata } from 'next';
import { getIntegrationKeys } from './actions';
import { IntegrationsForm } from './IntegrationsForm';

export const metadata: Metadata = { title: 'Integraciones' };

export default async function IntegrationsPage() {
  const keys = await getIntegrationKeys();

  return <IntegrationsForm keys={keys} />;
}

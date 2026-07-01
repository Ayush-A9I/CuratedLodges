import HomeClient from './HomeClient';
import { fetchHomepage } from '@/lib/homepageServer';

export default async function HomePage() {
  const initialData = await fetchHomepage();

  return <HomeClient initialData={initialData} />;
}

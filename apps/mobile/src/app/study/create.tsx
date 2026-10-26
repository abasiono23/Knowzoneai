import { CreateHome } from '@/components/materials/create-home';

/** Screen 62 as a standalone page (deep links, the Create menu). */
export default function CreateMaterialScreen() {
  return <CreateHome withTabBar={false} back />;
}

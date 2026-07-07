import rawDeals from './data/deals.json';
import type { Deal } from './types/deal';

const deals = rawDeals as Deal[];

export default function App() {
  return (
    <main>
      <p>{deals.length} deals loaded.</p>
    </main>
  );
}

import createMiddleware from '../create-middleware'
import { createMemoryHistory } from 'History'
export default createMiddleware(createMemoryHistory({ queryKey: false }));

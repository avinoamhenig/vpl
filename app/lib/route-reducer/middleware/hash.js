import createMiddleware from '../create-middleware'
import { createHashHistory } from 'History'
export default createMiddleware(createHashHistory({ queryKey: false }));

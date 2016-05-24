import createMiddleware from '../create-middleware'
import { createHistory } from 'History'
export default createMiddleware(createHistory({ queryKey: false }));

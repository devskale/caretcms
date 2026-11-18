import type { AuthorizationAction } from '../types.js';
import type { CmsMutationCommand } from './mutations/contracts.js';
export declare class PermissionDenied extends Error {
    constructor();
}
/** Absent policy preserves legacy authenticated-editor access. HTTP routes
 * still authenticate first; this helper never grants an anonymous session. */
export declare function canPerform(action: AuthorizationAction, collection?: string, id?: string): Promise<boolean>;
export declare function requirePermission(action: AuthorizationAction, collection?: string, id?: string): Promise<void>;
export declare function canMutate(command: CmsMutationCommand): Promise<boolean>;
//# sourceMappingURL=authorization.d.ts.map
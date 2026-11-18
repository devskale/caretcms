export interface CloudCmsClientConfig {
    endpoint: string;
    projectId: string;
    contentPath?: string;
    publicToken?: string;
    sessionToken?: string;
    environment?: string;
}
type Scope = {
    collection: string;
    id: string;
};
type Binding = {
    element: Element;
    collection: string;
    id: string;
    field: string;
    isImage: boolean;
    isRich: boolean;
    hasChildMarkup: boolean;
};
export declare function getNearestScope(element: Element): Scope | null;
export declare function resolveBindingValue(value: string, scope: Scope | null): Omit<Binding, "element" | "isImage" | "isRich" | "hasChildMarkup"> | null;
export declare function bootstrapCloudCms(config: CloudCmsClientConfig, root?: ParentNode): Promise<void>;
export declare function hasCloudCmsSession(config: CloudCmsClientConfig): boolean;
export declare function redirectToCloudCmsLogin(config: CloudCmsClientConfig, redirectTo?: string): void;
export {};
//# sourceMappingURL=browser-runtime.d.ts.map
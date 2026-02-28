export declare function initialize(): void;
export declare function getLoadedSkills(): {
    slug: string;
    name: string;
    version: string;
    isBuiltIn: boolean;
}[];
export declare function installSkill(source: string): {
    name: string;
    slug: string;
    version: string;
};
export declare function uninstallSkill(slug: string): boolean;
export declare function executeAction(slug: string, action: string, params: any, context: any): Promise<{
    success: boolean;
    result: string;
}>;
//# sourceMappingURL=skillManager.d.ts.map
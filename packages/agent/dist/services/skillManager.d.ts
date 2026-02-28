export interface Skill {
    slug: string;
    name: string;
    version: string;
    description?: string;
    isBuiltIn: boolean;
    installedAt?: string;
}
/**
 * Initialize the skill manager.
 */
export declare function initialize(): void;
/**
 * Get all loaded skills (built-in + user-installed).
 */
export declare function getLoadedSkills(): Skill[];
/**
 * Install a new skill from a source identifier.
 * Source can be a name/slug for known community skills.
 */
export declare function installSkill(source: string): Skill;
/**
 * Uninstall a user-installed skill. Built-in skills cannot be uninstalled.
 */
export declare function uninstallSkill(slug: string): boolean;
/**
 * Execute a skill action (placeholder for future dynamic skill execution).
 */
export declare function executeAction(slug: string, action: string, params: any, context: any): Promise<{
    success: boolean;
    result: string;
}>;
//# sourceMappingURL=skillManager.d.ts.map
import { SkillManifest } from '../types/database.types.js';
/**
 * Initialize the skill manager and load built-in skills.
 */
export declare function initialize(): void;
/**
 * Get all loaded skills.
 */
export declare function getLoadedSkills(): SkillManifest[];
/**
 * Get a skill by slug.
 */
export declare function getSkill(slug: string): SkillManifest | undefined;
/**
 * Install a skill from a source (GitHub URL or NiriumHub slug).
 */
export declare function installSkill(source: string): SkillManifest;
/**
 * Uninstall a skill (cannot uninstall built-in skills).
 */
export declare function uninstallSkill(slug: string): boolean;
/**
 * Execute an action on a skill.
 */
export declare function executeAction(slug: string, actionName: string, params: Record<string, unknown>, context: Record<string, unknown>): Promise<Record<string, unknown>>;
/**
 * Get all available actions across all skills for LLM prompt generation.
 */
export declare function getAvailableActions(): Array<{
    skill: string;
    action: string;
    description: string;
    parameters: SkillManifest['actions'][0]['parameters'];
}>;
/**
 * Generate a structured prompt of all available actions for LLM context.
 */
export declare function generateActionPrompt(): string;
//# sourceMappingURL=skillManager.d.ts.map
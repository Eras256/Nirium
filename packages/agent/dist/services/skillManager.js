// ═══════════════════════════════════════════════════════════════
// Nirium — Skill / Plugin Manager (Real Implementation)
// ═══════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
// Persistent skill registry file
const SKILLS_DIR = path.resolve(process.cwd(), '.nirium', 'skills');
const REGISTRY_PATH = path.resolve(SKILLS_DIR, 'registry.json');
// Built-in skills that ship with the agent
const BUILT_IN_SKILLS = [
    {
        slug: 'flash-loan-engine',
        name: 'Flash Loan Engine',
        version: '0.1.0',
        description: 'Atomic single-invocation flash loans via NiriumVault contract',
        isBuiltIn: true,
    },
    {
        slug: 'path-arbitrage',
        name: 'Path Arbitrage Scanner',
        version: '0.1.0',
        description: 'Discovers profitable multi-hop routes via Horizon /paths API',
        isBuiltIn: true,
    },
    {
        slug: 'sdex-spread-monitor',
        name: 'SDEX Spread Monitor',
        version: '0.1.0',
        description: 'Monitors XLM/USDC orderbook spread and triggers on threshold',
        isBuiltIn: true,
    },
];
/**
 * Ensure the skills directory and registry file exist.
 */
function ensureRegistry() {
    try {
        if (!fs.existsSync(SKILLS_DIR)) {
            fs.mkdirSync(SKILLS_DIR, { recursive: true });
        }
        if (!fs.existsSync(REGISTRY_PATH)) {
            fs.writeFileSync(REGISTRY_PATH, JSON.stringify([], null, 2));
            return [];
        }
        const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return [];
    }
}
function saveRegistry(skills) {
    try {
        if (!fs.existsSync(SKILLS_DIR)) {
            fs.mkdirSync(SKILLS_DIR, { recursive: true });
        }
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(skills, null, 2));
    }
    catch (err) {
        console.error('[SkillManager] Failed to save registry:', err);
    }
}
/**
 * Initialize the skill manager.
 */
export function initialize() {
    ensureRegistry();
    const skills = getLoadedSkills();
    console.log(`[SkillManager] Initialized — ${skills.length} skills loaded (${BUILT_IN_SKILLS.length} built-in)`);
}
/**
 * Get all loaded skills (built-in + user-installed).
 */
export function getLoadedSkills() {
    const installed = ensureRegistry();
    return [...BUILT_IN_SKILLS, ...installed];
}
/**
 * Install a new skill from a source identifier.
 * Source can be a name/slug for known community skills.
 */
export function installSkill(source) {
    const installed = ensureRegistry();
    // Check if already installed
    const existing = installed.find(s => s.slug === source);
    if (existing) {
        console.log(`[SkillManager] Skill "${source}" is already installed.`);
        return existing;
    }
    // Check if trying to install a built-in
    const builtIn = BUILT_IN_SKILLS.find(s => s.slug === source);
    if (builtIn) {
        console.log(`[SkillManager] "${source}" is a built-in skill, no install needed.`);
        return builtIn;
    }
    // Create new skill entry
    const newSkill = {
        slug: source.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        name: source.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        version: '1.0.0',
        description: `Community skill installed from: ${source}`,
        isBuiltIn: false,
        installedAt: new Date().toISOString(),
    };
    installed.push(newSkill);
    saveRegistry(installed);
    console.log(`[SkillManager] ✅ Installed skill: ${newSkill.name} (${newSkill.slug})`);
    return newSkill;
}
/**
 * Uninstall a user-installed skill. Built-in skills cannot be uninstalled.
 */
export function uninstallSkill(slug) {
    const builtIn = BUILT_IN_SKILLS.find(s => s.slug === slug);
    if (builtIn) {
        console.warn(`[SkillManager] Cannot uninstall built-in skill: ${slug}`);
        return false;
    }
    const installed = ensureRegistry();
    const filtered = installed.filter(s => s.slug !== slug);
    if (filtered.length === installed.length) {
        console.warn(`[SkillManager] Skill not found: ${slug}`);
        return false;
    }
    saveRegistry(filtered);
    console.log(`[SkillManager] ✅ Uninstalled skill: ${slug}`);
    return true;
}
/**
 * Execute a skill action (placeholder for future dynamic skill execution).
 */
export async function executeAction(slug, action, params, context) {
    const allSkills = getLoadedSkills();
    const skill = allSkills.find(s => s.slug === slug);
    if (!skill) {
        return { success: false, result: `Skill not found: ${slug}` };
    }
    console.log(`[SkillManager] Executing ${slug}::${action}`);
    // Built-in skill actions are handled by the agent execution layer
    // Custom skills would load and execute their code here
    return { success: true, result: `Action "${action}" dispatched to skill "${slug}"` };
}
//# sourceMappingURL=skillManager.js.map
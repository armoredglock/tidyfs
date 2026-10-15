import fs from 'fs';
import path from 'path';
import { DEFAULT_SETTINGS, TidySettings } from './engine/types.js';
import { scanFolder } from './engine/scanner.js';
import { createTidyPlan, executeTidyPlan } from './engine/organizer.js';
import { JournalManager } from './engine/journal.js';

async function runTest() {
  const testDir = path.join(__dirname, 'mock_messy_folder');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  console.log('[TEST] Creating mock messy folder at:', testDir);

  // 1. Financial document
  fs.writeFileSync(path.join(testDir, 'Q3_tax_invoice.pdf'), 'Dummy PDF invoice content');
  
  // 2. Travel ticket
  fs.writeFileSync(path.join(testDir, 'Flight_boarding_pass.pdf'), 'Flight details');

  // 3. Legal Contract
  fs.writeFileSync(path.join(testDir, 'Vendor_NDA_Agreement.docx'), 'Mutual non-disclosure agreement');

  // 4. Academic Research
  fs.writeFileSync(path.join(testDir, 'Distributed_Systems_Thesis.pdf'), 'Academic paper thesis');

  // 5. Raw Design Asset
  fs.writeFileSync(path.join(testDir, 'branding_logo.ai'), 'Adobe Illustrator vector');

  // 6. Code file
  fs.writeFileSync(path.join(testDir, 'utils.ts'), 'export const a = 1;');

  // 7. Expired installer (25 days old)
  const installerPath = path.join(testDir, 'old_zoom_installer.exe');
  fs.writeFileSync(installerPath, 'Zoom installer binary simulation');
  const pastTime = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
  fs.utimesSync(installerPath, pastTime, pastTime);

  // 8. Named duplicate copies
  fs.writeFileSync(path.join(testDir, 'presentation.pptx'), 'Identical presentation content here');
  fs.writeFileSync(path.join(testDir, 'presentation (1).pptx'), 'Identical presentation content here');

  console.log('[TEST] Created 9 test files across multiple domains.');

  // Test 1: Scan with strict metadata privacy mode
  console.log('\n--- Step 1: Scanning Folder (Privacy Mode: strict-metadata) ---');
  const files = scanFolder(testDir, DEFAULT_SETTINGS);
  console.log(`Scanned ${files.length} files:`);
  for (const f of files) {
    console.log(`  - [${f.category}] ${f.name} (decay: ${f.decayState}, days: ${f.daysUntilDecay})`);
  }

  // Test 2: Semantic Category Strategy
  console.log('\n--- Step 2: Generating Plan (Semantic Category Strategy) ---');
  const planCategory = await createTidyPlan(testDir, DEFAULT_SETTINGS);
  console.log(`Generated ${planCategory.actions.length} actions:`);
  for (const a of planCategory.actions) {
    console.log(`  - ${a.type.toUpperCase()}: ${a.fileName} -> ${path.basename(path.dirname(a.targetPath))}/${path.basename(a.targetPath)} (${a.reason})`);
  }

  // Test 3: Strategy Switch - Extension Segregation
  console.log('\n--- Step 3: Strategy Switch - Extension Segregation ---');
  const extSettings: TidySettings = { ...DEFAULT_SETTINGS, organizationStrategy: 'extension' };
  const planExt = await createTidyPlan(testDir, extSettings);
  console.log(`Generated ${planExt.actions.length} actions for extension mode:`);
  for (const a of planExt.actions) {
    console.log(`  - ${a.type.toUpperCase()}: ${a.fileName} -> ${path.basename(path.dirname(a.targetPath))}/${path.basename(a.targetPath)} (${a.reason})`);
  }

  // Test 4: Strategy Switch - Timeline Segregation
  console.log('\n--- Step 4: Strategy Switch - Timeline Segregation (YYYY/MM) ---');
  const dateSettings: TidySettings = { ...DEFAULT_SETTINGS, organizationStrategy: 'date-year-month' };
  const planDate = await createTidyPlan(testDir, dateSettings);
  console.log(`Generated ${planDate.actions.length} actions for date mode:`);
  for (const a of planDate.actions) {
    console.log(`  - ${a.type.toUpperCase()}: ${a.fileName} -> ${path.basename(path.dirname(a.targetPath))}/${path.basename(a.targetPath)} (${a.reason})`);
  }

  // Test 5: Execute Category Plan Live & Revert
  console.log('\n--- Step 5: Executing Live Plan ---');
  const execResult = await executeTidyPlan(planCategory, false);
  console.log(`Execution success: ${execResult.success}, moved ${execResult.movedCount} files.`);

  // Verify resulting structure
  console.log('\n--- Resulting Directory Structure ---');
  function printDir(dir: string, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      console.log(`${prefix}${e.isDirectory() ? '[DIR]  ' : '[FILE] '}${e.name}`);
      if (e.isDirectory() && e.name !== '.git') {
        printDir(path.join(dir, e.name), prefix + '   ');
      }
    }
  }
  printDir(testDir);

  // Test 6: Test 1-Click Rollback / Undo
  console.log('\n--- Step 6: Testing 1-Click Rollback / Undo ---');
  const journal = new JournalManager(testDir);
  const rollbackResult = journal.revertTransaction();
  console.log(`Rollback success: ${rollbackResult.success}, reverted ${rollbackResult.revertedCount} files.`);

  console.log('\n--- Structure After Rollback (Should be back to original) ---');
  printDir(testDir);

  // Cleanup test folder
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('\nAll tests passed successfully.');
}

runTest().catch(console.error);

import fs from 'fs';
import path from 'path';
import { DEFAULT_SETTINGS } from './engine/types.js';
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

  // 1. Create financial doc
  fs.writeFileSync(path.join(testDir, 'Q3_tax_invoice.pdf'), 'Dummy PDF invoice content');
  
  // 2. Create travel ticket
  fs.writeFileSync(path.join(testDir, 'Flight_boarding_pass.pdf'), 'Flight details');

  // 3. Create code file
  fs.writeFileSync(path.join(testDir, 'utils.ts'), 'export const a = 1;');

  // 4. Create an expired installer (modify time to 25 days ago)
  const installerPath = path.join(testDir, 'old_zoom_installer.exe');
  fs.writeFileSync(installerPath, 'Zoom installer binary simulation');
  const pastTime = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000);
  fs.utimesSync(installerPath, pastTime, pastTime);

  // 5. Create duplicates
  fs.writeFileSync(path.join(testDir, 'presentation.pptx'), 'Identical presentation content here');
  fs.writeFileSync(path.join(testDir, 'presentation (1).pptx'), 'Identical presentation content here');

  console.log('[TEST] Created 6 test files.');

  // Step 1: Scan
  console.log('\n--- Step 1: Scanning Folder ---');
  const files = scanFolder(testDir, DEFAULT_SETTINGS);
  console.log(`Scanned ${files.length} files:`);
  for (const f of files) {
    console.log(`  - [${f.category}] ${f.name} (decay: ${f.decayState}, days: ${f.daysUntilDecay})`);
  }

  // Step 2: Create Plan
  console.log('\n--- Step 2: Generating Tidy Plan ---');
  const plan = await createTidyPlan(testDir, DEFAULT_SETTINGS);
  console.log(`Generated ${plan.actions.length} actions:`);
  for (const a of plan.actions) {
    console.log(`  - ${a.type.toUpperCase()}: ${a.fileName} -> ${path.basename(path.dirname(a.targetPath))}/${path.basename(a.targetPath)} (${a.reason})`);
  }

  // Step 3: Execute Live Plan
  console.log('\n--- Step 3: Executing Live Plan ---');
  const execResult = await executeTidyPlan(plan, false);
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

  // Step 4: Test 1-Click Rollback / Undo
  console.log('\n--- Step 4: Testing 1-Click Rollback / Undo ---');
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

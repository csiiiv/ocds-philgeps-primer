import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";

const WORKSHOP_TEMPLATES: Array<{ file: string; title: string }> = JSON.parse(readFileSync(new URL("../../templates/workshop-templates.json", import.meta.url), "utf8"));

async function artifact(page: Page, label: string) {
  const browser = page.locator(".artifact-browser:visible").filter({ has: page.locator("option").filter({ hasText: new RegExp(`^${label}$`) }) });
  if (await browser.count()) {
    await browser.locator("select").selectOption({ label });
    if (!(await browser.locator("pre").isVisible())) await browser.getByRole("button", { name: "View JSON", exact: true }).click();
    return JSON.parse((await browser.locator("pre").textContent())!);
  }
  const summary = page.locator("summary").filter({ hasText: new RegExp(`^${label}$`) });
  const details = summary.locator("..");
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) await summary.click();
  await expect(details.locator("pre")).toBeVisible();
  return JSON.parse((await details.locator("pre").textContent())!);
}

async function timing(page: Page, publication?: string, record?: string) {
  await page.locator(".processing-settings > summary").click();
  if (publication) await page.getByRole("combobox", { name: "Publish releases", exact: true }).selectOption(publication);
  if (record) await page.getByRole("combobox", { name: "Generate records", exact: true }).selectOption(record);
  await page.locator(".processing-settings > summary").click();
}

async function inspect(page: Page, name: string) {
  await page.getByRole("tablist", { name: "Replay inspection" }).getByRole("tab", { name, exact: true }).click();
}

test("codelist decisions distinguish source meaning and missing evidence", async ({ page }) => {
  await page.goto("/#/mapping#codelists");
  await expect(page.getByRole("heading", { name: "Map the meaning, preserve the relationships" })).toBeVisible();
  await page.getByLabel("Explore a codelist").selectOption("contract-status");
  await expect(page.locator(".learning-card").filter({ hasText: "Contract status" })).toContainText("terminated");
  const questions = page.locator(".mapping-practice");
  await questions.nth(0).getByLabel("direct", { exact: true }).check();
  await questions.nth(0).getByRole("button", { name: "Check mapping" }).click();
  await expect(questions.nth(0).getByRole("status")).toContainText("Reconsider");
  for (const [index, value] of ["open", "Unresolved — needs clarification", "Unresolved — needs clarification", "direct"].entries()) {
    await page.getByLabel("Choose a mapping decision").selectOption({ index });
    await questions.nth(index).getByLabel(value, { exact: true }).check();
    await questions.nth(index).getByRole("button", { name: "Check mapping" }).click();
    await expect(questions.nth(index).getByRole("status")).toContainText("Supported decision");
  }
  await page.goto("/#/journey/3-mapped");
  await expect(page.getByRole("heading", { name: "Codelists: choose a code by its meaning" })).toBeVisible();
  await expect(page.getByText("In this synthetic example, DENR is both buyer and procuring entity.", { exact: false })).toBeVisible();
});

test("event replay preserves the original deadline and retains earlier fields", async ({ page }) => {
  await page.goto("/#/simulation");
  const next = page.getByRole("button", { name: "Next event", exact: true });
  await next.click();
  await expect(page.getByRole("status")).toContainText("1 release published");
  await next.click();
  await expect(page.getByRole("status")).toContainText("1 release published");
  await expect(page.getByRole("heading", { name: "A private draft note is edited", exact: true })).toBeVisible();
  await next.click();
  const record = await artifact(page, "Complete record JSON");
  expect(record.releases).toHaveLength(2);
  expect(record.releases[0].tender.tenderPeriod.endDate).toBe("2024-03-20T17:00:00+08:00");
  expect(record.compiledRelease.tender.tenderPeriod.endDate).toBe("2024-03-25T17:00:00+08:00");
  expect(record.versionedRelease.tender.tenderPeriod.endDate).toHaveLength(2);
  expect(record.compiledRelease.tender.title).toBe("Supply and Delivery of Laptop Computers");
  await page.getByRole("button", { name: "Reset replay" }).click();
  await expect(page.getByRole("status")).toContainText("0 releases published");
  await expect(page.getByRole("heading", { name: "No record generated yet" })).toBeVisible();
});

test("record rows open the exact included release JSON without advancing the replay", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#/simulation");
  await timing(page, undefined, "demand");
  const next = page.getByRole("button", { name: "Next event", exact: true });
  await next.click();
  await page.getByRole("button", { name: "Request record", exact: true }).click();
  await next.click();
  await next.click();
  await page.getByRole("tab", { name: "Release history", exact: true }).click();
  const index = page.getByRole("region", { name: "Record release index", exact: true });
  await expect(index.getByRole("button")).toHaveCount(1);
  const originalButton = index.getByRole("button", { name: "View JSON for release 001", exact: true });
  await originalButton.click();
  const inspector = page.getByRole("dialog", { name: "Release 001", exact: true });
  await expect(inspector.getByRole("button", { name: "JSON view", exact: true })).toHaveAttribute("aria-pressed", "true");
  const original = JSON.parse((await inspector.locator("pre").textContent())!);
  expect(original.id).toBe("001");
  expect(original.tender.tenderPeriod.endDate).toBe("2024-03-20T17:00:00+08:00");
  await expect(inspector.getByRole("button", { name: /^Next/ })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(originalButton).toBeFocused();
  await page.getByRole("button", { name: "Request record", exact: true }).click();
  const record = await artifact(page, "Complete record JSON");
  await expect(index.getByRole("button")).toHaveCount(2);
  await page.getByRole("button", { name: "Autoplay", exact: true }).click();
  const amendmentButton = index.getByRole("button", { name: "View JSON for release 002", exact: true });
  await amendmentButton.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("Release 002");
  expect(JSON.parse((await dialog.locator("pre").textContent())!)).toEqual(record.releases[1]);
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.clock.fastForward(6000);
  await dialog.getByRole("button", { name: /^Previous/ }).click();
  await expect(dialog).toHaveAccessibleName("Release 001");
  expect(JSON.parse((await dialog.locator("pre").textContent())!)).toEqual(record.releases[0]);
  await dialog.getByRole("button", { name: /^Next/ }).click();
  await expect(dialog).toHaveAccessibleName("Release 002");
  await dialog.getByRole("button", { name: "Close inspector", exact: true }).click();
  await expect(amendmentButton).toBeFocused();
  await expect(page.getByRole("status")).toContainText("3 / 8 events observed · 2 releases published");
  await expect(page.getByRole("button", { name: "Autoplay", exact: true })).toBeVisible();
  expect(await artifact(page, "Complete record JSON")).toEqual(record);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Reset replay", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: /View JSON for release/ })).toHaveCount(0);
});

test("scheduled publication and on-demand records have independent controls", async ({ page }) => {
  await page.goto("/#/simulation");
  await timing(page, "scheduled", "demand");
  for (let index = 0; index < 8; index++) await page.getByRole("button", { name: "Next event", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("0 releases published · 7 eligible changes waiting");
  await page.getByRole("button", { name: "Request record", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No record generated yet" })).toBeVisible();
  await page.getByRole("button", { name: "Run publication job", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("7 releases published · 0 eligible changes waiting · record includes 0 releases");
  await page.getByRole("button", { name: "Request record", exact: true }).click();
  const record = await artifact(page, "Complete record JSON");
  expect(record.releases).toHaveLength(7);
  await page.getByRole("button", { name: "Run publication job", exact: true }).click();
  await page.getByRole("button", { name: "Request record", exact: true }).click();
  expect((await artifact(page, "Complete record JSON")).releases).toEqual(record.releases);
  await artifact(page, "Record package JSON");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Record package JSON", exact: true }).click();
  const download = await downloadPromise;
  const downloaded = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(downloaded.records[0]).toEqual(record);
  expect(downloaded.publisher.name).toContain("Synthetic");
});

test("autoplay can pause and inspect an earlier event without changing the archive", async ({ page }) => {
  await page.clock.install();
  await page.goto("/#/simulation");
  await page.getByRole("button", { name: "Autoplay", exact: true }).click();
  await page.clock.fastForward(2500);
  await expect(page.getByRole("status")).toContainText("1 / 8 events observed");
  await page.getByRole("button", { name: "Pause replay", exact: true }).click();
  await page.clock.fastForward(6000);
  await expect(page.getByRole("status")).toContainText("1 / 8 events observed");
  await page.getByRole("button", { name: "Next event", exact: true }).click();
  await page.locator(".story-steps button").first().click();
  await expect(page.locator(".state-summary").nth(1)).toContainText("Release 001");
  await expect(page.getByRole("status")).toContainText("2 / 8 events observed · 1 release published");
});

test("source database rows update before publication and historical inspection preserves the latest state", async ({ page }) => {
  await page.goto("/#/simulation");
  await inspect(page, "Source tables");
  const database = page.locator(".source-database");
  await expect(database).toContainText("0 source rows");
  await timing(page, "scheduled");
  const next = page.getByRole("button", { name: "Next event", exact: true });
  await next.click();
  await expect(database.getByLabel("Inspect a source table")).toHaveValue("tenders");
  await next.click();
  await expect(database.getByLabel("Inspect a source table")).toHaveValue("internal_notes");
  await expect(database).toContainText("Draft review: confirm delivery contact.");
  await expect(database).toContainText("excluded from every release and record");
  await next.click();
  await expect(page.getByRole("status")).toContainText("0 releases published · 2 eligible changes waiting");
  await expect(database.locator(".source-table")).toContainText("2024-03-25T17:00:00+08:00");
  await expect(database.locator(".source-table del")).toHaveText("2024-03-20T17:00:00+08:00");
  const snapshot = await artifact(page, "Source database snapshot JSON");
  expect(snapshot.tables.tenders).toHaveLength(1);
  expect(snapshot.captured_events).toHaveLength(3);
  await database.getByLabel("Inspect a source table").selectOption("organizations");
  await expect(database.locator(".source-table")).toContainText("DENR Region VII");
  await page.getByRole("button", { name: "Run publication job", exact: true }).click();
  await expect(database.getByLabel("Inspect a source table")).toHaveValue("organizations");
  await inspect(page, "Record");
  const latestRecord = await artifact(page, "Complete record JSON");
  await inspect(page, "Source tables");
  expect(JSON.stringify(latestRecord)).not.toContain("Draft review");
  await page.locator(".story-steps button").first().click();
  await expect(database).toContainText("Historical source snapshot after event 1");
  await expect(database.locator(".source-table")).toContainText("2024-03-20T17:00:00+08:00");
  await expect(page.getByRole("status")).toContainText("3 / 8 events observed · 2 releases published");
  await page.getByRole("button", { name: "Return to latest event", exact: true }).click();
  expect(await artifact(page, "Source database snapshot JSON")).toEqual(snapshot);
  for (let index = 3; index < 8; index++) await next.click();
  await expect(database.getByLabel("Inspect a source table")).toHaveValue("deliveries");
  await expect(database).toContainText("The final delivery has no recorded completion date");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Source database snapshot JSON", exact: true }).click();
  const downloaded = JSON.parse(await readFile((await (await downloadPromise).path())!, "utf8"));
  expect(downloaded.tables.deliveries).toHaveLength(2);
  expect(downloaded.tables.deliveries[1]).not.toHaveProperty("completed_at");
  await page.getByRole("button", { name: "Reset replay", exact: true }).click();
  await expect(database).toContainText("0 source rows");
  await next.click();
  await expect(database.getByLabel("Inspect a source table")).toHaveValue("tenders");
});

test("solar lab joins preserve two lots, stable parties, and award references", async ({ page }) => {
  await page.goto("/#/mapping/solar-pumps");
  await page.getByRole("navigation", { name: "Solar lab sections" }).getByRole("link", { name: /Follow a mapping/ }).click();
  await page.getByLabel("Choose a mapping trace").selectOption("lots");
  await expect(page.locator("#mapping-trace .learning-card").first()).toContainText("LOT-1 has two items");
  await page.getByRole("navigation", { name: "Solar lab sections" }).getByRole("link", { name: /Check the result/ }).click();
  await page.getByLabel("Inspect the story at").selectOption("5");
  const record = await artifact(page, "Solar complete record JSON");
  expect(record.compiledRelease.tender.items).toHaveLength(3);
  expect(record.compiledRelease.tender.lots).toHaveLength(2);
  expect(record.compiledRelease.awards).toHaveLength(2);
  expect(record.compiledRelease.contracts.map((entry: { awardID: string }) => entry.awardID)).toEqual(["AWD-1", "AWD-2"]);
  await page.getByLabel("Alternative scenario: the same supplier wins both lots").check();
  const alternative = await artifact(page, "Solar complete record JSON");
  expect(alternative.compiledRelease.awards.every((entry: { suppliers: Array<{ id: string }> }) => entry.suppliers[0].id === "SUP-1")).toBe(true);
  expect(alternative.releases[1].parties[0].name).toBe("Solar Equipment Cooperative");
  expect(alternative.compiledRelease.parties.find((entry: { id: string }) => entry.id === "SUP-1").name).toBe("Solar Equipment Cooperative A");
  const pkg = await artifact(page, "Solar record package JSON");
  expect(pkg.extensions[0]).toContain("/v1.1.5/extension.json");
  await page.getByRole("link", { name: /Compare process boundaries/ }).click();
  await page.getByLabel("Compare a situation").selectOption("rebid-new");
  await expect(page.locator("#process-boundaries")).toContainText("not a rule for every re-bid");
  const relationship = await artifact(page, "Illustrative relationship fragment");
  expect(relationship.relatedProcesses[0].relationship).toEqual(["unsuccessfulProcess"]);
});

test("templates download, guide anchors work, and new lessons are searchable", async ({ page, request }) => {
  await page.goto("/#/workshop#templates");
  await expect(page.locator("#templates")).toBeFocused();
  const links = page.locator("#templates a[download]");
  await expect(links).toHaveCount(3);
  await expect(page.getByRole("link", { name: "OCDS Mapping Explorer ↗", exact: true })).toHaveAttribute("href", "https://csiiiv.github.io/ocds_mapping_explorer/");
  for (const [index, link] of (await links.all()).entries()) {
    const template = WORKSHOP_TEMPLATES[index];
    const original = await readFile(new URL(`../../templates/${encodeURIComponent(template.file)}`, import.meta.url));
    const response = await request.get((await link.getAttribute("href"))!);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("spreadsheetml.sheet");
    expect(await response.body()).toEqual(original);
    const downloadPromise = page.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(template.file);
    expect(await readFile((await download.path())!)).toEqual(original);
  }
  await page.goto("/#/search?q=procurement%20replay");
  await page.locator(".search-results").getByRole("link", { name: "Watch a procurement unfold" }).click();
  await expect(page).toHaveURL(/#\/simulation$/);
  await page.goto("/#/explore/fields?trace=contract-amount");
  await expect(page.locator(".field-trace")).toContainText("explicit fixture assumption");
  await page.getByRole("button", { name: /Repeated line items/ }).click();
  await expect(page).toHaveURL(/trace=item-description/);
  await page.reload();
  await expect(page.locator(".field-trace h2")).toHaveText("Item Description");
  await page.goto("/#/possible-journeys/denr-laptops");
  await page.getByRole("navigation", { name: "Journey detail sections" }).getByRole("link", { name: "Record", exact: true }).click();
  await expect(page.locator("#record")).toBeFocused();
  expect((await artifact(page, "View complete OCDS record JSON")).releases).toHaveLength(7);
});

test("new pages fit the viewport and render without browser errors", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["mapping", "simulation", "mapping/solar-pumps", "workshop", "journey/3-mapped", "journey/4-record"]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("desktop summaries and inspection use the window at realistic widths and heights", async ({ page }, testInfo) => {
  const sizes = testInfo.project.name === "desktop" ? [[1440, 900], [1920, 1080], [2560, 1440]] : [[390, 844]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto("/#/simulation");
    await page.getByRole("button", { name: "Reset replay", exact: true }).click();
    for (let index = 0; index < 3; index++) await page.getByRole("button", { name: "Next event", exact: true }).click();
    await expect(page.locator(".state-summary")).toHaveCount(3);
    const boxes = await Promise.all((await page.locator(".state-summary").all()).map((panel) => panel.boundingBox()));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width >= 1440) {
      expect(Math.abs(boxes[0]!.y - boxes[2]!.y)).toBeLessThan(2);
      expect(boxes[2]!.y + boxes[2]!.height).toBeLessThan(height);
      const workspace = (await page.locator(".inspection-workspace").boundingBox())!;
      expect(workspace.width).toBeGreaterThan(width * .58);
      await expect(page.locator(".event-rail")).toBeVisible();
      expect(await page.locator(".sidebar").evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(true);
      await inspect(page, "Source tables");
      const source = (await page.locator(".source-table-wrap").boundingBox())!;
      expect(source.width).toBeGreaterThan(workspace.width - 60);
      await page.screenshot({ path: testInfo.outputPath(`replay-source-${width}.png`), animations: "disabled" });
    }
  }
});

test("new lessons and active replay have no automated accessibility violations", async ({ page }) => {
  for (const route of ["mapping", "simulation", "mapping/solar-pumps", "workshop"]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    if (route === "simulation") {
      for (let index = 0; index < 3; index++) await page.getByRole("button", { name: "Next event", exact: true }).click();
    }
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, `${route}: ${JSON.stringify(results.violations.map((entry) => ({ id: entry.id, nodes: entry.nodes.map((node) => node.target) })))}`).toEqual([]);
  }
});


test("navigation separates sections and the introduction has one recommended action", async ({ page }) => {
  await page.goto("/#/journey");
  const sidebar = page.locator(".sidebar");
  for (const section of ["Learn OCDS", "Map data", "Workshop", "Reference"]) await expect(sidebar.getByRole("link", { name: section, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start the journey →", exact: true })).toHaveCount(1);
  await expect(sidebar.getByRole("link", { name: "Event", exact: true })).toBeVisible();
  await sidebar.getByRole("link", { name: "Map data", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Map the meaning, preserve the relationships");
  await expect(sidebar.getByRole("link", { name: "Event", exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "Field Explorer", exact: true })).toBeVisible();
  await sidebar.getByRole("link", { name: "Workshop", exact: true }).click();
  await expect(sidebar.getByRole("link", { name: "Templates", exact: true })).toBeVisible();
  await sidebar.getByRole("link", { name: "Reference", exact: true }).click();
  await expect(sidebar.getByRole("link", { name: "Glossary", exact: true })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "FAQ", exact: true })).toBeVisible();
});

test("mapping deep links reveal one topic and preserve exercise choices", async ({ page }) => {
  for (const anchor of ["anatomy", "structures", "process-boundaries", "events", "mapping-areas", "codelist-practice"]) {
    await page.goto(`/#/mapping#${anchor}`);
    await expect(page.locator(`#${anchor}`)).toBeVisible();
    await expect(page.locator(`#${anchor}`)).toBeFocused();
    await page.reload();
    await expect(page.locator(`#${anchor}`)).toBeVisible();
  }
  const choice = page.locator(".mapping-practice").first().getByLabel("open", { exact: true });
  await choice.check();
  const topics = page.getByRole("navigation", { name: "Mapping guide sections" });
  await topics.getByRole("link", { name: /01 Fields/ }).click();
  await expect(page.locator("#fields")).toBeVisible();
  await expect(page.locator("#codelists")).not.toBeVisible();
  await topics.getByRole("link", { name: /03 Codelists/ }).click();
  await expect(choice).toBeChecked();
  await page.getByRole("link", { name: "Skip to lesson content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/#\/mapping#codelists$/);
  await expect(choice).toBeChecked();
  await page.goto("/#/mapping/solar-pumps#relationships");
  await expect(page).toHaveURL(/#\/mapping#process-boundaries$/);
  await expect(page.getByLabel("Compare a situation")).toBeVisible();
});

test("workshop and lab views retain progress within their page", async ({ page }) => {
  await page.goto("/#/workshop#outputs");
  const check = page.locator(".workshop-checklist input").first();
  await check.check();
  const workshop = page.getByRole("navigation", { name: "Workshop sections" });
  await workshop.getByRole("link", { name: /Templates/ }).click();
  await expect(page.locator("#templates a[download]")).toHaveCount(3);
  await expect(page.locator("#agenda")).not.toBeVisible();
  await workshop.getByRole("link", { name: /Outputs/ }).click();
  await expect(check).toBeChecked();
  await page.goto("/#/mapping/solar-pumps#lab-history");
  await page.getByLabel("Inspect the story at").selectOption("5");
  await page.getByLabel("Alternative scenario: the same supplier wins both lots").check();
  const lab = page.getByRole("navigation", { name: "Solar lab sections" });
  await lab.getByRole("link", { name: /Inspect source/ }).click();
  await expect(page.locator("#lab-history")).not.toBeVisible();
  await lab.getByRole("link", { name: /Check the result/ }).click();
  await expect(page.getByLabel("Inspect the story at")).toHaveValue("5");
  await expect(page.getByLabel("Alternative scenario: the same supplier wins both lots")).toBeChecked();
});

test("replay keyboard views preserve state and expose accurate field history", async ({ page }) => {
  await page.goto("/#/simulation");
  for (let index = 0; index < 3; index++) await page.getByRole("button", { name: "Next event", exact: true }).click();
  await inspect(page, "Source tables");
  await page.getByRole("tab", { name: "Source tables", exact: true }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Release", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#replay-panel-release")).toBeVisible();
  await page.getByRole("tab", { name: "Release", exact: true }).press("ArrowRight");
  await page.getByRole("tab", { name: "Field history", exact: true }).click();
  await expect(page.locator(".change-summary")).toContainText("2source releases");
  await expect(page.getByRole("status")).toContainText("3 / 8 events observed · 2 releases published");
  await page.locator(".change-detail button").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "JSON view", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
});

for (const [name, routes] of [
  ["mapping topics", ["mapping#identity", "mapping#structures", "mapping#codelists", "mapping#events", "mapping#anatomy"]],
  ["lab and workshop views", ["mapping/solar-pumps#mapping-trace", "mapping/solar-pumps#lab-history", "workshop#templates", "workshop#outputs"]],
] as const) {
  test(`${name} remain accessible when opened directly`, async ({ page }) => {
    test.setTimeout(60000);
    for (const route of routes) {
      await page.goto(`/#/${route}`);
      const fragment = route.slice(route.indexOf("#") + 1);
      await expect(page.locator(`#${fragment}`)).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations, `${route}: ${JSON.stringify(results.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })))}`).toEqual([]);
    }
  });
}

test("replay source, release, history, and versioned inspection remain accessible", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/#/simulation");
  for (let index = 0; index < 8; index++) await page.getByRole("button", { name: "Next event", exact: true }).click();
  for (const view of ["Source tables", "Release", "Record"]) {
    await inspect(page, view);
    if (view === "Record") await page.getByRole("tab", { name: "Release history", exact: true }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, `${view}: ${JSON.stringify(results.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })))}`).toEqual([]);
  }
  await page.getByRole("tab", { name: "Field history", exact: true }).click();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

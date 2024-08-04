import { test, expect } from '../baseFixtures';
import CoachMarkTest from '../demo/CoachMarkTest.vue';
import { Locator } from 'playwright-core';

test('test coach mark basic', async ({ mount, page }) => {
  await mount(CoachMarkTest);

  // test step 1
  await testPosition(page.getByText('2222'))
  await page.getByRole('button', { name: 'Next' }).click()

  // wait animation end
  await page.waitForTimeout(1000)

  // test last step
  await testPosition(page.getByRole('button', { name: '1111' }))
  await page.getByRole('button', { name: 'Finish' }).click()


  async function testPosition(target: Locator) {
    // get target position
    const targetTop = await target.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY + rect.height;
    });

    // get popover position
    const popoverTop = await page.locator('.coach-mark--floating').evaluate((el) => {
      const popoverOffset = 10
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY - popoverOffset;
    });

    expect(targetTop).toBeCloseTo(popoverTop);
  }
});
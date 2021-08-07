import {Builder, By, Key, until} from 'selenium-webdriver';
import {Driver} from "selenium-webdriver/chrome";

/** @type Driver */
let driver;


async function testMyRecordCreate() {
	driver = await new Builder().forBrowser('chrome').build();
	let passAll = false;
	try {
		await driver.get('https://node-db-ui.com:1443/');

		await click('.form-node-82 .create-button');



		passAll = true;
	} finally {
		await driver.quit();
	}
	return passAll;
}


const click = async (css) => {
	let btn = await findElement(css);
	btn.click();
}

/** @returns */
const findElement = async (css, timeout = 3000) => {
	await driver.wait(function() {
		return driver.findElement(By.css(css));
	}, timeout);
	return driver.findElement(By.css(css));
}


test('testMyRecordCreate', async () => {
	expect(await testMyRecordCreate()).toBe(true);
});


import puppeteer from "puppeteer"
import http from 'http'
import finalhandler from 'finalhandler'
import serveStatic from 'serve-static'
import { expect } from "@jest/globals"
import path from 'path'
import fs from 'fs'

const browserOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
}

let browser;
let page;
let server

beforeAll(async () => {
    const serve = serveStatic("./");

    server = http.createServer(function (req, res) {
        const done = finalhandler(req, res);
        serve(req, res, done);
    });

    server.listen(8000);

    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:8000/');
}, 30000);

afterAll((done) => {
    try {
        this.puppeteer.close();
        server.close()
    } catch (e) { }
    done();
});

describe('Import', () => {
    it("Modules `View` and `Client` should be imported in `index.js`", async () => {
        const indexContent = fs
            .readFileSync("./scripts/index.js")
            .toString("utf-8")
            .replace(/ /g, "");
        expect(indexContent).toMatch(/import.*View/);
        expect(indexContent).toMatch(/import.*Client/);
    });
});
describe('Movie Search', () => {
    it("Should load and display data for entered movie", async () => {
        try {
            const inputField = await page.$('.movie-input');
            await inputField.type('shawshank');
            const saveButton = await page.$('.btn-save');
            await saveButton.click();
            await page.waitForTimeout(500);
            const movieTitle = await page.$eval('body', el => el.textContent);
            expect(movieTitle).toMatch(/Shawshank Redemption/i);
            await page.screenshot({ path: 'screenshot.png' });
        } catch (err) {
            throw err;
        }
    });
    it("page should display an alert if user inputs a movie twice", async () => {
        try {
            const inputField = await page.$('.movie-input');
            await inputField.type('shawshank');
            const saveButton = await page.$('.btn-save');
            await saveButton.click();
            await page.waitForTimeout(500);
            const inputField2 = await page.$('.movie-input');
            await inputField2.type('shawshank');
            const saveButton2 = await page.$('.btn-save');
            await saveButton2.click();
            const dialogDismissed = new Promise((resolve, reject) => {
                const handler = async dialog => {
                    await dialog.dismiss();
                    resolve(dialog.message());
                };
                page.once("dialog", handler);
            });
            const msg = await dialogDismissed;
            expect(msg).toBeTruthy();

        } catch (err) {
            throw err;
        }
    });
    it("User Should be able to reset the movie list", async () => {
        try {
            const inputField = await page.$('.movie-input');
            await inputField.type('shawshank');
            const saveButton = await page.$('.btn-save');
            await saveButton.click();
            await page.waitForTimeout(500);
            let movieTitle = await page.$eval('body', el => el.textContent);
            expect(movieTitle).toMatch(/Shawshank Redemption/i);
            const resetButton = await page.$('.btn-reset');
            await resetButton.click();
            movieTitle = await page.$eval('body', el => el.textContent);
            expect(movieTitle).not.toMatch(/Shawshank Redemption/i);
            //await page.screenshot({ path: 'screenshot.png' });
        } catch (err) {
            throw err;
        }
    });
});
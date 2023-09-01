const app = require("express")();

let chrome = {};
let puppeteer;
let validacao = true


let ultimaConsulta = {
  turma: 'asd',
  horario: 'asd',
  disciplina: 'asd',
  professores: 'asd',
  salas: 'asd',
  dia: 'asd',
  };

let horariosJsonFinal = []

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {

  
  let options = {};
  let quantidadeTurmas = 0
  

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);
    
    let page = await browser.newPage();
    const pageBody = await page.$('body');
    const pageBodyHeight = await pageBody.boundingBox();

    await page.setViewport({
      width: 1920,
      height: 1080
     })
     
     
     
    await page.goto("https://www.google.com");
    res.send(await page.title());
    

    } catch (err) {
      console.error(err);
      return null;
    }
  

});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});

module.exports = app;

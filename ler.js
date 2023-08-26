const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

class TestBfdgdfg {
  async setup() {
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
      .build();
  }

  async teardown() {
    await this.driver.quit();
  }

  async test() {
    await this.driver.get('https://ifc-camboriu.edupage.org/timetable/view.php?num=223&class=*26');

    await this.driver.manage().window().maximize();
    await this.driver.sleep(10000);

    const element = await this.driver.findElement(By.css('#skin_LogoText_2 > span'));
    await this.driver.actions().move({ origin: element }).perform();

    const visibleElements = await this.driver.findElements(By.xpath("//*[not(contains(@style, 'display:none'))]"));

    const positionsTexts = [];

    for (const element of visibleElements) {
      const positionY = await element.getRect().then(location => location.top);
      const text = await element.getText();

      if (text) {
        positionsTexts.push({ text, positionY });
      }
    }

    const pattern = /\d{1,2}:\d{2} - \d{1,2}:\d{2}/;
    const uniqueHorarios = new Set();

    for (const { text } of positionsTexts) {
      const results = text.match(pattern);
      if (results && !uniqueHorarios.has(results[0])) {
        uniqueHorarios.add(results[0]);
      }
    }

    const arrayElementosPresentes = [];
    for (let n = 1; n <= 500; n++) {
      try {
        await this.driver.findElement(By.CSS_SELECTOR,(`rect:nth-child(${n})`));
        arrayElementosPresentes.append(n);
      } catch (error) {
        // Do nothing
      }
    }
    console.log({arrayElementosPresentes})

    const heightHorarios = 490.94 / uniqueHorarios.size;
    const dicionarioHorarios = {};
    const horariosArray = Array.from(uniqueHorarios);

    for (let i = 0; i < horariosArray.length; i++) {
      const yFinalDoHorario = 291 + (heightHorarios * i) + heightHorarios;
      dicionarioHorarios[horariosArray[i]] = [291 + (heightHorarios * i), parseFloat(yFinalDoHorario.toFixed(2))];
    }

    const diasDaSemana = { 'Seg': [517.5, 654.5], 'Ter': [654.5, 791.5], 'Qua': [791.5, 928.5], 'Qui': [928.5, 1065.5], 'Sex': [1065.5, 1202.5], 'Sab': [1202.5, 1339.5] };

    for (const c of arrayElementosPresentes) {
      let comeca = '';
      let termina = '';

      const cell = await this.driver.findElement(By.css(`rect:nth-child(${c})`));

      if (await cell.getAttribute('accessible_name') !== '') {
        let proxIni = 10000;
        let proxIAnterior = 10000;
        let proxFim = 10000;
        let proxFAnterior = 10000;

        for (const h in dicionarioHorarios) {
          proxIni = Math.abs(dicionarioHorarios[h][0] - (cell.top - 135));
          proxFim = Math.abs(dicionarioHorarios[h][1] - ((cell.top - 135) + (await cell.offsetHeight)));

          if (proxIni < proxIAnterior) {
            comeca = h;
            proxIAnterior = proxIni;
          }

          if (proxFim < proxFAnterior) {
            termina = h;
            proxFAnterior = proxFim;
          }
        }

        let dia = '';
        for (const d in diasDaSemana) {
          if (cell.left > diasDaSemana[d][0] && cell.left < diasDaSemana[d][1]) {
            dia = d;
          }
        }

        const cellTitle = await cell.findElement(By.css('title'));
        const entrada = await cellTitle.getAttribute('textContent');

        const partes = entrada.split('\n');
        const partesFormatadas = partes.map(part => part.trim());

        const disciplina = partesFormatadas[0];
        const professor = partesFormatadas[1];
        const professores = professor.includes('/') ? professor.split('/').map(part => part.trim()) : [professor];
        
        let locais = [];
        if (partesFormatadas.length > 2) {
          const local = partesFormatadas[2];
          locais = local.includes('/') ? local.split('/').map(part => part.trim()) : [local];
        }

        comeca = comeca.slice(0, 5).trim();
        termina = termina.slice(-5).trim();

        console.log(`A disciplina ${disciplina} com prof(s) ${professores} na sala ${locais} é ${dia} começa às ${comeca} e termina às ${termina}`);
      }
    }
  }
}

(async () => {
  const test = new TestBfdgdfg();
  await test.setup();
  await test.test();
  await test.teardown();
})();

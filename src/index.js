import {hsv2rgb, rgbString} from '@kurkle/color';

function* hueGen() {
  yield 0;
  while (true) {
    for (let i = 1; i < 10; i++) {
      const d = 1 << i;
      for (let j = 1; j <= d; j += 2) {
        yield j / d;
      }
    }
  }
}

function* colorGen(repeat = 1) {
  const hue = hueGen();
  let h = hue.next();
  while (!h.done) {
    let rgb = hsv2rgb(Math.round(h.value * 360), 0.6, 0.8);
    for (let i = 0; i < repeat; i++) {
      yield {background: rgbString({r: rgb[0], g: rgb[1], b: rgb[2], a: 192}), border: rgbString({r: rgb[0], g: rgb[1], b: rgb[2], a: 144})};
    }
    rgb = hsv2rgb(Math.round(h.value * 360), 0.6, 0.5);
    for (let i = 0; i < repeat; i++) {
      yield {background: rgbString({r: rgb[0], g: rgb[1], b: rgb[2], a: 192}), border: rgbString({r: rgb[0], g: rgb[1], b: rgb[2], a: 144})};
    }
    h = hue.next();
  }
}

function setColors(dataset, background, border) {
  dataset.backgroundColor = dataset.backgroundColor || background;
  dataset.borderColor = dataset.borderColor || border;
  return dataset.backgroundColor === background && dataset.borderColor === border;
}

function getNext(color, customize, context) {
  const c = color.next().value;
  if (typeof customize === 'function') {
    return customize(Object.assign({colors: c}, context));
  }
  return c;
}

export default {
  id: 'autocolors',
  beforeUpdate(chart, args, options) {
    const {mode = 'dataset', enabled = true, customize, repeat} = options;

    if (!enabled) {
      return;
    }

    const gen = colorGen(repeat);

    if (options.offset) {
      // offset the color generation by n colors
      for (let i = 0; i < options.offset; i++) {
        gen.next();
      }
    }

    if (mode === 'label') {
      return labelMode(chart, gen, customize);
    }

    const datasetMode = mode === 'dataset';

    let c = getNext(gen, customize, {chart, datasetIndex: 0, dataIndex: datasetMode ? undefined : 0});
    for (const dataset of chart.data.datasets) {
      if (datasetMode) {
        if (setColors(dataset, c.background, c.border)) {
          c = getNext(gen, customize, {chart, datasetIndex: dataset.index});
        }
      } else {
        const background = [];
        const border = [];

        if ((typeof customize !== 'function')) {
          background.push(c.background);
          border.push(c.border);
        }

        for (let i = 0; i < dataset.data.length; i++) {
          if ((chart.config.type === 'pie' && typeof customize === 'function') || (typeof customize !== 'function')) {
            c = getNext(gen, customize, {chart, datasetIndex: dataset.index, dataIndex: i});
          }

          background.push(c.background);
          border.push(c.border);
        }
        setColors(dataset, background, border);
      }
    }
  }
};

function labelMode(chart, gen, customize) {
  const colors = {};
  for (const dataset of chart.data.datasets) {
    const label = dataset.label ?? '';
    if (!colors[label]) {
      colors[label] = getNext(gen, customize, {chart, datasetIndex: 0, dataIndex: undefined, label});
    }
    const c = colors[label];
    setColors(dataset, c.background, c.border);
  }
}

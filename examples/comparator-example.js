const ads1x15 = require('../index');
// delay in ms
const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));

const main = async () => {
  const channel = 0;
  const adc = new ads1x15();
  await adc.openBus(1);
  await adc.startComparator({
    channel,
    // threshold in mV, mili Volts
    thresholdHigh: 2300,
    thresholdLow: 1000,
  });

  // Reading in In continuous conversion mode channels 0
  console.log('Comparator: Reading in continuous mode.');
  console.log(`Channel = ${channel}:`)

  for await (let num of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    await sleep(100);
    const measure = await adc.getLastConversionResults();
    console.log(`measure ${num} : ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
  await adc.stopContinuousConversion()
}

main()

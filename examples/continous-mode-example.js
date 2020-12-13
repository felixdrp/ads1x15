const ads1x15 = require('../index');
// delay in ms
const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));


const main = async () => {
  const sps = 250;
  const pga = 6144;
  const channel = 0
  const adc = new ads1x15();
  await adc.openBus(1);
  await adc.startContinuousConversion({
    channel,
    pga,
    sps
  });
  // Reading in In continuous conversion mode channels 0
  console.log('Reading in continuous mode:');
  for await (let num of [0, 1, 2, 3]) {
    await sleep(100);
    const measure = await adc.getLastConversionResults();
    console.log(`Channel ${channel}: ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
  await adc.stopContinuousConversion()
}

main()

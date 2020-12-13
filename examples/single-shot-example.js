const ads1x15 = require('../index');

const main = async () => {
  const adc = new ads1x15();
  await adc.openBus(1);

  // Reading in Single shot mode channels 0-3
  console.log('Reading Single shot:');
  for await (let channel of [0, 1, 2, 3]) {
    const measure = await adc.readSingleEnded({channel});
    // const measure = await adc.readADCSingleEnded(num);
    console.log(`Channel ${channel}: ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
}

main()

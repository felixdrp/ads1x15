const ads1x15 = require('../index');

const main = async () => {
  const adc = new ads1x15();
  await adc.openBus(1);

  const differentialChannels = [
    {p: 0, n: 1},
    {p: 0, n: 3},
    {p: 1, n: 3},
    {p: 2, n: 3},
  ];

  // Reading in Differential Single shot mode channels 0-3
  console.log('Reading Differential Single shot:');
  for await (let channel of differentialChannels) {
    // const measure = await adc.readADCDifferential(channel.p, channel.n);
    // If positive and negative channel is assign it will read a differential lecture
    const measure = await adc.readSingleEnded({
      channelPositive: channel.p,
      channelNegative: channel.n,
    });
    console.log(`Channel Positive = ${channel.p}, Negative ${channel.n}: ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
}

main();

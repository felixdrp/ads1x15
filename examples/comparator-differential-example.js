const ads1x15 = require('../index');
// delay in ms
const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));

const main = async () => {
  const differentialChannels = [
    {p: 0, n: 1},
    {p: 0, n: 3},
    {p: 1, n: 3},
    {p: 2, n: 3},
  ];
  const channelSelectionIndex = 1
  const channelPositive = differentialChannels[channelSelectionIndex].p
  const channelNegative = differentialChannels[channelSelectionIndex].n
  const adc = new ads1x15();
  await adc.openBus(1);
  await adc.startComparator({
    channelPositive,
    channelNegative,
    // threshold in mV, mili Volts
    thresholdHigh: 2300,
    thresholdLow: 1000,
  });

  console.log('Comparator: Reading in continuous differential mode.');
  console.log(`Channel Positive = ${channelPositive}, Negative ${channelNegative}:`)
  
  for await (let num of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    await sleep(100);
    const measure = await adc.getLastConversionResults();
    console.log(`measure ${num} : ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
  await adc.stopContinuousConversion()
}

main()

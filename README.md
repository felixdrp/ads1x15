# ads1x15

A javascript library for the DS101x Ultra-Small,Low-Power, I2C-Compatible, 3.3-kSPS, 12-Bit ADCs With Internal Reference, Oscillator and Programmable Comparator.

## Installation

```sh
npm install ads1x15
```

## Common Usage

Here's the Raspberry Pi wired to the ADS1015 with I2C:
![Image of Raspberry Pi wired to the ADS1015](https://cdn-learn.adafruit.com/assets/assets/000/058/680/medium800/sensors_raspi_ads1015_i2c_bb.png?1533593501)

This example read all ports voltages.

```js
const ads1x15 = require('ads1x15');

const main = async () => {
  const adc = new ads1x15();

  // open i2c bus. 0 for /dev/i2c-0 and 1 for /dev/i2c-1
  await adc.openBus(1);

  // Reading in Single shot mode channels 0-3
  console.log('Reading Single shot:');
  for await (let channel of [0, 1, 2, 3]) {
    const measure = await adc.readSingleEnded({channel});
    console.log(`Channel ${channel}: ${measure / 1e3} (V) Volts, ${measure} (mV) mili Volts`);
  }
}

main()
```

## Examples

You can run all the examples by:

```sh
npm run examples
```

Please, visit the examples folder where you can find some use cases for this module.
> The examples was tested with ads1015.

## Related content

- [TI datasheet for ads1015](https://www.ti.com/lit/ds/symlink/ads1015.pdf)
- Adafruit-4-channel-adc-breakouts [wiring](https://learn.adafruit.com/adafruit-4-channel-adc-breakouts/python-circuitpython)
- Adafruit [I2c sensors and devices](https://learn.adafruit.com/circuitpython-on-raspberrypi-linux/i2c-sensors-and-devices)
- [Adafruit_ADS1X15](https://github.com/adafruit/Adafruit_ADS1X15)

## Acknowledgment

- @rpsoft [Jesus Rodriguez](https://github.com/rpsoft) for support.
- @alphacharlie [Alpha Charlie](https://github.com/alphacharlie) for the repository [node-ads1x15](https://github.com/alphacharlie/node-ads1x15).

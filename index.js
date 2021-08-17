// javascript/node  rewrite of the Adafruit ads1x15 python library...
// ads1015 datasheet https://www.ti.com/lit/ds/symlink/ads1015.pdf
const i2c = require('i2c-bus');

// delay in ms
const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay))

// chip
IC_ADS1015 = 0x00
IC_ADS1115 = 0x01

// CONVERSION DELAY (in mS)
ADS1015_CONVERSIONDELAY = 1 ///< Conversion delay
ADS1115_CONVERSIONDELAY = 9 ///< Conversion delay

// Pointer Register
ADS1015_REG_POINTER_MASK = 0x03
ADS1015_REG_POINTER_CONVERT = 0x00
ADS1015_REG_POINTER_CONFIG = 0x01
ADS1015_REG_POINTER_LOWTHRESH = 0x02
ADS1015_REG_POINTER_HITHRESH = 0x03

// Config Register
ADS1015_REG_CONFIG_OS_MASK = 0x8000
ADS1015_REG_CONFIG_OS_SINGLE = 0x8000 // Write: Set to start a single-conversion
ADS1015_REG_CONFIG_OS_BUSY = 0x0000 // Read: Bit = 0 when conversion is in progress
ADS1015_REG_CONFIG_OS_NOTBUSY = 0x8000 // Read: Bit = 1 when device is not performing a conversion
ADS1015_REG_CONFIG_MUX_MASK = 0x7000
ADS1015_REG_CONFIG_MUX_DIFF_0_1 = 0x0000 // Differential P = AIN0, N = AIN1 (default)
ADS1015_REG_CONFIG_MUX_DIFF_0_3 = 0x1000 // Differential P = AIN0, N = AIN3
ADS1015_REG_CONFIG_MUX_DIFF_1_3 = 0x2000 // Differential P = AIN1, N = AIN3
ADS1015_REG_CONFIG_MUX_DIFF_2_3 = 0x3000 // Differential P = AIN2, N = AIN3
ADS1015_REG_CONFIG_MUX_SINGLE_0 = 0x4000 // Single-ended AIN0
ADS1015_REG_CONFIG_MUX_SINGLE_1 = 0x5000 // Single-ended AIN1
ADS1015_REG_CONFIG_MUX_SINGLE_2 = 0x6000 // Single-ended AIN2
ADS1015_REG_CONFIG_MUX_SINGLE_3 = 0x7000 // Single-ended AIN3
ADS1015_REG_CONFIG_PGA_MASK = 0x0E00
ADS1015_REG_CONFIG_PGA_6_144V = 0x0000 // +/-6.144V range
ADS1015_REG_CONFIG_PGA_4_096V = 0x0200 // +/-4.096V range
ADS1015_REG_CONFIG_PGA_2_048V = 0x0400 // +/-2.048V range (default)
ADS1015_REG_CONFIG_PGA_1_024V = 0x0600 // +/-1.024V range
ADS1015_REG_CONFIG_PGA_0_512V = 0x0800 // +/-0.512V range
ADS1015_REG_CONFIG_PGA_0_256V = 0x0A00 // +/-0.256V range
ADS1015_REG_CONFIG_MODE_MASK = 0x0100
ADS1015_REG_CONFIG_MODE_CONTIN = 0x0000 // Continuous conversion mode
ADS1015_REG_CONFIG_MODE_SINGLE = 0x0100 // Power-down single-shot mode (default)
ADS1015_REG_CONFIG_DR_MASK = 0x00E0
ADS1015_REG_CONFIG_DR_128SPS = 0x0000 // 128 samples per second
ADS1015_REG_CONFIG_DR_250SPS = 0x0020 // 250 samples per second
ADS1015_REG_CONFIG_DR_490SPS = 0x0040 // 490 samples per second
ADS1015_REG_CONFIG_DR_920SPS = 0x0060 // 920 samples per second
ADS1015_REG_CONFIG_DR_1600SPS = 0x0080 // 1600 samples per second (default)
ADS1015_REG_CONFIG_DR_2400SPS = 0x00A0 // 2400 samples per second
ADS1015_REG_CONFIG_DR_3300SPS = 0x00C0 // 3300 samples per second (also 0x00E0)
ADS1115_REG_CONFIG_DR_8SPS = 0x0000 // 8 samples per second
ADS1115_REG_CONFIG_DR_16SPS = 0x0020 // 16 samples per second
ADS1115_REG_CONFIG_DR_32SPS = 0x0040 // 32 samples per second
ADS1115_REG_CONFIG_DR_64SPS = 0x0060 // 64 samples per second
ADS1115_REG_CONFIG_DR_128SPS = 0x0080 // 128 samples per second
ADS1115_REG_CONFIG_DR_250SPS = 0x00A0 // 250 samples per second (default)
ADS1115_REG_CONFIG_DR_475SPS = 0x00C0 // 475 samples per second
ADS1115_REG_CONFIG_DR_860SPS = 0x00E0 // 860 samples per second
ADS1015_REG_CONFIG_CMODE_MASK = 0x0010
ADS1015_REG_CONFIG_CMODE_TRAD = 0x0000 // Traditional comparator with hysteresis (default)
ADS1015_REG_CONFIG_CMODE_WINDOW = 0x0010 // Window comparator
ADS1015_REG_CONFIG_CPOL_MASK = 0x0008
ADS1015_REG_CONFIG_CPOL_ACTVLOW = 0x0000 // ALERT/RDY pin is low when active (default)
ADS1015_REG_CONFIG_CPOL_ACTVHI = 0x0008 // ALERT/RDY pin is high when active
ADS1015_REG_CONFIG_CLAT_MASK = 0x0004 // Determines if ALERT/RDY pin latches once asserted
ADS1015_REG_CONFIG_CLAT_NONLAT = 0x0000 // Non-latching comparator (default)
ADS1015_REG_CONFIG_CLAT_LATCH = 0x0004 // Latching comparator
ADS1015_REG_CONFIG_CQUE_MASK = 0x0003
ADS1015_REG_CONFIG_CQUE_1CONV = 0x0000 // Assert ALERT/RDY after one conversions
ADS1015_REG_CONFIG_CQUE_2CONV = 0x0001 // Assert ALERT/RDY after two conversions
ADS1015_REG_CONFIG_CQUE_4CONV = 0x0002 // Assert ALERT/RDY after four conversions
ADS1015_REG_CONFIG_CQUE_NONE = 0x0003 // Disable the comparator and put ALERT/RDY in high state (default)

// This is a javascript port of python, so use objects instead of dictionaries here
// These simplify and clean the code (avoid the abuse of if/elif/else clauses)
const spsADS1115 = {
  8   : ADS1115_REG_CONFIG_DR_8SPS,
  16  : ADS1115_REG_CONFIG_DR_16SPS,
  32  : ADS1115_REG_CONFIG_DR_32SPS,
  64  : ADS1115_REG_CONFIG_DR_64SPS,
  128 : ADS1115_REG_CONFIG_DR_128SPS,
  250 : ADS1115_REG_CONFIG_DR_250SPS,
  475 : ADS1115_REG_CONFIG_DR_475SPS,
  860 : ADS1115_REG_CONFIG_DR_860SPS
};

const spsADS1015 = {
  128   : ADS1015_REG_CONFIG_DR_128SPS,
  250   : ADS1015_REG_CONFIG_DR_250SPS,
  490   : ADS1015_REG_CONFIG_DR_490SPS,
  920   : ADS1015_REG_CONFIG_DR_920SPS,
  1600  : ADS1015_REG_CONFIG_DR_1600SPS,
  2400  : ADS1015_REG_CONFIG_DR_2400SPS,
  3300  : ADS1015_REG_CONFIG_DR_3300SPS
};

// Dictionary with the programable gains

const pgaADS1x15 = {
  6144 : ADS1015_REG_CONFIG_PGA_6_144V,
  4096 : ADS1015_REG_CONFIG_PGA_4_096V,
  2048 : ADS1015_REG_CONFIG_PGA_2_048V,
  1024 : ADS1015_REG_CONFIG_PGA_1_024V,
  512  : ADS1015_REG_CONFIG_PGA_0_512V,
  256  : ADS1015_REG_CONFIG_PGA_0_256V
};

// Variable check

/**
 * Config samples per second (sps) by chip type
 * @function spsConfigByChipType
 * @param {number} type - Chip version. default ADS1015
 * @param {number} sps - samples per second.
 */
const spsConfigByChipType = (type = IC_ADS1015, sps) => {
  if (type == IC_ADS1015) {
    if (spsADS1015.hasOwnProperty(sps) == false) {
      throw "ADS1015: Invalid sps specified";
    }
    return spsADS1015[sps];
  }

  if (spsADS1115.hasOwnProperty(sps) == false) {
    throw "ADS1115: Invalid sps specified";
  }
  return spsADS1115[sps];
}

/**
 * Programmable gain amplifier configuration (PGA)
 * @function pgaConfig
 * @param {number} pga
 */
const pgaConfig = (pga) => {
  if (pgaADS1x15.hasOwnProperty(pga) == false) {
    throw "ADS1x15: Invalid pga specified";
  }
  return pgaADS1x15[pga];
}

/**
 * Set channel config
 * @function channelConfig
 * @param {number} channel - select channel 0-3
 */
const channelConfig = (channel) => {
  if (channel > 3 || channel < 0) {
    throw "Error: Channel must be between 0 and 3";
  }

  switch (channel) {
  case 3:
    return ADS1015_REG_CONFIG_MUX_SINGLE_3;
    break;
  case 2:
    return ADS1015_REG_CONFIG_MUX_SINGLE_2;
    break;
  case 1:
    return ADS1015_REG_CONFIG_MUX_SINGLE_1;
    break;
  default:
    return ADS1015_REG_CONFIG_MUX_SINGLE_0;
  }
}

/**
 * Set differential channel config
 * @function channelDifferentialConfig
 * @param {number} chP - select channel 0-2
 * @param {number} chN - select channel 1-3
 */
const channelDifferentialConfig = (chP, chN) => {
  // Check channels
  if (
    // Channel positive options
    [0,1,2].includes(chP) == false ||
    // Channel negative options
    [1,3].includes(chN) == false
  ) {
    console.log( "ADS1x15: Invalid channels specified");
    throw ("ADS1x15: Invalid channels specified");
  }

  switch (`${chP}${chN}`) {
  case '01':
    return ADS1015_REG_CONFIG_MUX_DIFF_0_1;
    break;
  case '03':
    return ADS1015_REG_CONFIG_MUX_DIFF_0_3;
    break;
  case '13':
    return ADS1015_REG_CONFIG_MUX_DIFF_1_3;
    break;
  case '23':
    return ADS1015_REG_CONFIG_MUX_DIFF_2_3;
    break;
  default:
    console.log( "ADS1x15: Invalid channels specified");
    throw ("ADS1x15: Invalid channels specified");
  }
}

/**
 * set up I2C for ADS1015/ADS1115.
 * @constructor
 * @param {number} ic=IC_ADS1015 - Chip version. default ADS1015
 * @param {number} address=0x48 - i2c address. default 0x48
 * @param {string} i2c_dev=0'/dev/i2c-1' - I2C bus/adapter name.
 */
function ads1x15(ic = IC_ADS1015, address = 0x48, i2c_dev = '/dev/i2c-1') {
  if (ic != IC_ADS1015 && ic != IC_ADS1115) {
    throw "Error: not a supported device";
  }
  this.i2cDev = i2c_dev;
  this.i2c = null; // i2c Bus instance
  this.ic = ic; // 0 for ads1015, 1 for ads1115;
  this.address = address; //defaults to 0x48 for addr pin tied to ground
  this.pga = 6144; //set this to a sane default...
  this.busy = false;
}

ads1x15.prototype.setAddress = function(address) {
  this.address = address || this.address
}

ads1x15.prototype.openBus = async function(i2cDev) {
  this.i2c = await i2c.openPromisified(i2cDev || this.i2cDev)
  return this.i2c;
}

/**
 * format the Result
 * @function formatResult(result)
 * @param {number} measure - raw measure returned by the ADC
 * @returns adc value in mV, mili Volts
 */
ads1x15.prototype.formatResult = function(measure) {
  let negateFactor = 1;
  const pga = this.pga;
  // (Take signed values into account as well)
  if (measure > 0x7FFF) {
    measure = 0xFFFF - measure;
    negateFactor = -1;
  }

  if (this.ic == IC_ADS1015) {
    // Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    measure = (negateFactor * (measure >> 4 ) * pga) / 2048.0;
  } else {
    // Return a mV value for the ADS1115
    measure = (negateFactor * measure * pga) / 32768.0;
  }

  return measure;
}

/**
 * @function switchBytes Switch bytes in a word. Ex 0xc283 -> 0x83c2
 * @param {number} data - word (16 bits) of information to switch
 * @returns data with bytes switched
 */
const switchBytes = (data) => (data << 8 & 0xff00) | data >> 8

ads1x15.prototype.i2cWriteWord = function(cmd, data) {
  const lowerByteFirst = switchBytes(data)
  return this.i2c.writeWord(this.address, cmd, lowerByteFirst)
}
ads1x15.prototype.i2cReadWord = async function(cmd) {
  const result = await this.i2c.readWord(this.address, cmd)
  return switchBytes(result)
}

/**
 * @function readSingleEnded
 Gets a single-ended ADC reading from the specified channel in mV.
 The sample rate for this mode (single-shot) can be used to lower the noise
 (low sps) or to lower the power consumption (high sps) by duty cycling,
 see datasheet page 14 for more info.
 The pga must be given in mV, see page 13 for the supported values.
 * @param {Object} Obj - configuration
 * @param {number} Obj.channel=0 - default channel 0
 * @param {number} Obj.channelPositive - used for differential reading
 * @param {number} Obj.channelNegative - used for differential reading
 * @param {number} Obj.pga=6144 - programmable gain amplifier. default 6144
 * @param {number} Obj.sps=250 - samples per second. default 250
 * @returns measure in mili Volts mV
 */
 ads1x15.prototype.readSingleEnded = async function({
   channel = 0,
   channelPositive,
   channelNegative,
   pga = 6144,
   sps = 250
 }) {
   const self = this;

   if (self.busy) {
     return "ADC is busy...";
   }

   self.busy = true;

   // Disable comparator, Non-latching, Alert/Rdy active low
   // traditional comparator, single-shot mode
   let config =
       ADS1015_REG_CONFIG_CQUE_NONE |    // Disable the comparator (default val)
       ADS1015_REG_CONFIG_CLAT_NONLAT |  // Non-latching (default val)
       ADS1015_REG_CONFIG_CPOL_ACTVLOW | // Alert/Rdy active low   (default val)
       ADS1015_REG_CONFIG_CMODE_TRAD |   // Traditional comparator (default val)
 //      ADS1015_REG_CONFIG_DR_1600SPS |   // 1600 samples per second (default)
       ADS1015_REG_CONFIG_MODE_SINGLE;   // Single-shot mode (default)

   try {
     // Set sample per seconds, defaults to 250sps
     // If sps is in the dictionary (defined in init) it returns the value of the constant
     config |= spsConfigByChipType(self.ic, sps);

     // Set PGA/voltage range, defaults to +-6.144V
     config |= pgaConfig(pga);
     self.pga = pga;

     // Configure channel
     // if channel negative is set config as differential
     if (channelNegative) {
       // Set channels
       config |= channelDifferentialConfig(channelPositive || channel, channelNegative);
     } else {
       // Set the channel to be converted
       config |= channelConfig(channel);
     }

   } catch (error) {
     self.busy = false;
     throw (error);
   }

   // Set 'start single-conversion' bit
   config |= ADS1015_REG_CONFIG_OS_SINGLE;

   // Write config register to the ADC
   let result = await self.i2cWriteWord(ADS1015_REG_POINTER_CONFIG, config);

   // Wait for the ADC conversion to complete
   // The minimum delay depends on the sps: delay >= 1s/sps
   // We add 1ms to be sure
   const delay = (1000 / sps) + 1;
   await sleep(delay);

   let measure;
   // Read the conversion results
   measure = await self.i2cReadWord(ADS1015_REG_POINTER_CONVERT);
   measure = self.formatResult(measure);
   self.busy = false;
   return measure;
 }

/**
 * @function readADCSingleEnded
 Gets a single-ended ADC reading from the specified channel in mV.
 The sample rate for this mode (single-shot) can be used to lower the noise
 (low sps) or to lower the power consumption (high sps) by duty cycling,
 see datasheet page 14 for more info.
 The pga must be given in mV, see page 13 for the supported values.
 * @param {number} channel -
 * @param {number} pga -
 * @param {number} sps -
 * @returns measure in mili Volts mV
 */
ads1x15.prototype.readADCSingleEnded = function(channel = 0, pga = 6144, sps = 250) {
  // Returns promise
  return this.readSingleEnded({channel, pga, sps});
}

/**
 * @function readADCDifferential
 Gets a differential ADC reading from channels chP and chN in mV.
 The sample rate for this mode (single-shot) can be used to lower the noise
 (low sps) or to lower the power consumption (high sps) by duty cycling,
 see data sheet page 14 for more info.
 The pga must be given in mV, see page 13 for the supported values.
 * @param {number} chP - positive channel
 * @param {number} chN - negative channel
 * @param {number} pga - Programmable gain amplifier config
 * @param {number} sps - samples per second config
 * @returns measure
 */
ads1x15.prototype.readADCDifferential = async function(chP = 0, chN = 1, pga = 6144, sps = 250) {
  // Returns promise
  return this.readSingleEnded({
    channelPositive: chP,
    channelNegative: chN,
    pga,
    sps
  });
}

// Gets a differential ADC reading from channels 0 and 1 in mV
// The sample rate for this mode (single-shot) can be used to lower the noise
// (low sps) or to lower the power consumption (high sps) by duty cycling,
// see data sheet page 14 for more info.
// The pga must be given in mV, see page 13 for the supported values.

// Gets a differential ADC reading from channels 0 and 1 in mV
ads1x15.prototype.readADCDifferential01 = function(pga, sps) {
  return this.readSingleEnded({
    channelPositive: 0,
    channelNegative: 1,
    pga,
    sps
  });
}

// Gets a differential ADC reading from channels 0 and 3 in mV
ads1x15.prototype.readADCDifferential03 = function (pga, sps) {
  return this.readSingleEnded({
    channelPositive: 0,
    channelNegative: 3,
    pga,
    sps
  });
}

// Gets a differential ADC reading from channels 1 and 3 in mV
ads1x15.prototype.readADCDifferential13 = function(pga, sps) {
  return this.readSingleEnded({
    channelPositive: 1,
    channelNegative: 3,
    pga,
    sps
  });
}

// Gets a differential ADC reading from channels 2 and 3 in mV
ads1x15.prototype.readADCDifferential23 = function(pga, sps) {
  return this.readSingleEnded({
    channelPositive: 2,
    channelNegative: 3,
    pga,
    sps
  });
}


/**
 * @function startContinuousConversion
 Starts the continuous conversion mode and returns the first ADC reading
 in mV from the specified channel.
 The sps controls the sample rate.
 The pga must be given in mV, see datasheet page 13 for the supported values.
 Use getLastConversionResults() to read the next values and
 stopContinuousConversion() to stop converting.
 * @param {Object} Obj - configuration
 * @param {number} Obj.channel=0 - default channel 0
 * @param {number} Obj.channelPositive - used for differential reading
 * @param {number} Obj.channelNegative - used for differential reading
 * @param {number} Obj.pga=6144 - programmable gain amplifier. default 6144
 * @param {number} Obj.sps=250 - samples per second. default 250
 * @returns measure in mili Volts mV
 */

ads1x15.prototype.startContinuousConversion = async function({
  channel = 0,
  channelPositive,
  channelNegative,
  pga = 6144,
  sps = 250
}) {
  const self = this;
  if(self.busy) {
    return "ADC is busy..."
  }

  self.busy = true;

  // Disable comparator, Non-latching, Alert/Rdy active low
  // traditional comparator, continuous mode
  // The last flag is the only change we need, page 11 datasheet
  config =
    ADS1015_REG_CONFIG_CQUE_NONE |
    ADS1015_REG_CONFIG_CLAT_NONLAT |
    ADS1015_REG_CONFIG_CPOL_ACTVLOW |
    ADS1015_REG_CONFIG_CMODE_TRAD |
    ADS1015_REG_CONFIG_MODE_CONTIN;

  try {
    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary (defined in init) it returns the value of the constant
    config |= spsConfigByChipType(self.ic, sps);

    // Set PGA/voltage range, defaults to +-6.144V
    config |= pgaConfig(pga);
    self.pga = pga

    // Configure channel
    // if channel negative is set config as differential
    if (channelNegative) {
      // Set channels
      config |= channelDifferentialConfig(channelPositive || channel, channelNegative);
    } else {
      // Set the channel to be converted
      config |= channelConfig(channel);
    }

  } catch (error) {
    self.busy = false;
    throw (error)
  }

  // Set 'start single-conversion' bit to begin conversions
  // No need to change this for continuous mode!
  config |= ADS1015_REG_CONFIG_OS_SINGLE;

  // Write config register to the ADC
  // Once we write the ADC will convert continously
  // we can read the next values using getLastConversionResult
  let result
  try {
    result = await self.i2cWriteWord(ADS1015_REG_POINTER_CONFIG, config)
  } catch (err) {
    self.busy = false;
    throw "We've got an Error, Lance Constable Carrot!: " + err.toString();
  }

  // Wait for the ADC conversion to complete
  // The minimum delay depends on the sps: delay >= 1s/sps
  // We add 1ms to be sure
  const delay = (1000 / sps) + 1;
  await sleep(delay);

  // :-) test this code result
  let measure;
  // Read the conversion results
  measure = await self.i2cReadWord(ADS1015_REG_POINTER_CONVERT);
  measure = this.formatResult(measure);
  return measure;
}

// Stops the ADC's conversions when in continuous mode
// and resets the configuration to its default value."
ads1x15.prototype.stopContinuousConversion = async function() {
  // Write the default config register to the ADC
  // Once we write, the ADC will do a single conversion and
  //  enter power-off mode.
  const config = 0x8583; // Page 18 datasheet.
  let result
  try {
    result = await this.i2cWriteWord(ADS1015_REG_POINTER_CONFIG, config)
  } catch (err) {
    this.busy = false;
    throw "We've got an Error, Lance Constable Carrot!: " + err.toString();
  }
  return true
}

// Returns the last ADC conversion result in mV
ads1x15.prototype.getLastConversionResults = async function(_pga) {
  let measure;
  // Read the conversion results
  measure = await this.i2cReadWord(ADS1015_REG_POINTER_CONVERT);
  measure = this.formatResult(measure);
  return measure
}

/**
 * @function startComparator
 Starts the comparator mode on the specified channel, see datasheet pg. 15.
 In traditional mode it alerts (ALERT pin will go low) when voltage exceeds
 thresholdHigh until it falls below thresholdLow (both given in mV).
 In window mode (traditionalMode=False) it alerts when voltage doesn't lie
 between both thresholds.
 In latching mode the alert will continue until the conversion value is read.
 numReadings controls how many readings are necessary to trigger an alert: 1, 2 or 4.
 Use getLastConversionResults() to read the current value (which may differ
 from the one that triggered the alert) and clear the alert pin in latching mode.
 This function starts the continuous conversion mode. The sps controls
 the sample rate and the pga the gain, see datasheet page 13.
 * @param {Object} Obj - configuration
 * @param {number} Obj.channel=0 - default channel 0
 * @param {number} Obj.channelPositive - used for differential reading
 * @param {number} Obj.channelNegative - used for differential reading
 * @param {number} thresholdHigh - high threshold level in mili Volts
 * @param {number} thresholdLow - low threshold level in mili Volts
 * @param {number} Obj.pga=6144 - programmable gain amplifier. default 6144
 * @param {number} Obj.sps=250 - samples per second. default 250
 * @param {number} Obj.activeLow - true=Active low or false=Active high.
    This bit controls the polarity of the ALERT/RDY pin.When COMP_POL= '0' the comparator output is active low.
    When COMP_POL='1' theALERT/RDY pin is active high. 0 : Activelow(default), 1 : Activehigh
 * @param {number} Obj.traditionalMode - true=TRADITIONAL COMPARATOR MODE or false=WINDOW COMPARATOR MODE
 * @param {number} Obj.latching - true=Latch or false non latch
 * @param {number} Obj.numReadings - 1, 2, 4
 */
 ads1x15.prototype.startComparator = async function({
   channel = 0,
   channelPositive,
   channelNegative,
   thresholdHigh,
   thresholdLow,
   pga = 6144,
   sps = 250,
   activeLow = true,
   traditionalMode = true,
   latching = false,
   numReadings = 1,
 }) {
   self = this;

   if(self.busy) {
     return "ADC is busy..."
   }

   self.busy = true;

   // Continuous mode
   config = ADS1015_REG_CONFIG_MODE_CONTIN;

   if (activeLow == true) {
     config |= ADS1015_REG_CONFIG_CPOL_ACTVLOW;
   } else {
     config |= ADS1015_REG_CONFIG_CPOL_ACTVHI;
   }

   if (traditionalMode == true) {
     config |= ADS1015_REG_CONFIG_CMODE_TRAD;
   } else {
     config |= ADS1015_REG_CONFIG_CMODE_WINDOW;
   }

   if (latching == true) {
     config |= ADS1015_REG_CONFIG_CLAT_LATCH;
   } else {
     config |= ADS1015_REG_CONFIG_CLAT_NONLAT;
   }

   switch (numReadings) {
   case 4:
     config |= ADS1015_REG_CONFIG_CQUE_4CONV;
     break;
   case 2:
     config |= ADS1015_REG_CONFIG_CQUE_2CONV;
     break;
   case 1:
     config |= ADS1015_REG_CONFIG_CQUE_1CONV;
   }

   try {
     // Set sample per seconds, defaults to 250sps
     // If sps is in the dictionary (defined in init) it returns the value of the constant
     config |= spsConfigByChipType(self.ic, sps);

     // Set PGA/voltage range, defaults to +-6.144V
     config |= pgaConfig(pga);
     self.pga = pga

     // Configure channel
     // if channel negative is set config as differential
     if (channelNegative) {
       // Set channels
       config |= channelDifferentialConfig(channelPositive || channel, channelNegative);
     } else {
       // Set the channel to be converted
       config |= channelConfig(channel);
     }

   } catch (error) {
     self.busy = false;
     throw (error)
   }

   // Set 'start single-conversion' bit to begin conversions
   config |= ADS1015_REG_CONFIG_OS_SINGLE;

   let result
   // Write threshold high and low registers to the ADC
   // V_digital = (2^(n-1)-1)/pga*V_analog
   let thresholdHighWord = 0;
   let thresholdLowWORD = 0;

   if (this.ic == IC_ADS1015) {
     thresholdHighWORD = thresholdHigh * (2048.0 / pga);
     thresholdLowWORD = thresholdLow * (2048.0 / pga );
   } else {
     thresholdHighWORD = thresholdHigh * (32767.0 / pga);
     thresholdLowWORD = thresholdLow * (32767.0 / pga);
   }

   result = await self.i2cWriteWord(ADS1015_REG_POINTER_HITHRESH, thresholdHighWORD)
   result = await self.i2cWriteWord(ADS1015_REG_POINTER_LOWTHRESH, thresholdLowWORD)

   // Write config register to the ADC
   // Once we write the ADC will convert continously and alert when things happen,
   // we can read the converted values using getLastConversionResult
   result = await self.i2cWriteWord(ADS1015_REG_POINTER_CONFIG, config)
 }

/**
 * @function startSingleEndedComparator
 Starts the comparator mode on the specified channel, see datasheet pg. 15.
 * @param {number} channel -
 * @param {number} thresholdHigh - high threshold level in mili Volts
 * @param {number} thresholdLow - low threshold level in mili Volts
 * @param {number} pga -
 * @param {number} sps -
 * @param {number} activeLow - true=Active low or false=Active high.
    This bit controls the polarity of the ALERT/RDY pin.When COMP_POL= '0' the comparator output is active low.
    When COMP_POL='1' theALERT/RDY pin is active high. 0 : Activelow(default), 1 : Activehigh
 * @param {number} traditionalMode - true=TRADITIONAL COMPARATOR MODE or false=WINDOW COMPARATOR MODE
 * @param {number} latching - true=Latch or false non latch
 * @param {number} numReadings - 1, 2, 4
 */
ads1x15.prototype.startSingleEndedComparator = function(
  channel = 0,
  thresholdHigh,
  thresholdLow,
  pga = 6144,
  sps = 250,
  activeLow = true,
  traditionalMode = true,
  latching = false,
  numReadings = 1,
) {
  return this.startComparator({
    channel,
    thresholdHigh,
    thresholdLow,
    pga,
    sps,
    activeLow,
    traditionalMode,
    latching,
    numReadings,
  });
}

/**
 * @function startDifferentialComparator
 Starts the comparator mode on the specified channel, see datasheet pg. 15.
 * @param {number} chP -
 * @param {number} chN -
 * @param {number} thresholdHigh - high threshold level in mili Volts
 * @param {number} thresholdLow - low threshold level in mili Volts
 * @param {number} pga -
 * @param {number} sps -
 * @param {number} activeLow - true=Active low or false=Active high.
    This bit controls the polarity of the ALERT/RDY pin.When COMP_POL= '0' the comparator output is active low.
    When COMP_POL='1' theALERT/RDY pin is active high. 0 : Activelow(default), 1 : Activehigh
 * @param {number} traditionalMode - true=TRADITIONAL COMPARATOR MODE or false=WINDOW COMPARATOR MODE
 * @param {number} latching - true=Latch or false non latch
 * @param {number} numReadings - 1, 2, 4
 */
ads1x15.prototype.startDifferentialComparator = function(
  chP,
  chN,
  thresholdHigh,
  thresholdLow,
  pga = 6144,
  sps = 250,
  activeLow = true,
  traditionalMode = true,
  latching = false,
  numReadings = 1,
) {
  return this.startComparator({
    channelPositive: chP,
    channelNegative: chN,
    thresholdHigh,
    thresholdLow,
    pga,
    sps,
    activeLow,
    traditionalMode,
    latching,
    numReadings,
  });
}

module.exports = ads1x15;

export let printerCharacteristic: any = null;
export let printerDevice: any = null;


const setupDevice = async (device: any) => {
  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();

  let targetCharacteristic: any = null;

  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    for (const char of characteristics) {
      if (char.properties.write || char.properties.writeWithoutResponse) {
        targetCharacteristic = char;
        break;
      }
    }
    if (targetCharacteristic) break;
  }

  if (!targetCharacteristic) {
    throw new Error('Could not find a writeable characteristic on this device.');
  }

  printerDevice = device;
  printerCharacteristic = targetCharacteristic;
  return true;
};

export const connectPrinter = async () => {
  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000fee7-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'
      ]
    });

    return await setupDevice(device);
  } catch (error) {
    console.error('Failed to connect to printer:', error);
    return false;
  }
};

export const autoConnectPrinter = async (): Promise<boolean> => {
  try {
    if (typeof (navigator as any).bluetooth?.getDevices === 'function') {
      const devices = await (navigator as any).bluetooth.getDevices();
      if (devices && devices.length > 0) {
        const device = devices[0];
        console.log('Found previously paired printer:', device.name);

        return new Promise(async (resolve) => {
          // If already connected, just set it up
          if (device.gatt.connected) {
            try {
              await setupDevice(device);
              resolve(true);
            } catch (e) {
              resolve(false);
            }
            return;
          }

          // Listen for the printer's radio beacon
          const onAdvertisement = async () => {
            console.log('Printer beacon detected! Ambushing connection...');
            device.removeEventListener('advertisementreceived', onAdvertisement);

            try {
              await setupDevice(device);
              console.log('Force-connect successful!');
              // Stop watching once connected to save battery
              if (typeof device.unwatchAdvertisements === 'function') {
                device.unwatchAdvertisements();
              }
              resolve(true);
            } catch (error) {
              console.error('Failed during ambush connect:', error);
              resolve(false);
            }
          };

          device.addEventListener('advertisementreceived', onAdvertisement);

          try {
            console.log('Watching for printer advertisements...');
            await device.watchAdvertisements();
          } catch (error) {
            console.error('watchAdvertisements failed:', error);
            // Fallback: try direct connect if watchAdvertisements is blocked
            device.removeEventListener('advertisementreceived', onAdvertisement);
            try {
              await setupDevice(device);
              resolve(true);
            } catch (fallbackError) {
              resolve(false);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Auto-connect critical failure:', error);
  }
  return false;
};

export const printOrderReceipt = async (order: any) => {
  if (!printerCharacteristic) {
    console.warn('Printer not connected');
    return;
  }

  try {
    const encoder = new TextEncoder();
    const initCmd = new Uint8Array([0x1B, 0x40]); // Initialize
    const alignCenterCmd = new Uint8Array([0x1B, 0x61, 0x01]); // Align Center
    const alignLeftCmd = new Uint8Array([0x1B, 0x61, 0x00]); // Align Left
    const boldOnCmd = new Uint8Array([0x1B, 0x45, 0x01]); // Bold On
    const boldOffCmd = new Uint8Array([0x1B, 0x45, 0x00]); // Bold Off

    // Header
    const headerData = encoder.encode(
      "--------------------------------\n" +
      "   GOLDEN CAFE RESTAURANT   \n" +
      "--------------------------------\n\n"
    );

    // Order Info
    const orderInfoData = encoder.encode(
      `Order: ${order.id ? order.id : '#' + (Math.floor(Math.random() * 1000) + 1000)}\n` +
      `Table: ${order.table}\n` +
      `Type:  ${order.type}\n` +
      "--------------------------------\n"
    );

    // Total
    const totalData = encoder.encode(
      `TOTAL: $${order.total.toFixed(2)}\n` +
      "--------------------------------\n" +
      "       THANK YOU!       \n\n\n\n\n"
    );

    // Write sequence
    await printerCharacteristic.writeValue(initCmd);
    await printerCharacteristic.writeValue(alignCenterCmd);
    await printerCharacteristic.writeValue(headerData);

    await printerCharacteristic.writeValue(alignLeftCmd);
    await printerCharacteristic.writeValue(orderInfoData);

    // Print items individually to avoid Bluetooth MTU limits
    for (const item of order.items) {
      let itemStr = `${item.quantity}x ${item.name.substring(0, 20)}\n`;
      itemStr += `   $${item.price.toFixed(2)}\n`;
      if (item.notes) {
        itemStr += `   *${item.notes}*\n`;
      }
      await printerCharacteristic.writeValue(encoder.encode(itemStr));
    }
    await printerCharacteristic.writeValue(encoder.encode("--------------------------------\n"));

    await printerCharacteristic.writeValue(alignCenterCmd);
    await printerCharacteristic.writeValue(boldOnCmd);
    await printerCharacteristic.writeValue(totalData);
    await printerCharacteristic.writeValue(boldOffCmd);

    console.log('Order receipt printed successfully!');
  } catch (error) {
    console.error('Error printing receipt:', error);
  }
};

export const printQRCode = async (url: string, tableNumber: string | number) => {
  if (!printerCharacteristic) {
    console.warn('Printer not connected');
    return;
  }

  try {
    const encoder = new TextEncoder();
    
    // 1. Initialize & Center Align
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x40]));
    await printerCharacteristic.writeValue(new Uint8Array([0x1B, 0x61, 0x01]));
    
    // Header
    const headerData = encoder.encode(
      "--------------------------------\n" +
      `   TABLE ${tableNumber} QR CODE   \n` +
      "--------------------------------\n\n"
    );
    await printerCharacteristic.writeValue(headerData);
    
    // QR Code ESC/POS Commands (Function 180)
    // Model 2
    await printerCharacteristic.writeValue(new Uint8Array([0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
    // Module Size (8 dots)
    await printerCharacteristic.writeValue(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08]));
    // Error Correction (M = 15%)
    await printerCharacteristic.writeValue(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]));
    
    // Store QR Data
    const urlData = encoder.encode(url);
    const pL = (urlData.length + 3) % 256;
    const pH = Math.floor((urlData.length + 3) / 256);
    
    const storeDataCmd = new Uint8Array(8 + urlData.length);
    storeDataCmd.set([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30], 0);
    storeDataCmd.set(urlData, 8);
    await printerCharacteristic.writeValue(storeDataCmd);
    
    // Print QR Code
    await printerCharacteristic.writeValue(new Uint8Array([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]));
    
    // Footer & Feed
    const footerData = encoder.encode(
      "\n\nScan this code to view\nour menu and order!\n\n\n\n\n"
    );
    await printerCharacteristic.writeValue(footerData);
    
    console.log(`QR Code for Table ${tableNumber} printed successfully!`);
  } catch (error) {
    console.error('Error printing QR:', error);
  }
};

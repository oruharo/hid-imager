import { WebSerial } from "./webSerial";
import { DfuBootloader } from "./dfu";

const serial = new WebSerial();

function sleep(ms: number) {
  console.log(`sleep ${ms}`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function flashFirmware(firmName: string, notifyProgress: (progress: number) => void) {

  try {
    const dat = await fetch(`${firmName}.dat`);
    const bin = await fetch(`${firmName}.bin`);
    if (!(dat.ok && bin.ok)) {
      console.error("failed to load file");
      return;
    }
    console.log("target firmware is found");

    await serial.close();
    await serial.open();
    serial.startReadLoop();

    await serial.writeString("\x03\ndfu\n\xc0", 128, 5);
    await sleep(100);
    const dfu = new DfuBootloader(serial);
    console.log("dfu check start");
    const is_dfu = await dfu.checkIntegrity();
    if (!is_dfu) {
      console.error("dfu not found");
      return;
    }
    console.log("dfu found");

    const initPacket = await dat.arrayBuffer();
    await dfu.sendInitpacket(new Uint8Array(initPacket));

    const firmImage = await bin.arrayBuffer();
    await dfu.sendFirmware(new Uint8Array(firmImage), (progress) => {
      notifyProgress(progress);
    });
  } catch (e) {
    console.error(e);
    return;
  }
  await serial.close();
  console.log("update completed");
}



//----------------------------------------------------------------------------------
export async function flashConfig() {
  console.log("flashConfig");

  try {
    await serial.close();
    console.log("finish close");
    await serial.open();
    console.log("finish open");
    serial.startReadLoop();

    await sendConfig("config", "0", "config/cocot46/cocot46_config.json");
    await sendConfig("keymap", "1", "config/cocot46/cocot46_keymap.json");
    await sendConfig("tapterm", "2", "config/cocot46/cocot46_tapterm.json");
    await sendConfig("encoder", "3", "config/cocot46/cocot46_encoder.json");

  } catch (e) {
    console.error(e);
    return;
  } finally {
    await serial.close();
  }
}


async function sendConfig(fileType: string, fileNo: string, fileUrl: string) {
  console.log(`sendConfig ${fileType}`);
  const file = await fetch(fileUrl);
  console.log("finish fetch");

  if (!file.ok) {
    console.error("failed to load file");
    return;
  }
  console.log(file.text);

  let json = await file.json();
  console.log("finish json");
  const fileString = JSON.stringify(json);

  let rec = "";
  serial.setReceiveCallback((array) => {
    rec += String.fromCharCode(...array);
  });
  await serial.writeString("\x03");    // ctrl+c
  await serial.writeString(`file ${fileType}\n`);
  await serial.writeString(fileString, 128, 10);
  await serial.writeString("\0");
  await sleep(100);
  await serial.writeString("\n");
  await serial.writeString(`update ${fileNo}\n`);

  for (let i = 0; i < 20; i++) {
    await sleep(100);
    if (rec.trim().split("\r\n").pop()?.includes("Write succeed")) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" + rec);
      return true;
    }
  }
  console.log("xxxxx fail xxxxxxxxxxxxxxxxxx\n" + rec);
  return Promise.reject(new Error(`Failed to Update ${fileType}`));
}

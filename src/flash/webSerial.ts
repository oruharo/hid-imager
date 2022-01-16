class WebSerial {
  private receiveCallback?: (msg: Uint8Array) => void;
  private closeCallback?: () => void;
  private errorCallback?: (e: Error) => void;

  private port?: SerialPort;
  private writable: WritableStream | null = null;
  private reader: ReadableStreamDefaultReader | null = null;

  private _connected: boolean = false;
  private _readloopRunning: boolean = false;
  get connected() {
    return this._connected;
  }

  setReceiveCallback(recvHandler?: (msg: Uint8Array) => void) {
    this.receiveCallback = recvHandler;
  }
  setErrorCallback(handler?: (e: Error) => void) {
    this.errorCallback = handler;
  }
  setCloseCallback(handler?: () => void) {
    this.errorCallback = handler;
  }

  //--------------------------------------------------
  async open(onConnect?: () => void) {
    navigator.serial.addEventListener('connect', e => {
      console.log("connect", e);
    });
    navigator.serial.onconnect = e => {
      console.log("connect2", e);
    }

    navigator.serial.addEventListener('disconnect', e => {
      console.log("disconnect", e);
    });

    let ports = await navigator.serial.getPorts();
    console.log(ports);
    try {
      this.port = await navigator.serial.requestPort();
      console.log("requestPort success", this.port);
    } catch (e) {
      console.error("requestPort fail", e);
      return Promise.reject(e);
    }
    this.port.onconnect = e => {
      console.log("connect3", e);
    }
    ports = await navigator.serial.getPorts();
    console.log(ports);
    try {
      console.log("open port");
      await this.port.open({ baudRate: 115200, bufferSize: 81920 });
    } catch (e) {
      console.error("port open fail", e);
      await this.port.close();
      return Promise.reject(e);
    }
    ports = await navigator.serial.getPorts();
    console.log(ports);

    this._connected = true;
    this._readloopRunning = false;

    if (onConnect) {
      onConnect();
    }

    this.writable = this.port.writable;
    console.log("open serial port");
  }

  async startReadLoop() {
    this.readLoop();
    await this.sleep(1000);
  }

  private async readLoop() {
    if (this.port == null) {
      console.error("failed to read from serial port");
      return;
    }

    try {
      this.reader = this.port.readable!.getReader(); //xxxxxx
      console.log("start read loop");
      for (; ;) {
        const { done, value } = await this.reader.read();

        if (value) {
          console.log(`serial received: ${value.byteLength}byte`);

          if (this.receiveCallback) {
            this.receiveCallback(value);
          }
        }

        if (done) {
          console.log("Web serial read complete", done);
          if (this.reader) {
            this.reader.releaseLock();
          }

          this._readloopRunning = false;

          break;
        }
      }
    } catch (e) {
      this._readloopRunning = false;
      console.error(e);
      if (this.errorCallback) {
        this.errorCallback(e as any);
      }

      await this.close();
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve: any) => setTimeout(resolve, ms));
  }

  async writeString(msg: string, chunk = 64, interval = 30) {
    await this.write(new TextEncoder().encode(msg), chunk, interval);
  }

  async write(msg: Uint8Array, chunk = 64, interval = 30) {
    if (this.writable == null) {
      return;
    }

    const writer = this.writable.getWriter();

    for (let index = 0; index < msg.length; index += chunk) {
      await writer.write(msg.slice(index, index + chunk));
      await this.sleep(interval);
    }

    writer.releaseLock();
  }

  async close() {
    if (!this.connected) {
      return;
    }

    if (this.reader) {
      try {
        await this.reader.cancel();
        this.reader.releaseLock();
      } catch (e) {
        console.error(e);
      } finally {
        this.reader = null;
      }
    }

    if (this.writable) {
      this.writable = null;
    }

    if (this.closeCallback) {
      this.closeCallback();
    }

    if (this.port) {
      try {
        await this.port.close();
        this.port = undefined;
        this._connected = false;
      } catch (e) {
        console.error(e);
      }
    }

    console.log("serial port closed");
  }
}

export { WebSerial };

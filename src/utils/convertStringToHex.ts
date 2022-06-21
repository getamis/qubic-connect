const convertStringToHex = (str: string) => {
  try {
    const bytesArr = new Uint8Array(Buffer.from(str));
    return (
      '0x' +
      Array.from(bytesArr, byte => {
        // eslint-disable-next-line no-bitwise
        return `0${(byte & 0xff).toString(16)}`.slice(-2);
      }).join('')
    );
  } catch (error) {
    return '';
  }
};

export default convertStringToHex;

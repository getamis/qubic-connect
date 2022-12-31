const convertStringToHex = (str: string): string => {
  let result = '0x';
  for (let i = 0; i < str.length; i += 1) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

export default convertStringToHex;

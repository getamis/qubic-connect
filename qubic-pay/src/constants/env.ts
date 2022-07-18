const TAPPAY_APP_KEY = process.env.REACT_APP_TAPPAY_APP_KEY as string;
const TAPPAY_APP_ID = process.env.REACT_APP_TAPPAY_APP_ID as string;
const TAPPAY_ENV = process.env.REACT_APP_TAPPAY_ENV as string;


if (!TAPPAY_APP_KEY) {
  throw Error('env variable TAPPAY_APP_KEY not found');
}

if (!TAPPAY_APP_ID) {
  throw Error('env variable TAPPAY_APP_ID not found');
}

if (!TAPPAY_ENV) {
  throw Error('env variable TAPPAY_ENV not found');
}

export {
  TAPPAY_APP_KEY,
  TAPPAY_APP_ID,
  TAPPAY_ENV,
};

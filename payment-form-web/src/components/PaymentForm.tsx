import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'react-i18next';

import { TAPPAY_APP_ID, TAPPAY_APP_KEY, TAPPAY_ENV } from '../constants/env';
import { validateName, validateEmail, validatePhone } from '../utils/validators';
import ErrorContent from './ErrorContent';
import { getCommonClasses } from './styles';

enum INPUT_ID {
  USER_NAME = 'user-name-input',
  EMAIL = 'user-email-input',
  PHONE = 'user-tel-input',
}

export type PaymentInputRequirement = 'hide' | 'optional' | 'required';
export type SubmitButtonVariant = 'fill' | 'border';

export type PaymentFormProps = {
  primaryColor: string;
  submitButtonVariant: SubmitButtonVariant;
};

type ErrorField = { id: string; reason: string };

const USER_NAME_MAX_LENGTH = 100;

const getStatusTable = (t: TFunction): { [key: string]: string } => ({
  '0': t('payment.finish_form'),
  '1': t('payment.unfinished_form'),
  '2': t('payment.invalid_input'),
  '3': t('payment.user_inputting'),
});

const LOCALHOST_ORIGIN = 'http://localhost:3000';

const INIT_PRIMARY_COLOR = '#2962FF';
const INIT_SUBMIT_BUTTON_VARIANT = 'fill';

const tapPaycommonClasses = {
  input: {
    'font-family':
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Arial", sans-serif',
    color: '#5c5b5b',
    'font-size': '1rem',
    'font-weight ': 400,
    'line-height': 1.5,
  },
  // Styling ccv field
  'input.ccv': {
    'font-size': '16px',
    'font-weight ': 400,
  },
  // Styling expiration-date field
  'input.expiration-date': {},
  // Styling card-number field
  'input.card-number': {},
  // style focus state
  ':focus': {
    color: '#5c5b5b',
    'font-weight ': '500',
  },
  '::placeholder': {
    color: '#9D9D9D',
    'font-size': '1rem',
    'font-weight ': 300,
  },
  // style valid state
  '.valid': {
    color: '#5c5b5b',
  },
  // style invalid state
  '.invalid': {
    color: '#f14668',
  },
};

interface CreatorSdkData {
  primaryColor?: string;
  submitButtonVariant?: string;
}

const PaymentForm = (): JSX.Element => {
  const { t } = useTranslation();
  const statusTable = useMemo(() => getStatusTable(t), [t]);

  const [primaryColor, setPrimaryColor] = useState(INIT_PRIMARY_COLOR);
  const [submitButtonVariant, setSubmitButtonVariant] = useState(INIT_SUBMIT_BUTTON_VARIANT);

  const commonClasses = getCommonClasses(primaryColor);

  useEffect(() => {
    window.addEventListener('message', (ev: MessageEvent<CreatorSdkData>) => {
      const { data, origin } = ev;

      if (origin === LOCALHOST_ORIGIN) {
        if (data.primaryColor) {
          setPrimaryColor(data.primaryColor);
        }

        if (data.submitButtonVariant) {
          setSubmitButtonVariant(data.submitButtonVariant);
        }
      }
    });
  }, []);

  // We base on TWD.
  // If this asset is TWD base item, keep it, otherwise do exchanging
  const [submittable, setSubmittable] = useState<boolean>(false);
  const [tpSDKSetup, setTpSDKSetup] = useState<boolean>(false);
  const [accessLock, setAccessLock] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  const [errorField, setErrorField] = useState<ErrorField[]>([]);
  const [errorState, setErrorState] = useState<boolean>(false);
  const [errorStateMsg, setErrorStateMsg] = useState<string>('');
  const [errorStateDetail, setErrorStateDetail] = useState<string>('');

  const isUserNameInputError = errorField.some(err => err.id === INPUT_ID.USER_NAME);
  const isEmailInputError = errorField.some(err => err.id === INPUT_ID.EMAIL);
  const isPhoneInputError = errorField.some(err => err.id === INPUT_ID.PHONE);

  const activateErrorStep = useCallback((info: string, detail?: string) => {
    setErrorState(true);
    setErrorStateMsg(info);
    setErrorStateDetail(detail || '');
  }, []);

  const setupTapPay = useCallback(() => {
    // @ts-ignore
    if (window.TPDirect && !tpSDKSetup) {
      const fields = {
        number: {
          element: '#card-number',
          placeholder: t('payment.card_num_placeholder'),
        },
        expirationDate: {
          element: '#card-expiration-date',
          placeholder: t('payment.card_date_placeholder'),
        },
        ccv: {
          element: '#card-ccv',
          placeholder: t('payment.card_ccv_placeholder'),
        },
      };
      // @ts-ignore
      TPDirect.setupSDK(TAPPAY_APP_ID, TAPPAY_APP_KEY, TAPPAY_ENV);
      TPDirect.card.setup({
        // @ts-ignore
        fields,
        commonClasses: tapPaycommonClasses,
      });

      try {
        // @ts-ignore
        TPDirect.card.onUpdate(update => {
          const { canGetPrime, hasError } = update;

          if (hasError) {
            console.error(
              `canGetPrime: ${update.canGetPrime} \n
                card_numberStatus: ${statusTable[update.status.number]} \n
                cardExpiryStatus: ${statusTable[update.status.expiry]} \n
                cvcStatus: ${statusTable[update.status.ccv]}`.replace(/ {4}/g, ''),
            );
          }

          if (!canGetPrime) {
            setSubmittable(false);
            return;
          }

          setSubmittable(true);
        });
      } catch (err) {
        // do nothing
      }

      setTpSDKSetup(true);

      // eslint-disable-next-line no-console
      console.info('TPDirect setup');
    }
  }, [statusTable, t, tpSDKSetup]);

  const handleNameChange = useCallback((ev: React.FormEvent<HTMLInputElement>) => {
    setUserName(ev?.currentTarget.value);
  }, []);

  const handleEmailChange = useCallback((ev: React.FormEvent<HTMLInputElement>) => {
    setUserEmail(ev?.currentTarget.value);
  }, []);

  const handlePhoneChange = useCallback((ev: React.FormEvent<HTMLInputElement>) => {
    setUserPhone(ev?.currentTarget.value);
  }, []);

  const formValidator = useCallback(() => {
    let result = true;
    const errorFields = [];

    if (!userName) {
      result = false;
      errorFields.push({ id: INPUT_ID.USER_NAME, reason: t('payment.user_name_required') });
    }

    if (userName?.length > USER_NAME_MAX_LENGTH) {
      result = false;
      errorFields.push({
        id: INPUT_ID.USER_NAME,
        reason: t('payment.user_name_error', { limit: USER_NAME_MAX_LENGTH }),
      });
    }

    if (!validateName(userName)) {
      result = false;
      errorFields.push({ id: INPUT_ID.USER_NAME, reason: t('payment.user_name_invalid') });
    }

    if (!userEmail || !validateEmail(userEmail)) {
      result = false;
      errorFields.push({ id: INPUT_ID.EMAIL, reason: t('payment.email_invalid') });
    }

    if (!userPhone) {
      result = false;
      errorFields.push({ id: INPUT_ID.PHONE, reason: t('payment.please_enter_phone') });
    }

    if (userPhone && !validatePhone(userPhone)) {
      result = false;
      errorFields.push({ id: INPUT_ID.PHONE, reason: t('payment.invalid_phone_number') });
    }

    setErrorField(errorFields);

    return result;
  }, [userName, userEmail, userPhone, t]);

  const handleBuyAsset = useCallback(async () => {
    if (!formValidator()) {
      console.error('Form Validation not passed');
      return;
    }

    if (!tpSDKSetup) {
      activateErrorStep('Third Party SDK Install Error');
      return;
    }

    // @ts-ignore
    TPDirect.card.getPrime(async result => {
      if (result.status !== 0) {
        console.error(`get prime error ${result.msg}`);

        activateErrorStep('Third-Party Error.');
        return;
      }

      const prime = result.card?.prime;

      if (prime) {
        setAccessLock(true);

        // eslint-disable-next-line no-console
        console.log('AAA, prime', prime);

        window.parent.postMessage(
          {
            primeData: {
              prime: result.card?.prime,
              userEmail,
              userName,
              userPhone,
            },
          },
          '*',
        );
      }
    });
  }, [formValidator, tpSDKSetup, activateErrorStep, userEmail, userName, userPhone]);

  useEffect(() => {
    const existingScript = document.getElementById('tappay-sdk');

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.tappaysdk.com/tpdirect/v5.7.0';
      script.id = 'tappay-sdk';
      document.body.appendChild(script);
      script.onload = () => {
        setupTapPay();
      };
    }
  }, [setupTapPay]);

  const submitButtonClass = useMemo(() => {
    switch (submitButtonVariant) {
      case 'border':
        return 'submitBtnBorder';
      case 'fill':
      default:
        return 'submitBtnFill';
    }
  }, [submitButtonVariant]);

  if (errorState) {
    return <ErrorContent reason={errorStateMsg} detail={errorStateDetail} />;
  }

  return (
    <div className={clsx('columns', commonClasses.paymentMain)}>
      <div className="column">
        <div className={commonClasses.paymentBlock}>
          <div className={commonClasses.paymentTitle}>
            <span>{t('payment.payment_info')}</span>
          </div>
        </div>

        <div className={commonClasses.paymentBlock}>
          <input
            className={clsx(commonClasses.input, commonClasses.outlinedInput, isUserNameInputError && 'is-danger')}
            id={INPUT_ID.USER_NAME}
            type="text"
            placeholder={t('payment.name_placeholder')}
            value={userName}
            onChange={handleNameChange}
            disabled={accessLock}
          />
          {isUserNameInputError && (
            <p className={commonClasses.help}>{errorField.find(err => err.id === INPUT_ID.USER_NAME)?.reason}</p>
          )}
        </div>

        <div className={commonClasses.paymentBlock}>
          <input
            className={clsx(commonClasses.input, commonClasses.outlinedInput, isEmailInputError && 'is-danger')}
            id={INPUT_ID.EMAIL}
            type="email"
            placeholder={t('payment.email_placeholder')}
            value={userEmail}
            onChange={handleEmailChange}
            disabled={accessLock}
          />
          {isEmailInputError && (
            <p className={commonClasses.help}>{errorField.find(err => err.id === INPUT_ID.EMAIL)?.reason}</p>
          )}
        </div>

        <div className={commonClasses.paymentBlock}>
          <input
            className={clsx(commonClasses.input, commonClasses.outlinedInput, isPhoneInputError && 'is-danger')}
            id={INPUT_ID.PHONE}
            type="tel"
            placeholder={t('payment.phone_placeholder')}
            value={userPhone}
            onChange={handlePhoneChange}
            disabled={accessLock}
          />
          {isPhoneInputError && (
            <p className={commonClasses.help}>{errorField.find(err => err.id === INPUT_ID.PHONE)?.reason}</p>
          )}
        </div>
        <div className={commonClasses.paymentBlock}>
          <div
            id="card-number"
            className={clsx(commonClasses.input, commonClasses.outlinedInput, accessLock && commonClasses.divDisabled)}
          />
        </div>

        <div className={commonClasses.paymentBlock}>
          <div className="columns">
            <div className="column is-8">
              <div
                id="card-expiration-date"
                className={clsx(
                  commonClasses.input,
                  commonClasses.outlinedInput,
                  accessLock && commonClasses.divDisabled,
                )}
              />
            </div>
            <div className="column is-4">
              <div
                id="card-ccv"
                className={clsx(
                  commonClasses.input,
                  commonClasses.outlinedInput,
                  accessLock && commonClasses.divDisabled,
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <button
            type="button"
            className={clsx(commonClasses.button, submitButtonClass, accessLock && 'is-loading')}
            disabled={!submittable || accessLock}
            onClick={handleBuyAsset}
          >
            {t('payment.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

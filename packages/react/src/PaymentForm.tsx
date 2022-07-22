import { Order } from '@qubic-creator/core';

import { PaymentFormProps as PreactPaymentFormProps } from '@qubic-creator/core/dist/components/PaymentForm';

import React, { useEffect, useRef } from 'react';
import { useQubicCreator } from './QubicCreatorContext';

interface Props extends Omit<PreactPaymentFormProps, 'getOrder'> {
  order: Order;
}

const PaymentForm = React.memo<Props>(props => {
  const { order, ...restProps } = props;
  const { qubicCreatorSdkRef } = useQubicCreator();
  const paymentFormRef = useRef(null);
  const setOrderRef = useRef<(value: Order) => void>();

  useEffect(() => {
    const { setOrder } = qubicCreatorSdkRef.current.createPaymentForm(paymentFormRef.current, {
      ...restProps,
    });
    setOrderRef.current = setOrder;
  }, [qubicCreatorSdkRef, restProps]);

  useEffect(() => {
    setOrderRef.current?.(order);
  }, [order]);

  return <div ref={paymentFormRef} />;
});

export default PaymentForm;

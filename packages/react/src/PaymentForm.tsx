import { Order } from '@qubic-connect/core';

import { PaymentFormProps as PreactPaymentFormProps } from '@qubic-connect/core/dist/components/PaymentForm';

import React, { useEffect, useRef } from 'react';
import { useQubicConnect } from './QubicConnectContext';

interface Props extends Omit<PreactPaymentFormProps, 'getOrder'> {
  order: Order;
}

const PaymentForm = React.memo<Props>(props => {
  const { order, ...restProps } = props;
  const { qubicConnectRef } = useQubicConnect();
  const paymentFormRef = useRef(null);
  const setOrderRef = useRef<(value: Order) => void>();

  useEffect(() => {
    const { setOrder } = qubicConnectRef.current.createPaymentForm(paymentFormRef.current, {
      ...restProps,
    });
    setOrderRef.current = setOrder;
  }, [qubicConnectRef, restProps]);

  useEffect(() => {
    setOrderRef.current?.(order);
  }, [order]);

  return <div ref={paymentFormRef} />;
});

export default PaymentForm;

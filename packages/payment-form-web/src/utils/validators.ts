export const validateName = (name: string): boolean => {
  // Should use unicode category check
  // but there's babel open issue: https://github.com/babel/babel/issues/13815
  // return /^[\p{L} \-]{1,100}$/u.test(name?.trim());

  // Before babel issue fixed, using simpler check instead
  return /^[^<>&'"]{1,100}$/.test(name);
};

export const validateEmail = (email: string): boolean => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?\d{9,20}$/.test(phone);
};

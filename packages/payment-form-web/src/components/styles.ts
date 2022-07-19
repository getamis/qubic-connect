import jss, { Classes } from 'jss';
import preset from 'jss-preset-default';

jss.setup(preset());

export const getCommonClasses = (primaryColor = '#275ec5'): Classes => {
  const { classes: commonClasses } = jss
    .createStyleSheet({
      paymentMain: {
        width: '100%',
        fontSize: '1.125rem',
        padding: '0.75rem',
      },
      paymentTitle: {
        fontWeight: 600,
      },
      paymentBlock: {
        marginBottom: '1.5rem',
      },
      button: {
        width: '100%',
        height: '3.375rem',
        borderRadius: '2.2rem',
        cursor: 'pointer',
        justifyContent: 'center',
        padding: 'calc(0.5em - 2px) 1em',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      },
      submitBtnBorder: {
        backgroundColor: 'transparent',
        border: `1px solid ${primaryColor}`,
        color: primaryColor,
      },
      submitBtnFill: {
        backgroundColor: primaryColor,
        border: 'none',
        color: '#FFF',
      },
      divDisabled: {
        background: 'whitesmoke',
      },
      upperDivider: {
        borderTop: 'dashed 1px #9D9D9D',
        marginTop: '2rem',
        padding: '2rem 0 2rem 0',
      },
      input: {
        boxShadow: 'none',
        maxWidth: '100%',
        width: '100%',
        alignItems: 'center',
        border: '2px solid transparent',
        borderRadius: '0.9rem',
        display: 'flex',
        fontSize: '1rem',
        height: '2.5em',
        justifyContent: 'flex-start',
        lineHeight: 1.5,
        padding: 'calc(0.5em - 2px) calc(0.75em - 2px)',
        position: 'relative',
        '&:hover': {
          borderColor: primaryColor,
        },
        '&:active': {
          borderColor: primaryColor,
        },
        '&.is-danger': {
          borderColor: '#FF5454',
        },
      },
      outlinedInput: {
        borderColor: '#f8f8f8',
        fontSize: '1rem',
        color: '#222',
        fontWeight: 500,
      },
      help: {
        color: '#FF5454',
        display: 'block',
        fontSize: '0.75rem',
        margin: '0.25rem 0 0 0.25rem',
      },
      'is-8': {
        width: '66.66%',
        padding: '0.5rem',
      },
      'is-4': {
        width: '33.33%',
      },
      infoMsgMain: {
        display: 'flex',
        width: '100%',
        minHeight: '17.5rem',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0',
      },
      lottieContainer: {
        width: '10rem',
        height: '10rem',
      },
      lottieErrorContainer: {
        width: '4rem',
        height: '4rem',
        margin: '3rem',
      },
      hint: {
        fontSize: '0.875rem',
        color: '#f2f1ea',
        textAlign: 'center',
        '& strong': {
          fontSize: '1.125rem',
          color: '#37bb43',
        },
      },
      row: {
        maxWidth: '21rem',
        marginBottom: '1rem',
      },
      errorStrong: {
        fontSize: '1.125rem',
        color: '#e44d42',
      },
    })
    .attach();

  return commonClasses;
};

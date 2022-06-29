import jss from 'jss';
import preset from 'jss-preset-default';

// One time setup with default plugins and settings.
jss.setup(preset());

export const { classes: commonClasses } = jss
  .createStyleSheet({
    text: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '20px',
    },
    button: {
      width: '100%',
      borderRadius: '4px',
      border: 0,
      padding: '6px 16px',
      margin: '20px 0',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonWhite: {
      color: '#212121',
      backgroundColor: '#fff',
    },
  })
  .attach();

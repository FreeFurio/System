# Polotno

https://polotno.com/

JS framework for making your own canva-like design editors.

## Install

```bash
npm install polotno
```

## Demo app

```js
import { createDemoApp } from 'polotno/polotno-app';

const { store } = createDemoApp({
  container: document.getElementById('root'),
  key: 'YOUR_API_KEY', // you can create it here: https://polotno.com/cabinet/
});
```

## License

1. You can use this package for free for non-commercial products and local development process.
2. For commercial usage you have to buy a licence here: https://polotno.com/
3. Please respect the copyright.

For more information take a look into [LICENSE.md](/LICENSE.md).

import React, { Component } from 'react';
import Papa from 'papaparse';
import {
  isEmpty,
  convertKeysToLowerCase,
  createModel
} from './utils/utils';
import solver from 'javascript-lp-solver';

class App extends Component {
  constructor() {
    super();
    this.state = {
      csvProductFile: null,
      csvOrderFile: null,
      // productFileData: [
      //   {
      //     code: 'VS5',
      //     name: 'Vegemite Scroll',
      //     packs: [
      //       { cost: '6.99', quantity: '3' },
      //       { cost: '8.99', quantity: '5' }
      //     ]
      //   },
      //   {
      //     code: 'MB11',
      //     name: 'Blueberry Muffin',
      //     packs: [
      //       { cost: '9.95', quantity: '2' },
      //       { cost: '16.95', quantity: '5' },
      //       { cost: '24.95', quantity: '8' }
      //     ]
      //   },
      //   {
      //     code: 'CF',
      //     name: 'Croissant',
      //     packs: [
      //       { cost: '5.95', quantity: '3' },
      //       { cost: '9.95', quantity: '5' },
      //       { cost: '16.99', quantity: '9' }
      //     ]
      //   }
      // ],
      // orderFileData: [
      //   { code: 'VS5', quantity: '10' },
      //   { code: 'MB11', quantity: '14' },
      //   { code: 'CF', quantity: '13' }
      // ],
      productFileData: [],
      orderFileData: [],
      packsToDelivery: [],
      loading: false,
      currentFile: '',
      errorMsg: {}
    };
  }

  componentDidMount() {
    const {
      csvProductFile,
      csvOrderFile,
      productFileData,
      orderFileData,
      packsToDelivery,
      currentFile,
      loading
    } = this.state;

    if (
      !isEmpty(productFileData) &&
      !isEmpty(orderFileData) &&
      isEmpty(packsToDelivery) &&
      loading === false
    ) {
      console.log('READY', orderFileData);
      const resultsData = [];

      for (let i = 0; i < orderFileData.length; i++) {
        const item = orderFileData[i];

        for (let p = 0; p < productFileData.length; p++) {
          const product = productFileData[p];

          if (item.code === product.code) {
            const model = createModel(product, item.quantity);
            let results = solver.Solve(model);
            console.log('results', results);
            console.log('item.quantity', item);
            console.log('product', product);
            const rData = {
              ...results,
              code: item.code,
              name: product.name,
              ordered: item.quantity
            };
            resultsData.push(rData);
          }
        }
      }

      this.setState({
        packsToDelivery: resultsData,
        loading: false
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      csvProductFile,
      csvOrderFile,
      productFileData,
      orderFileData,
      packsToDelivery,
      currentFile,
      loading
    } = this.state;

    if (!loading && prevState.csvProductFile !== csvProductFile) {
      // console.log('hit');

      this.setState({
        loading: true,
        currentFile: 'product'
      });
    }
    if (!loading && prevState.csvOrderFile !== csvOrderFile) {
      this.setState({
        loading: true,
        currentFile: 'order'
      });
    }
    if (prevState.currentFile !== currentFile) {
      console.log('hit1');
      this.importCSV();
    }

    if (prevState.productFileData !== productFileData) {
      this.setState({
        loading: false
      });
    }
    if (prevState.orderFileData !== orderFileData) {
      this.setState({
        loading: false
      });
    }

    if (
      !isEmpty(productFileData) &&
      !isEmpty(orderFileData) &&
      isEmpty(packsToDelivery) &&
      loading === false
    ) {
      // console.log('READY', orderFileData);
      const resultsData = [];

      for (let i = 0; i < orderFileData.length; i++) {
        const item = orderFileData[i];

        for (let p = 0; p < productFileData.length; p++) {
          const product = productFileData[p];

          if (item.code === product.code) {
            const model = createModel(product, item.quantity);
            let results = solver.Solve(model);
            // console.log('results', results);
            // console.log('item.quantity', item);
            // console.log('product', product);
            const rData = {
              ...results,
              code: item.code,
              name: product.name,
              ordered: item.quantity
            };
            resultsData.push(rData);
          }
        }
      }

      this.setState({
        packsToDelivery: resultsData,
        loading: false
      });
    }
  }

  handleProductUpload = event => {
    console.log('event.target.files[0]', event.target.files[0].type);
    if (
      event.target.files[0].type === 'text/csv' &&
      !isEmpty(event.target.files)
    ) {
      this.setState({
        csvProductFile: event.target.files[0],
        errorMsg: {}
      });
    } else {
      let error = {
        product: 'Please upload a csv. file type'
      };
      this.setState({
        errorMsg: error
      });
    }
  };

  handleOrderUpload = event => {
    console.log('event.target.files[0]', event.target.files[0].type);
    if (
      event.target.files[0].type === 'text/csv' &&
      !isEmpty(event.target.files)
    ) {
      this.setState({
        csvOrderFile: event.target.files[0],
        errorMsg: {}
      });
    } else {
      this.setState({
        errorMsg: {
          order: 'Please upload a csv. file type'
        }
      });
    }
  };

  importCSV = () => {
    const { csvProductFile, csvOrderFile, currentFile } = this.state;

    if (currentFile === 'product') {
      Papa.parse(csvProductFile, {
        complete: this.updateProductData,
        header: true
      });
    }
    if (currentFile === 'order') {
      Papa.parse(csvOrderFile, {
        complete: this.updateOrderData,
        header: true
      });
    }
  };

  updateProductData = result => {
    let data = result.data;
    // Check data keys match required data
    let checkData = false;
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      let keys = Object.keys(row);
      console.log('keys', keys);
      if (['name', 'code', 'packs'].includes(keys) > -1) {
        checkData = true;
      } else {
        checkData = false;
      }
    }

    if (!checkData) {
      console.log('Error');
      this.setState({
        errorMsg: {
          product: "File Columns titles must be 'Name','Code','Packs'"
        },
        loading: false,
        csvProductFile: null
      });
      return;
    }

    if (!isEmpty(data)) {
      const updatedProductData = data.map(d => {
        // Convert uData column titles into lowercased keys
        const lowercasedKeysData = convertKeysToLowerCase(d);
        // Convert packs into into an array of data separating the quanity & costs in each order
        let uPacksData = [];
        if (!isEmpty(lowercasedKeysData.packs)) {
          let packs = lowercasedKeysData.packs.split(/\r?\n/);
          for (let i = 0; i < packs.length; i++) {
            const pack = packs[i];
            const [quanity, cost] = pack.split('@');
            let uPack = {
              quantity: quanity.trim(),
              cost: cost.trim().replace('$', '')
            };
            uPacksData.push(uPack);
          }
        }
        // Update the orginal data set with the updated packs data
        if (!isEmpty(uPacksData)) {
          lowercasedKeysData.packs = uPacksData;
          return lowercasedKeysData;
        }
        return null;
      });
      this.setState({
        errorMsg: {},
        productFileData: updatedProductData
      });
    } else {
      this.setState({
        errorMsg: 'Uploaded file contained no purchase orders'
      });
    }
  };

  updateOrderData = result => {
    let data = result.data;

    // Check data keys match required data
    let checkData = false;
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      let keys = Object.keys(row);
      console.log('keys', keys);
      if (['quantity', 'code', 'packs'].includes(keys) > -1) {
        checkData = true;
      } else {
        checkData = false;
      }
    }

    if (!checkData) {
      console.log('Error');
      this.setState({
        errorMsg: {
          order: "File Columns titles must be 'Quantity','Code'"
        },
        loading: false,
        csvOrderFile: null
      });
      return;
    }

    if (!isEmpty(data)) {
      const updatedProductData = data.map(d => {
        // Convert uData column titles into lowercased keys
        const lowercasedKeysData = convertKeysToLowerCase(d);
        return lowercasedKeysData;
      });
      this.setState({
        errorMsg: {},
        orderFileData: updatedProductData
      });
    } else {
      this.setState({
        errorMsg: 'Uploaded file contained no purchase orders'
      });
    }
  };

  displayPackTypes = orderObj => {
    const objKeys = Object.keys(orderObj);
    // console.log('objKeys', objKeys);
    let filteredKeys = objKeys.filter(key => {
      // console.log('key', key);
      return key.includes('pack');
    });
    let packTypes = filteredKeys.map((packType, i) => {
      let quanity = orderObj[packType];
      if (quanity !== 0) {
        return (
          <p key={i}>
            {packType} * {quanity}
          </p>
        );
      }
    });

    return packTypes;
  };

  render() {
    const { packsToDelivery, errorMsg } = this.state;

    let shippingInfo = null;

    console.log('state', this.state);

    if (!isEmpty(packsToDelivery)) {
      shippingInfo = packsToDelivery.map(order => {
        return (
          <li key={order.code}>
            <div>{order.code}</div>
            <div>{order.name}</div>
            <div>{order.ordered}</div>
            <div>{this.displayPackTypes(order)}</div>
            <div>${order.result}</div>
          </li>
        );
      });
    }

    return (
      <section className="header">
        <h1>Bakery Order Processing</h1>
        <h3>Saving Your Shipping Space</h3>

        <div className="uploadBanner">
          <ul>
            <li>
              <div>
                <input
                  id="file-upload-product"
                  className="inputfile product"
                  type="file"
                  onChange={this.handleProductUpload}
                />
                <label htmlFor="file-upload-product">
                  Upload Product Data CSV. File
                </label>
              </div>
              {errorMsg.product && <span>{errorMsg.product}</span>}
            </li>
            <li>
              <div>
                <input
                  id="file-upload-order"
                  className="inputfile"
                  type="file"
                  ref={input => {
                    this.filesInput = input;
                  }}
                  name="file"
                  onChange={this.handleOrderUpload}
                />
                <label htmlFor="file-upload-order">
                  Upload Purchase Order CSV. File
                </label>
              </div>
              {errorMsg.order && <span>{errorMsg.order}</span>}
            </li>
          </ul>
        </div>
        {shippingInfo && (
          <ul className="shippingInfo">
            <li>
              <div>Code</div>
              <div>Product Name</div>
              <div>Quanity</div>
              <div>Packs</div>
              <div>Total</div>
            </li>
            {shippingInfo}
          </ul>
        )}
      </section>
    );
  }
}

export default App;

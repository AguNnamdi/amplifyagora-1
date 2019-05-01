import React, { useState } from 'react'
import { PhotoPicker } from 'aws-amplify-react'
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from 'element-react'

const NewProduct = () => {
  const [values, setValues] = useState({
    description: '',
    price: '',
    shipped: false,
  })

  const handleAddProduct = event => {
    if (event) event.preventDefault()
    console.log('Product added')
  }

  const handleChange = event => {
    event.persist()
    setValues(values => ({
      ...values,
      [event.target.name]: event.target.value,
    }))
  }

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              value={values.description}
              placeholder="Description"
              onChange={description => setValues({ description })}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              value={values.price}
              placeholder="Price ($USD)"
              onChange={price => setValues({ price })}
            />
          </Form.Item>
          <Form.Item label="Is the product shipped or emailed to the customer?">
            <div className="text-center">
              <Radio
                value="true"
                checked={values.shipped === true}
                onChange={() => setValues({ shipped: true })}
              >
                Shipped
              </Radio>
              <Radio
                value="false"
                checked={values.shipped === false}
                onChange={() => setValues({ shipped: false })}
              >
                Emailed
              </Radio>
            </div>
          </Form.Item>
          <PhotoPicker />
          <Form.Item>
            <Button type="primary" onClick={handleAddProduct}>
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default NewProduct

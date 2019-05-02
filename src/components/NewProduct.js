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
import useForm from '../components/helpers/useForm'

const NewProduct = () => {
  const initialValues = {
    description: '',
    price: '',
    imagePreview: '',
    image: '',
    shipped: false,
  }
  const { values, handleChange, handleSubmit } = useForm(
    handleAddProduct,
    initialValues
  )

  function handleAddProduct(event) {
    if (event) event.preventDefault()
    console.log('values: ', values)
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
              onChange={description => handleChange({ description })}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              value={values.price}
              placeholder="Price ($USD)"
              onChange={price => handleChange({ price })}
            />
          </Form.Item>
          <Form.Item label="Is the product shipped or emailed to the customer?">
            <div className="text-center">
              <Radio
                value="true"
                checked={values.shipped === true}
                onChange={() => handleChange({ shipped: true })}
              >
                Shipped
              </Radio>
              <Radio
                value="false"
                checked={values.shipped === false}
                onChange={() => handleChange({ shipped: false })}
              >
                Emailed
              </Radio>
            </div>
          </Form.Item>
          {values.imagePreview && (
            <img
              className="image-preview"
              src={values.imagePreview}
              alt="Product Preview"
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={url => handleChange({ imagePreview: url })}
            onPick={file => handleChange({ image: file })}
            theme={{
              formContainer: {
                margin: 0,
                padding: '0.8em',
              },
              formSection: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
              sectionBody: {
                margin: 0,
                width: '250px',
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)',
              },
              photoPickerButton: {
                display: 'none',
              },
            }}
          />
          <Form.Item>
            <Button
              disabled={!values.description || !values.price || !values.image}
              type="primary"
              nativeType="submit"
              onClick={event => handleSubmit(event)}
            >
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default NewProduct

import React, { useContext } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { S3Image } from 'aws-amplify-react'
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio,
} from 'element-react'
import useForm from '../components/helpers/useForm'
import { updateProduct, deleteProduct } from '../graphql/mutations'
import { convertCentsToDollars, convertDollarsToCents } from '../utils'
import { UserContext } from '../App'
import PayButton from './PayButton'

const Product = ({ product }) => {
  const initialValues = {
    description: '',
    price: '',
    shipped: false,
    updateProductDialog: false,
    deleteProductDialog: false,
  }
  const { values, handleChange, handleSubmit } = useForm(initialValues)
  const { user } = useContext(UserContext)
  const isProductOwner = user && user.attributes.sub === product.owner

  const handleDeleteProduct = async event => {
    try {
      const input = {
        id: product.id,
      }
      await API.graphql(graphqlOperation(deleteProduct, { input }))
      Notification({
        title: 'Success',
        message: 'Product successfully deleted',
        type: 'success',
      })
    } catch (error) {
      console.error(`Error deleting product with id ${product.id}: `, error)
    }
  }

  const handleUpdateProduct = async event => {
    try {
      const input = {
        id: product.id,
        description: values.description,
        shipped: values.shipped,
        price: convertDollarsToCents(values.price),
      }
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      )
      console.log('result: ', result)
      Notification({
        title: 'Success',
        message: 'Product successfully updated',
        type: 'success',
      })
    } catch (error) {
      console.error(`Error updating product with id: ${product.id}: `, error)
    }
  }

  return (
    <div className="card-container">
      <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
        <S3Image
          theme={{ photoImg: { maxWidth: '100%', maxHeight: '100%' } }}
          imgKey={product.file.key}
        />
        <div className="card-body">
          <h3 className="m-0">{product.description}</h3>
          <div className="items-center">
            <img
              src={`https://icon.now.sh/${
                product.shipped ? 'markunread_mailbox' : 'mail'
              }`}
              alt="Shipping Icon"
              className="icon"
            />
            {product.shipped ? 'Shipped' : 'Emailed'}
          </div>
          <div className="text-right">
            <span className="mx-1">
              ${convertCentsToDollars(product.price)}
            </span>
            {!isProductOwner && <PayButton />}
          </div>
        </div>
      </Card>
      {/* Update / Delete Product Buttons */}
      <div className="text-center">
        {isProductOwner && (
          <>
            <Button
              type="warning"
              icon="edit"
              className="m-1"
              onClick={() =>
                handleChange({
                  updateProductDialog: true,
                  description: product.description,
                  shipped: product.shipped,
                  price: convertCentsToDollars(product.price),
                })
              }
            />
            <Popover
              placement="top"
              width="160"
              trigger="click"
              visible={values.deleteProductDialog}
              content={
                <>
                  <p>Do you want to delete this product?</p>
                  <div className="text-right">
                    <Button
                      size="mini"
                      type="text"
                      className="m-1"
                      onClick={() =>
                        handleChange({ deleteProductDialog: false })
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="mini"
                      className="m-1"
                      onClick={event =>
                        handleSubmit(event, handleDeleteProduct)
                      }
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              }
            >
              <Button
                type="danger"
                icon="delete"
                onClick={() => handleChange({ deleteProductDialog: true })}
              />
            </Popover>
          </>
        )}
      </div>
      {/* Update Product Dialog */}
      <Dialog
        title="Update Product"
        size="large"
        customClass="dialog"
        visible={values.updateProductDialog}
        onCancel={() => handleChange({ updateProductDialog: false })}
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Update Description">
              <Input
                icon="information"
                placeholder="Product Description"
                value={values.description}
                trim={true}
                onChange={description => handleChange({ description })}
              />
            </Form.Item>
            <Form.Item label="Update Price">
              <Input
                type="number"
                icon="plus"
                value={values.price}
                placeholder="Price ($USD)"
                onChange={price => handleChange({ price })}
              />
            </Form.Item>
            <Form.Item label="Update Shipping">
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
            <Form.Item />
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => handleChange({ updateProductDialog: false })}>
            Cancel
          </Button>
          <Button
            type="primary"
            nativeType="submit"
            onClick={event => handleSubmit(event, handleUpdateProduct)}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  )
}

export default Product

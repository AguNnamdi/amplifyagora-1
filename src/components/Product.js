import React, { useContext } from 'react'
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
import { convertCentsToDollars } from '../utils'
import { UserContext } from '../App'
import PayButton from './PayButton'

const Product = ({ product }) => {
  const { user } = useContext(UserContext)
  const isProductOwner = user && user.attributes.sub === product.owner

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
    </div>
  )
}

export default Product

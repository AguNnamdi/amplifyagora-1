import React, { useState, useContext } from 'react'
import {
  Form,
  Button,
  Dialog,
  Input,
  Select,
  Notification,
} from 'element-react'
import { API, graphqlOperation } from 'aws-amplify'
import { createMarket } from '../graphql/mutations'

const NewMarket = () => {
  const { user } = useContext(UserContext)
  const [marketName, setMarketName] = useState('')
  const [addMarketDialog, setAddMarketDialog] = useState(false)

  const handleAddMarket = async event => {
    try {
      event.preventDefault()
      setAddMarketDialog(false)
      const input = {
        name: marketName,
      }
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      )
      console.info(`Created market: id ${result.data.createMarket.id}`)
      setMarketName('')
    } catch (error) {
      console.error('Error adding new market ', error)
      Notification.error({
        title: 'Error',
        message: `{error.message || "Error adding market"}`,
      })
    }
  }
  return (
    <>
      <div className="market-header">
        <h1 className="market-title">
          Create Your MarketPlace
          <Button
            type="text"
            icon="edit"
            className="market-title-button"
            onClick={() => setAddMarketDialog(true)}
          />
        </h1>
      </div>
      <Dialog
        title="Create New Market"
        visible={addMarketDialog}
        onCancel={() => setAddMarketDialog(false)}
        size="large"
        customClass="dialog"
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Add Market Name">
              <Input
                placeholder="Market Name"
                type="text"
                name="marketName"
                value={marketName}
                trim={true}
                onChange={marketName => setMarketName(marketName)}
                required
              />
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
          <Button
            type="primary"
            nativeType="submit"
            disabled={!marketName}
            onClick={event => handleAddMarket(event)}
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

export default NewMarket

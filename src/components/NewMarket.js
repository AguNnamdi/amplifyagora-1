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
import { UserContext } from '../App'
import useForm from '../components/helpers/useForm'

const NewMarket = () => {
  const { user } = useContext(UserContext)
  const { values, handleChange, handleSubmit } = useForm(handleAddMarket)
  const [addMarketDialog, setAddMarketDialog] = useState(false)
  const tags = [
    'Arts',
    'Technology',
    'Web Development',
    'Crafts',
    'Entertainment',
  ]
  const [options, setOptions] = useState([])

  async function handleAddMarket(event) {
    try {
      setAddMarketDialog(false)
      const input = {
        name: values.marketName,
        tags: values.selectedTags,
        owner: user.username,
      }
      const result = await API.graphql(
        graphqlOperation(createMarket, { input })
      )
      console.info(`Created market: id ${result.data.createMarket.id}`)
      handleChange({ marketName: '', selectedTags: [] })
    } catch (error) {
      console.error('Error adding new market ', error)
      Notification.error({
        title: 'Error',
        message: `{error.message || "Error adding market"}`,
      })
    }
  }

  const handleFilteredTags = query => {
    const options = tags
      .map(tag => ({ value: tag, label: tag }))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()))
    setOptions(options)
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
                value={values.marketName}
                trim={true}
                onChange={marketName => handleChange({ marketName })}
                required
              />
            </Form.Item>
            <Form.Item label="Add Tags">
              <Select
                multiple={true}
                filterable={true}
                placeholder="Market Tags"
                name="selectedTags"
                value={values.selectedTags}
                onChange={selectedTags => handleChange({ selectedTags })}
                remoteMethod={handleFilteredTags}
                remote={true}
              >
                {options.map(option => (
                  <Select.Option
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
          <Button
            type="primary"
            nativeType="submit"
            disabled={!values.marketName}
            onClick={event => handleSubmit(event)}
          >
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  )
}

export default NewMarket

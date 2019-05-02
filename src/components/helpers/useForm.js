import { useState } from 'react'

const useForm = callback => {
  const [values, setValues] = useState({})

  const handleSubmit = event => {
    if (event) event.preventDefault()
    callback()
  }

  const handleChange = newValues => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues,
    }))
  }

  return {
    handleChange,
    handleSubmit,
    values,
  }
}

export default useForm

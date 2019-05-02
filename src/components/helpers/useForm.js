import { useState } from 'react'

const useForm = (callback, initialValues) => {
  const [values, setValues] = useState(initialValues)

  const handleSubmit = event => {
    if (event) event.preventDefault()
    callback()
    setValues(initialValues)
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

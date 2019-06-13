import { useState } from 'react'

const useForm = initialValues => {
  const [values, setValues] = useState({
    ...initialValues,
    isSubmitting: false,
  })

  const handleSubmit = (event, callback) => {
    if (event) event.preventDefault()
    setValues(prevValues => ({
      ...prevValues,
      isSubmitting: true,
    }))
    callback()
    setValues(() => ({
      ...initialValues,
      isSubmitting: false,
    }))
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

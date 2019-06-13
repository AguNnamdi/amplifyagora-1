import React from 'react'

const Error = ({ errors }) =>
  errors ? (
    <pre className="error">
      {errors.map(({ message }, index) => (
        <div key={index}>{message}</div>
      ))}
    </pre>
  ) : (
    <div>Sorry, couldn't load the page. Please try re-freshing the page.</div>
  )

export default Error

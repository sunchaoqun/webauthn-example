import { useState } from 'react'

import base64url from 'base64url'
import * as cbor from 'cbor-web'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

import Context from './Context'
import CredentialsCreateExample from './navigator.credentials.create'
import CredentialsGetExample from './navigator.credentials.get'



function App() {
  const [credential, setCredential] = useState(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <Context.Provider value={[credential, setCredential]}>
        <CredentialsCreateExample />
        { credential && <CredentialsGetExample />}
      </Context.Provider>
    </div>
  )
}




export default App;
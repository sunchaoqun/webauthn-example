import { useContext, useState } from 'react'
import Context from './Context'
import { CodeBox, ToggleCodeBox } from './Codebox'

const exampleCode = `const assertion = await navigator.credentials.get({
    publicKey: {
        challenge: Uint8Array.from(
            "randomStringFromServer", c => c.charCodeAt(0)),
        allowCredentials: [{
            id: base64url.toBuffer(credential.id),
            type: 'public-key',
            transports: ['usb', 'ble', 'nfc'],
        }],
        timeout: 60000,
    }
});`

function CredentialsGetExample() {
  const [credential, setCredential] = useContext(Context)

  const getPublickeyCredential = async () => {
    const publicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from(
        "randomStringFromServer", c => c.charCodeAt(0)),
      allowCredentials: [{
        id: credential.rawId,
        type: 'public-key',
        transports: ['usb', 'ble', 'nfc'],
      }],
      timeout: 60000,
    }
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });
    console.log(assertion)
  }


  return (
    <>
      <h2 className="text-xl font-medium py-4">navigator.credentials.get Example</h2>

      <CodeBox description="Javascript code to get publicKeyCredential:" children={exampleCode} />

      <button className="btn btn-primary mt-4" onClick={getPublickeyCredential}>Run example</button>

      <div className="divider"></div>


      <p> {credential && credential.id} </p>

      {/* <div>
        <p>PublicKey Crendential from gecredential2
        t()</p>
        <SyntaxHighlighter language="javascript" style={monokai}>
          {
            getCredential &&
            JSON.stringify({
              authenticatorAttachment: getCredential.authenticatorAttachment,
              id: getCredential.id,
              type: getCredential.type,
              rawId: base64url(getCredential.rawId),
              response: {
                authenticatorData: base64url.encode(getCredential.response.authenticatorData),
                signature: base64url.encode(getCredential.response.signature),
                clientDataJSON: base64url.encode(getCredential.response.clientDataJSON),
                userHandle: getCredential.userHandle,
              }
            }, null, 2)
          }
        </SyntaxHighlighter>
      </div>

      <div>
        <p>authenticatorData</p>
        <SyntaxHighlighter language="javascript" style={monokai}>
          {
            getCredential &&
            JSON.stringify({})
          }
        </SyntaxHighlighter>
      </div>

      <div>
        <p>signature</p>
        <SyntaxHighlighter language="javascript" style={monokai}>
          {
            getCredential &&
            base64url.encode(getCredential.response.signature)
          }
        </SyntaxHighlighter>
      </div>

      <div>
        <p>clientDataJSON</p>
        <SyntaxHighlighter language="javascript" style={monokai}>
          {
            getCredential && JSON.stringify(
              JSON.parse(new TextDecoder('utf-8').decode(getCredential.response.clientDataJSON)), null, 2)
          }
        </SyntaxHighlighter>
      </div> */}
    </>
  )
}

export default CredentialsGetExample;
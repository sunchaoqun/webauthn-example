import { useContext, useState } from 'react'
import base64url from 'base64url'
import * as cbor from 'cbor-x'
import * as asn1js from 'asn1js'
import * as pkijs from 'pkijs'


import Context from './Context'
import { CodeBox, ToggleCodeBox } from './Codebox'

const exampleCode = `const credential = await navigator.credentials.create({
  publicKey: {
    challenge: Uint8Array.from("randomStringFromServer", c => c.charCodeAt(0)),
    rp: {
        name: "Test WebAuthn",
        id: "${window.location.host}",
    },
    user: {
        id: Uint8Array.from("UZSL85T9AFC", c => c.charCodeAt(0)),
        name: "liuyangc3@gmail.com",
        displayName: "Liu Yang",
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
    },
    timeout: 60000,
    attestation: "none" //  "none" "direct"
  }
});
`

function CredentialsCreateExample() {
  const [credential, setCredential] = useContext(Context)

  const createPublickeyCredential = async () => {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: Uint8Array.from("randomStringFromServer", c => c.charCodeAt(0)),
        rp: {
          name: "Test WebAuthn",
          id: window.location.host,
        },
        user: {
          id: Uint8Array.from("UZSL85T9AFC", c => c.charCodeAt(0)),
          name: "liuyangc3@gmail.com",
          displayName: "Liu Yang",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
        },
        timeout: 60000,
        attestation: "none" //  "none" "direct" "indirect"
      },
    })
    console.log(credential)
    setCredential(credential)
  }

  return (
    <>
      <h2 className="text-xl font-medium py-4">navigator.credentials.create Example</h2>
      <CodeBox
        description="Javascript code to create publicKeyCredential:"
        children={exampleCode}
      />

      <button className="btn btn-primary mt-4" onClick={createPublickeyCredential}>Run example</button>

      <div className="divider"></div>

      {credential && <CredentialsCreateResult />}
    </>
  )
}

function CredentialsCreateResult() {
  const [credential, setCredential] = useContext(Context)

  const attestationObject = cbor.decode(new Uint8Array(credential.response.attestationObject))
  const authData = parseAuthenticatorData(attestationObject.authData)

  // console.log(authData.attestedCredentialData.credentialPublicKey)

  // const publicKeyDER = parsePublicKey(authData.attestedCredentialData.credentialPublicKey)

  // console.log(publicKeyDER)

  return (
    <>
      <h2 className="text-xl font-medium py-4">navigator.credentials.create Result</h2>
      <CodeBox description="publicKeyCredential Object" language="json">
        {JSON.stringify(
          {
            authenticatorAttachment: credential.authenticatorAttachment,
            id: credential.id,
            type: credential.type,
            rawId: base64url(credential.rawId),
            response: {
              attestationObject: base64url.encode(credential.response.attestationObject),
              clientDataJSON: base64url.encode(credential.response.clientDataJSON),
            },
          },
          null, 2) + `\n
response.getAuthenticatorData() // attestationObject an CBOR encoded ArrayBuffer     
[${new Uint8Array(credential.response.getAuthenticatorData())}]

response.getPublicKey() // containing the DER SubjectPublicKeyInfo
[${new Uint8Array(credential.response.getPublicKey())}]

response.getPublicKeyAlgorithm()
${credential.response.getPublicKeyAlgorithm()}

response.getTransports()
[${credential.response.getTransports()}]
`}
      </CodeBox>

      <CodeBox description="publicKeyCredential.response.attestationObject :" language="json">
        {`{
  "fmt": "${attestationObject.fmt}",
  "attStmt": ${JSON.stringify(attestationObject.attStmt)},
  "authData": [${attestationObject.authData}],
}`}
      </CodeBox>

      <CodeBox description="publicKeyCredential.response.attestationObject.authData :" language="json">
        {`{
  "rpIdHash": "${JSON.stringify(authData.rpIdHash)}",
  "flags": ${authData.flags},
  "signCount": ${authData.signCount},
  "attestedCredentialData": {
    "aaguid": [${authData.attestedCredentialData.aaguid}],
    "credentialIdLength": ${JSON.stringify(authData.attestedCredentialData.credentialIdLength)},
    "credentialId": [${authData.attestedCredentialData.credentialId}],
    "credentialPublicKey": [${authData.attestedCredentialData.credentialPublicKey}],
  },
}`}
      </CodeBox>

      <CodeBox description="publicKeyCredential.response.clientDataJSON :" language="json">
        {
          JSON.stringify(
            JSON.parse(new TextDecoder('utf-8').decode(credential.response.clientDataJSON)),
            null, 2)
        }
      </CodeBox>
    </>

  )
}


function parseAuthenticatorData(authData) {
  const dv = new DataView(authData.buffer);

  const ret = {
    rpIdHash: authData.slice(0, 32),
    flags: authData.slice(32, 33)[0],
    signCount: dv.getUint32(33, false),
    attestedCredentialData: null,
  };

  const flags = authData.slice(32, 33)[0]
  const flagsSet = new Set();
  ret.flagsSet = flagsSet;
  // User Presence (UP): If set (i.e., to 1), the authenticator validated that the user was present through some Test of User Presence (TUP), such as touching a button on the authenticator.
  if (flags & 0x01) flagsSet.add("UP");
  if (flags & 0x02) flagsSet.add("RFU1");
  if (flags & 0x04) flagsSet.add("UV");
  if (flags & 0x08) flagsSet.add("RFU3");
  if (flags & 0x10) flagsSet.add("RFU4");
  if (flags & 0x20) flagsSet.add("RFU5");
  // If set, the attested credential data will immediately follow the first 37 bytes of this authenticatorData.
  if (flags & 0x40) flagsSet.add("AT");
  if (flags & 0x80) flagsSet.add("ED");


  // see if there's more data to process
  if (flagsSet.has("AT")) {
    let attestedCredentialData = {
      aaguid: authData.slice(37, 53)
    }
    const credIdLenBytes = authData.slice(53, 55);
    const credIdLen = new DataView(credIdLenBytes.buffer).getUint16(0, false); // Big endian

    attestedCredentialData.credentialIdLength = credIdLen;
    attestedCredentialData.credentialId = authData.slice(55, 55 + credIdLen);
    attestedCredentialData.credentialPublicKey = authData.slice(55 + credIdLen);

    ret.attestedCredentialData = attestedCredentialData;
  }

  // if ( flagsSet.has("ED")) {
  //   const cborObjects = cbor.decode(new Uint8Array(authnrDataBuf.buffer.slice(offset, authnrDataBuf.buffer.byteLength)));

  //   // skip publicKey if present
  //   if (attestation) {
  //     cborObjects.shift();
  //   }

  //   if (cborObjects.length === 0) {
  //     throw new Error("extensions missing");
  //   }

  //   //ret.set("webAuthnExtensions", cborObjects);
  //   ret.webAuthnExtensions = cborObjects;
  // }

  return ret;
}

function parsePublicKey(publicKey) {
  const coseKey = cbor.decode(publicKey)
  const x = new Uint8Array(coseKey["-2"]);
  const y = new Uint8Array(coseKey["-3"]);

  // Construct the uncompressed ECPoint (0x04 | x | y)
  const uncompressedPoint = concatenateUint8Arrays(new Uint8Array([0x04]), concatenateUint8Arrays(x, y));

  // Define the ASN.1 structure
  const asn1PublicKey = new asn1js.BitString({ valueHex: uncompressedPoint.buffer });

  // ECDSA OID for P-256 curve
  const ecdsaOid = new asn1js.ObjectIdentifier({ value: '1.2.840.10045.3.1.7' });

  const publicKeyInfo = new pkijs.PublicKeyInfo({
    algorithm: new pkijs.AlgorithmIdentifier({
      algorithmId: ecdsaOid,
      algorithmParams: new asn1js.Null()
    }),
    subjectPublicKey: asn1PublicKey
  });

  const derPublicKey = publicKeyInfo.toSchema().toBER(false);
  // const derPublicKey = publicKeyInfo.scheme.toBER(false);
  const derPublicKeyBuffer = new Uint8Array(derPublicKey).buffer;

  return derPublicKeyBuffer
}

function concatenateUint8Arrays(array1, array2) {
  let newArray = new Uint8Array(array1.length + array2.length);
  newArray.set(array1);
  newArray.set(array2, array1.length);
  return newArray;
}

export default CredentialsCreateExample;

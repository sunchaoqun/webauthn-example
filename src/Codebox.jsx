import { useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { solarizedDark } from "react-syntax-highlighter/dist/esm/styles/hljs"

 function CodeBox({ description, language, children }) {
  if (language === undefined) {
    language = "javascript"
  }
  return (
    <div className="collapse collapse-open bg-base-200 border bg-gray-400">
      <div className="collapse-title font-medium text-black">
        {description}
      </div>
      <div className="collapse-content text-sm">
        <SyntaxHighlighter children={children} language={language} style={solarizedDark} />
      </div>
    </div>
  )
}

function ToggleCodeBox({ description, language, children }) {
  if (language === undefined) {
    language = "javascript"
  }

  const [checked, setChecked] = useState(false)

  const toggle= () => {
    setChecked(current => !current)
  }

  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="radio" name="show-example" checked={checked} onClick={toggle} readOnly />
      <div className="collapse-title font-medium">
        {description}
      </div>
      <div className="collapse-content text-sm">
        <SyntaxHighlighter children={children} language={language} style={solarizedDark} />
      </div>
    </div>
  )
}


export { CodeBox, ToggleCodeBox };
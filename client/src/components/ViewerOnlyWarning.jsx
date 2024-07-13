import React from 'react'
import { Flex } from "monday-ui-react-core";
import { Heading } from "monday-ui-react-core/next";
import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";

const ViewerOnlyWarning = () => {
  return (
    <div
    style={{
      width: "100%",
      height: "100%",
    }}
  >
    <div
      style={{
        padding: "16px 16px",
        backgroundColor: "lightgray",
        height: "100vh",
      }}
    >
      <Flex
        gap={Flex.gaps.SMALL}
        direction={Flex.directions.COLUMN}
        justify={Flex.justify.CENTER}
        align={Flex.align.CENTER}
      >
        <Heading type={Heading.types.H2} weight={Heading.weights.BOLD} style={{marginTop:'1rem'}}>
          Delete Multiple Columns
        </Heading>

        <Flex justify={Flex.justify.CENTER} style={{marginTop:'1rem'}}>
          <AttentionBox
            className="monday-storybook-attention-box_box"
            text="As a viewer, you are unable to use this app."
            title="Warning!"
            type={AttentionBox.types.WARNING}
          />
        </Flex>
      </Flex>
    </div>
  </div>
  )
}

export default ViewerOnlyWarning
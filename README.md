# **dev-demos**
UniquID demos for physical devices.

This repo is a collection of samples that can be run on real COTS hardware.

## [DIGI board LED control demo](https://uniquid.gitbook.io/uniquid/hardware)

This demo runs on the **CC-6UL-SBC-Express** board from [**DIGI**](http://www.digi.com). It also includes a Node.js web application which can be run on the developer's workstation to interact with the board.

The board provides a LED that can be controlled by the user BUTTON. The web application can be used to remotely control the LED on the board, if permitted by UniquID contracts. The board will also publish the LED status to the customer's AWS IoT Cloud when enabled by [UniquID AWS integration](https://uniquid.gitbook.io/uniquid/integrate-uniquid-with-aws) and a contract with the UniquID Authorizer.

The DIGI board, the web application and the Custom Authorizer are UniquID nodes.

- **[app](/app)** - node web application
- **[DIGI-CC-6UL-SBC-Express](/DIGI-CC-6UL-SBC-Express)** - Demo code for DIGI [ConnectCore® 6UL SBC Express](https://www.digi.com/products/embedded-systems/single-board-computers/connectcore-for-i-mx6ul-sbc-express)


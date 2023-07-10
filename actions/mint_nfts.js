const fcl = require("@onflow/fcl");
const { serverAuthorization } = require("./auth/authorization.js");
require("../flow/config.js");

async function mintNFTs(recipient) {
  const names = ["TOBIRA NEKO #00055-1", "TOBIRA NEKO #00055-2", "TOBIRA NEKO #00055-3"];
  const descriptions = [
    "赤猫",
    "緑猫",
    "黒猫"
  ];
  const thumbnails = [
    "55-1.png",
    "55-2.png",
    "55-3.png"
  ];

  try {
    const transactionId = await fcl.mutate({
      cadence: `
      import ExampleNFT from 0xDeployer
      import NonFungibleToken from 0xStandard
      
      transaction(names: [String], descriptions: [String], thumbnails: [String], recipient: Address) {
        let RecipientCollection: &ExampleNFT.Collection{NonFungibleToken.CollectionPublic}
        
        prepare(signer: AuthAccount) {      
          self.RecipientCollection = getAccount(recipient).getCapability(ExampleNFT.CollectionPublicPath)
                                      .borrow<&ExampleNFT.Collection{NonFungibleToken.CollectionPublic}>()
                                      ?? panic("The recipient has not set up an ExampleNFT Collection yet.")
        }
      
        execute {
          var i = 0
          while i < names.length {
            ExampleNFT.mintNFT(recipient: self.RecipientCollection, name: names[i], description: descriptions[i], thumbnail: thumbnails[i])
            i = i + 1
          }
        }
      }
      `,
      args: (arg, t) => [
        arg(names, t.Array(t.String)),
        arg(descriptions, t.Array(t.String)),
        arg(thumbnails, t.Array(t.String)),
        arg(recipient, t.Address)
      ],
      proposer: serverAuthorization,
      payer: serverAuthorization,
      authorizations: [serverAuthorization],
      limit: 999
    });

    console.log('Transaction Id', transactionId);
  } catch (e) {
    console.log(e);
  }
}

mintNFTs(process.argv.slice(2)[0]);
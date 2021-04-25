# VoxoDeus Subgraph 

This subgraph was built in order to make the following tasks easier, since it would take too long to determine with quering a single node. 

    1. Determine which voxos a user owns 
    2. Determine which voxos a user minted 
    3. Determine all the voxos a user owned historically 




## [Entities](./schema.graphql)

1. VoxoSamaritan: User information, each Voxo user will have his own entitiy which can be acesses by using the users address as the id 
2. VoxoStats: id is always '1', stores general universal statistics 
3. MintEvent: stores every mint event 

## Example Queries: 

1. Query the first 5 VoxoSamaritans 

```
{
  voxoSamaritans(first: 5) {
    id
    trove
    hodlHist
    mintHist {
      tokenId
      timestamp
    }
  }
}

```
Result 
```
{
  "data": {
    "voxoSamaritans": [
      {
        "hodlHist": [
          223,
          228,
          234,
          239,
          245,
          802
        ],
        "id": "0x001b8fd08545cc8fa3734a6e53652c61724df224",
        "mintHist": [
          {
            "timestamp": "1618500985",
            "tokenId": 223
          },
          {
            "timestamp": "1619195721",
            "tokenId": 802
          },
          {
            "timestamp": "1618501099",
            "tokenId": 228
          },
          {
            "timestamp": "1618501268",
            "tokenId": 239
          },
          {
            "timestamp": "1618501415",
            "tokenId": 245
          },
          {
            "timestamp": "1618501183",
            "tokenId": 234
          }
        ],
        "trove": [
          223,
          228,
          234,
          239,
          245,
          802
        ]
      },
      {
        "hodlHist": [
          893
        ],
        "id": "0x00202f8f6bb6f100241ce0726922f2bd4c7196ee",
        "mintHist": [
          {
            "timestamp": "1619237799",
            "tokenId": 893
          }
        ],
        "trove": [
          893
        ]
      },
      {
        "hodlHist": [
          746
        ],
        "id": "0x031ee7975fb94847a620ee017441610e97d66605",
        "mintHist": [
          {
            "timestamp": "1619040507",
            "tokenId": 746
          }
        ],
        "trove": [
          746
        ]
      },
      {
        "hodlHist": [
          393,
          403,
          404
        ],
        "id": "0x05f2c11996d73288abe8a31d8b593a693ff2e5d8",
        "mintHist": [
          {
            "timestamp": "1618543356",
            "tokenId": 403
          },
          {
            "timestamp": "1618540890",
            "tokenId": 393
          },
          {
            "timestamp": "1618543356",
            "tokenId": 404
          }
        ],
        "trove": [
          393,
          403,
          404
        ]
      },
      {
        "hodlHist": [
          464
        ],
        "id": "0x0690d7a3e7075f871b804dfde6e690ccfdebcddc",
        "mintHist": [
          {
            "timestamp": "1618559401",
            "tokenId": 464
          }
        ],
        "trove": [
          464
        ]
      }
    ]
  }
}
```
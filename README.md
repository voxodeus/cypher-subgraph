# VoxoDeus Subgraph 
Prerequisites
    
    move .env.exampe to .env and edit the NODE_URL
    Run graph node locally using docker-compore up
    yarn codegen
    yarn build
    yarn create-local
    yarn deploy-local


## [Entities](./schema.graphql)

__VoxoSamaritan__: User information, each Voxo user will have his own entitiy which can be acesses by using the users address as the id   
__VoxoStats__: id is always '1', stores general universal statistics  
__MintEvent__: stores every mint event  
__BurnEvent__: stores every burn event  
__VoxoToken__: token id and current owner  
__VoxoHistoricalHodl__: stores historical owners of a token  


## Example Queries: 
### Query a list of all minters
```graphql
{
  voxoSamaritans(where: {mintCount_gt: 0}, orderBy: mintCount, orderDirection: desc){
    id
    mintCount
  }
}
```
### Query a list of all holders
```graphql
{
  voxoSamaritans(where: {holdHistCount_gt: 0}, orderBy: holdHistCount, orderDirection: desc){
    id
    holdHistCount
  }
}
```
### Query a list of current holders
```graphql
{
  voxoSamaritans(where: {troveCount_gt: 0}, orderBy: troveCount, orderDirection: desc){
    id
    troveCount
  }
}
```
### Query by user address, and this should show the unique ids of VoxoDeus NFT’s minted + held + historically owned + numbers for each
```graphql
{
   voxoSamaritan(id: "0xc212f04685cfcc8444d3b8368f045e2a2675c039"){
    id
    mintCount
    mintHist{
      tokenId
    }
    troveCount
    trove{
      id
    }
    holdHistCount
    hodlHist{
      id
    }
  }
}
```
### Query a list of top minters, top holders and top historical holders   

*Querying the top ten minters*
```graphql
{
  voxoSamaritans(first: 10, where: {mintCount_gt: 0}, orderBy: mintCount, orderDirection: desc){
    id
    mintCount
  }
}
```
*Querying the top ten historical holders*
```graphql
{
  voxoSamaritans(first: 10, where: {holdHistCount_gt: 0}, orderBy: holdHistCount, orderDirection: desc){
    id
    holdHistCount
  }
}
```
*Querying the top ten holders*
```graphql
{
  voxoSamaritans(first: 10, where: {troveCount_gt: 0}, orderBy: troveCount, orderDirection: desc){
    id
    troveCount
  }
}
```
### Query the total voxos minted, burned, transfered and also the total token holders (current or historical)
```graphql
{
  voxoStats(id:"1"){
    totalMinted
    totalBurned
    totalTransfers
    totalHolders
    totalHistoricalHolders
  }
}
```
### Query the current owner and the historical owners of a token
```graphql
{
  voxoToken(id: "25"){
    ownerHist{
      id
    }
    user{
      id
    }
  }
}
```

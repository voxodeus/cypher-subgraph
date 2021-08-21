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
__VoxoHistoricalHold__: stores historical owners of a token  


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
  voxoSamaritans(where: {holdHistoryCount_gt: 0}, orderBy: holdHistoryCount, orderDirection: desc){
    id
    holdHistoryCount
  }
}
```
### Query a list of current holders
```graphql
{
  voxoSamaritans(where: {currentCollectionCount_gt: 0}, orderBy: currentCollectionCount, orderDirection: desc){
    id
    currentCollectionCount
  }
}
```
### Query by user address, and this should show the unique ids of VoxoDeus NFT’s minted + held + historically owned + numbers for each
```graphql
{
   voxoSamaritan(id: "0xc212f04685cfcc8444d3b8368f045e2a2675c039"){
    id
    mintCount
    mints{
      tokenId
    }
    currentCollectionCount
    currentCollection{
      id
    }
    holdHistoryCount
    holdHistory{
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
  voxoSamaritans(first: 10, where: {holdHistoryCount_gt: 0}, orderBy: holdHistoryCount, orderDirection: desc){
    id
    holdHistoryCount
  }
}
```
*Querying the top ten holders*
```graphql
{
  voxoSamaritans(first: 10, where: {currentCollectionCount_gt: 0}, orderBy: currentCollectionCount, orderDirection: desc){
    id
    currentCollectionCount
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

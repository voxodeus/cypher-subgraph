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
1. Query a list of all minters
```
{
  voxoSamaritans(where: {mintCount_gt: 0}, orderBy: mintCount, orderDirection: desc){
    id
    mintCount
  }
}
```
2. Query a list of all holders
```
{
  voxoSamaritans(where: {holdHistCount_gt: 0}, orderBy: holdHistCount, orderDirection: desc){
    id
    holdHistCount
  }
}
```
3. Query a list of current holders
```
{
  voxoSamaritans(where: {troveCount_gt: 0}, orderBy: troveCount, orderDirection: desc){
    id
    troveCount
  }
}
```
4. Query by user address, and this should show the unique ids of VoxoDeus NFT’s minted + held + historically owned + numbers for each
```
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
5. Query a list of top minters, top holders and top historical holders   

__Querying the top ten minters__
```
{
  voxoSamaritans(first: 10, where: {mintCount_gt: 0}, orderBy: mintCount, orderDirection: desc){
    id
    mintCount
  }
}
```
__Querying the top ten historical holders__
```
{
  voxoSamaritans(first: 10, where: {holdHistCount_gt: 0}, orderBy: holdHistCount, orderDirection: desc){
    id
    holdHistCount
  }
}
```
__Querying the top ten holders__
```
{
  voxoSamaritans(first: 10, where: {troveCount_gt: 0}, orderBy: troveCount, orderDirection: desc){
    id
    troveCount
  }
}
```
6. Get the total voxos minted 

```
{
  voxoStats(id:"1"){
    totalMinted
    histHodlers
  }
}
```
7. Query the first 5 VoxoSamaritans 

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
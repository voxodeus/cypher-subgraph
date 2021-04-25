import { BigInt } from "@graphprotocol/graph-ts"
import {
  VoxoDeus,
  Approval,
  ApprovalForAll,
  OwnershipTransferred,
  Transfer
} from "../generated/VoxoDeus/VoxoDeus"
import { VoxoSamaritan, VoxoStats, MintEvent} from "../generated/schema"


// We react to only transfer events of Voxos 
export function handleTransfer(event: Transfer): void {
  // extract most useful fields 
  let to = event.params.to
  let from = event.params.from
  let tokenId = event.params.tokenId.toI32()
  let txid = event.transaction.hash.toHexString()
  // assume its not a mint 
  let mint = false
  // load stats (create if doesn't exist, not id is always '1' )
  let stats = VoxoStats.load("1")
  if (stats == null){
    stats = new VoxoStats("1")
    stats.totalMinted = 0
    stats.histHodlers = []
    stats.currentHodlers = []
  }
  // update the total minted stats 
  if (tokenId > stats.totalMinted){
    stats.totalMinted = tokenId
  }
  // get historical and current holders 
  let histHodlers = stats.histHodlers
  let currentHodlers = stats.currentHodlers
  // update historical holders with to address if its new address 
  if (!histHodlers.includes(to)){
    histHodlers.push(to)
  }
  // update current holders with to address if its new address 
  if(!currentHodlers.includes(to)){
    currentHodlers.push(to)
  }
  // set stats for historical holders 
  stats.histHodlers = histHodlers
  // if its a mint event update 
  if (from.toHex() == '0x0000000000000000000000000000000000000000'){
    mint = true
  }
  // if its not mint, we need to remove current Voxo from the senders address who sold his voxo 
  else {
    // get sender
    let fromSamaritan = VoxoSamaritan.load(from.toHex())
    // remove from current colelction 
    let collection = fromSamaritan.trove
    for(let i=0; i<collection.length; i++){
      if (collection[i] == tokenId ){
        collection.splice(i)
      }
    }
    // update his current collection 
    fromSamaritan.trove = collection
    // remove user from currentHodlers if he has no voxos left 
    if (collection.length === 0 ){
      for(let i=0; i < currentHodlers.length; i++){
        if(currentHodlers[i] === from){
          currentHodlers.splice(i)
        }
      }
    }
    // update sender entity  
    fromSamaritan.save()
  }
  // grab reciever stats 
  let toSamaritan = VoxoSamaritan.load(to.toHex())
  if (toSamaritan == null){
    toSamaritan = new VoxoSamaritan(to.toHex())
    toSamaritan.hodlHist = []
    toSamaritan.trove = []
  }
  // if mint add to mint 
  if (mint){
    let mintEvent = new MintEvent(txid)
    mintEvent.blockNumber =  event.block.number
    mintEvent.timestamp = event.block.timestamp
    mintEvent.user = toSamaritan.id
    mintEvent.tokenId = tokenId
    mintEvent.save()
  }
  // if not mint update current collection + ownage hist 
  let ownageHist = toSamaritan.hodlHist
  ownageHist.push(tokenId)
  toSamaritan.hodlHist = ownageHist
  let trove = toSamaritan.trove
  trove.push(tokenId)
  toSamaritan.trove = trove 
  stats.currentHodlers = currentHodlers
  // save  
  toSamaritan.save()
  stats.save()

}


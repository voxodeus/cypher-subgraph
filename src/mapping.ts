import { Address} from "@graphprotocol/graph-ts"

import {
  Transfer
} from "../generated/VoxoDeus/VoxoDeus"
import { VoxoSamaritan, VoxoStats, MintEvent, BurnEvent, VoxoToken, VoxoHistoricalHodl} from "../generated/schema"


let ZERO_ADDRESS = i32(0)

function getOrCreateVoxosStats(): VoxoStats {
  // load stats (create if doesn't exist, not id is always '1' )
  let stats = VoxoStats.load("1")
  if (stats == null){
    stats = new VoxoStats("1")
    stats.totalMinted = 0
    stats.totalBurned = 0
  }
  return stats as VoxoStats
}


function getOrCreateSamaritan(samaritanId: string): VoxoSamaritan {
  // load samaritan (create if doesn't exist)
  let samaritan = VoxoSamaritan.load(samaritanId)
  if (samaritan == null){
    samaritan = new VoxoSamaritan(samaritanId)
    samaritan.burnCount = 0
    samaritan.mintCount = 0
    samaritan.holdHistCount =0
    samaritan.troveCount = 0
  }
  return samaritan as VoxoSamaritan
}

function getOrCreateVoxosToken(tokenId: string): VoxoToken {
  // load token (create if doesn't exist)
  let token = VoxoToken.load(tokenId)
  if (token == null){
    token = new VoxoToken(tokenId)
    token.save()
  }
  return token as VoxoToken
}

function CreateIfNotExistsVoxoHistoricalHodl(samaritanId: string, tokenId: string):  boolean {
  // load historical hodl (create if doesn't exist)
  let id = `${samaritanId}-${tokenId}`
  let created = false
  let historicalHodl = VoxoHistoricalHodl.load(id)
  if (historicalHodl == null){
    historicalHodl = new VoxoHistoricalHodl(id)
    historicalHodl.token = tokenId
    historicalHodl.user = samaritanId
    historicalHodl.save()
    created = true
  }
  return created
}

// We react to only transfer events of Voxos 
export function handleTransfer(event: Transfer): void {
  // extract most useful fields 
  let to = event.params.to
  let from = event.params.from
  let tokenId = event.params.tokenId.toI32()
  let txid = event.transaction.hash.toHexString()
  // assume its not a mint 
  let mint = false
  // assume its not a burn 
  let burn = false

  let stats = getOrCreateVoxosStats()
  let fromSamaritan = getOrCreateSamaritan(from.toHex())
  let samaritan = getOrCreateSamaritan(to.toHex())
  

  // Update the holdCount for each samaritan.
  fromSamaritan.troveCount = fromSamaritan.troveCount - 1
  samaritan.troveCount = samaritan.troveCount + 1

  // Update the owner info.
  let token = getOrCreateVoxosToken(tokenId.toString())
  token.user = samaritan.id
  token.save()

  // Create a hodl history if not exists.
  let created = CreateIfNotExistsVoxoHistoricalHodl(tokenId.toString(), samaritan.id)
  
  // Increase holdHistCount if the samaritan didn't own this trove previously.
  if (created) {
    samaritan.holdHistCount = samaritan.holdHistCount + 1
  }
  
  // Check if it's a mint or a burn event.
  if (from.toI32() == ZERO_ADDRESS){
    let mintEvent = new MintEvent(txid)
    mintEvent.type = "MINT"
    mintEvent.blockNumber =  event.block.number
    mintEvent.timestamp = event.block.timestamp
    mintEvent.user = samaritan.id
    mintEvent.tokenId = tokenId
    mintEvent.save()

    // Increase mint count for the samaritan and stats.
    stats.totalMinted = stats.totalMinted + 1
    samaritan.mintCount = samaritan.mintCount + 1
  }
  else if (to.toI32() == ZERO_ADDRESS){
    // Add the burn event.
    let burnEvent = new BurnEvent(txid)
    burnEvent.type = "BURN"
    burnEvent.blockNumber =  event.block.number
    burnEvent.timestamp = event.block.timestamp
    burnEvent.user = samaritan.id
    burnEvent.tokenId = tokenId
    burnEvent.save()

    // Increase burn count for the samaritan and stats.
    stats.totalBurned = stats.totalBurned + 1
    samaritan.burnCount = samaritan.burnCount + 1
  }

  // Update objects.
  stats.save()
  samaritan.save()
}


import { Address, Bytes, ethereum} from "@graphprotocol/graph-ts"

import {
  Transfer
} from "../generated/VoxoDeus/VoxoDeus"
import {
  OrdersMatched, OpenSea
} from "../generated/VoxoDeus/OpenSea"
import { VoxoSamaritan, VoxoStats, MintEvent, BurnEvent, TransferEvent, VoxoToken, VoxoHistoricalHold, VoxoSale, VoxoSale} from "../generated/schema"


let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function getOrCreateVoxosStats(): VoxoStats {
  // load stats (create if doesn't exist, not id is always '1' )
  let stats = VoxoStats.load("1")
  if (stats == null){
    stats = new VoxoStats("1")
    stats.totalMinted = 0
    stats.totalBurned = 0
    stats.totalHistoricalHolders = 0
    stats.totalHolders = 0
    stats.totalTransfers = 0
  }
  return stats as VoxoStats
}

// A simple hepler class.
class CreateSamaritanResult {
  public samaritan: VoxoSamaritan
  public created: boolean

  constructor(samaritan: VoxoSamaritan, created: boolean) {
    this.samaritan = samaritan
    this.created = created
  }
}
function getOrCreateSamaritan(samaritanId: string): CreateSamaritanResult {
  // load samaritan (create if doesn't exist)
  let samaritan = VoxoSamaritan.load(samaritanId)
  let created = false
  if (samaritan == null){
    samaritan = new VoxoSamaritan(samaritanId)
    samaritan.burnCount = 0
    samaritan.mintCount = 0
    samaritan.holdHistoryCount = 0
    samaritan.currentCollectionCount = 0
    created = true
  }
  return new CreateSamaritanResult(samaritan as VoxoSamaritan, created)
}

function getOrCreateVoxosToken(tokenId: string): VoxoToken {
  // load token (create if doesn't exist)
  let token = VoxoToken.load(tokenId)
  if (token == null){
    token = new VoxoToken(tokenId)
  }
  return token as VoxoToken
}

// function CreateVoxosSale(saleId: string): VoxoSale {
//   // load token (create if doesn't exist)
//   OrdersMatched.bin
//   let sale = new VoxoSale(saleId)
//   return sale as VoxoSale
// }

function CreateIfNotExistsVoxoHistoricalHodl(samaritanId: string, tokenId: string):  boolean {
  // load historical hodl (create if doesn't exist)
  let id = samaritanId + "-" + tokenId
  let created = false
  let historicalHodl = VoxoHistoricalHold.load(id)
  if (historicalHodl == null){
    historicalHodl = new VoxoHistoricalHold(id)
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

  event.transaction


  // Get or create entities.
  let stats = getOrCreateVoxosStats()
  let fromSamaritan = getOrCreateSamaritan(from.toHex()).samaritan
  let samaritanResult = getOrCreateSamaritan(to.toHex())
  
  let samaritan = samaritanResult.samaritan
  
  // Increase total token transfers by one
  stats.totalTransfers = stats.totalTransfers + 1

  // Update the holdCount for each samaritan.
  fromSamaritan.currentCollectionCount = fromSamaritan.currentCollectionCount - 1
  samaritan.currentCollectionCount = samaritan.currentCollectionCount + 1

  // Update the total historical holders if it's a new user.
  if (samaritanResult.created){
    stats.totalHistoricalHolders = stats.totalHistoricalHolders + 1
  }

  // Update the total holders count.
  if (samaritan.currentCollectionCount == 1){
    stats.totalHolders = stats.totalHolders + 1
  }
  if (fromSamaritan.currentCollectionCount == 0){
    stats.totalHolders = stats.totalHolders - 1
  }

  // Update the owner info.
  let token = getOrCreateVoxosToken(tokenId.toString())
  token.user = samaritan.id

  // Create a hodl history if not exists.
  let created = CreateIfNotExistsVoxoHistoricalHodl(samaritan.id, tokenId.toString())
  
  // Increase holdHistoryCount if the samaritan didn't own this token previously.
  if (created) {
    samaritan.holdHistoryCount = samaritan.holdHistoryCount + 1
  }
  
  // Check if it's a mint or a burn event.
  if (from.toHex() == ZERO_ADDRESS){
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

    token.minter = samaritan.id
  }
  else if (to.toHex() == ZERO_ADDRESS){
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

    token.burner = samaritan.id
  } else {
    // Add the transfer event.
    let transferEvent = new TransferEvent(txid)
    transferEvent.type = "TRANSFER"
    transferEvent.blockNumber =  event.block.number
    transferEvent.timestamp = event.block.timestamp
    transferEvent.user = samaritan.id
    transferEvent.tokenId = tokenId
    transferEvent.save()

    // Add a VoxoSale if needed.
    if (event.transaction.hash.toHex() == txid) {
      // It's an OpenSea sale.
      let sale = new VoxoSale(txid)
      sale.seller = fromSamaritan.id
      sale.buyer = samaritan.id
      sale.market = "OPENSEA"
      
      let ordersMatchedEvent = OpenSea.bind(txid).
      ordersMatchedEvent

    }
  }

  // Update objects
  token.save()
  stats.save()
  samaritan.save()
  fromSamaritan.save()
}

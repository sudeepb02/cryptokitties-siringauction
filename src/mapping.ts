import {
  AuctionCreated as AuctionCreatedEvent,
  AuctionSuccessful as AuctionSuccessfulEvent,
  AuctionCancelled as AuctionCancelledEvent,
  Pause as PauseEvent,
  Unpause as UnpauseEvent
} from "../generated/Contract/Contract"
import {
  AuctionCreated,
  AuctionSuccessful,
  AuctionCancelled,
  Pause,
  Unpause,
  SiringSummary,
  DailyStatSiring
} from "../generated/schema"

import {BigInt} from '@graphprotocol/graph-ts'

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let entity = new AuctionCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.startingPrice = event.params.startingPrice
  entity.endingPrice = event.params.endingPrice
  entity.duration = event.params.duration
  entity.save()

  //Get Siring summary entity, if does not exist, create new
  let siringSummary = SiringSummary.load("1");
  if (siringSummary == null) {
    siringSummary = new SiringSummary("1")
    siringSummary.auctionsCreated = 0
    siringSummary.auctionsCompleted = 0
    siringSummary.auctionsCancelled = 0

    siringSummary.valueCreated = BigInt.fromI32(0) 
    siringSummary.valueCompleted = BigInt.fromI32(0)
    siringSummary.valueCancelled = BigInt.fromI32(0)
  }

  //Increment the count and value of siring auctions
  siringSummary.auctionsCreated = siringSummary.auctionsCreated + 1
  siringSummary.valueCreated = siringSummary.valueCreated + event.params.startingPrice
  
  siringSummary.save()
  
  let day = event.block.timestamp / BigInt.fromI32(86400)
  let dayID = day.toString()
  let dailyStatSiring = DailyStatSiring.load(dayID)
  if (dailyStatSiring == null) {
    dailyStatSiring = new DailyStatSiring(dayID)
    dailyStatSiring.auctionsCreatedToday = 0
    dailyStatSiring.auctionsCompletedToday = 0
    dailyStatSiring.auctionsCancelledToday = 0
    dailyStatSiring.valueCreatedToday = BigInt.fromI32(0)
    dailyStatSiring.valueCompletedToday = BigInt.fromI32(0)
  }
  dailyStatSiring.auctionsCreatedToday = dailyStatSiring.auctionsCreatedToday + 1
  dailyStatSiring.valueCreatedToday = dailyStatSiring.valueCreatedToday + event.params.startingPrice
  dailyStatSiring.save()
  
}

export function handleAuctionSuccessful(event: AuctionSuccessfulEvent): void {
  let entity = new AuctionSuccessful(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.totalPrice = event.params.totalPrice
  entity.winner = event.params.winner
  entity.save()

  //Get Sales summary entity if exists, else create new
  let siringSummary = SiringSummary.load("1");
  if (siringSummary == null) {
    siringSummary = new SiringSummary("1")
    siringSummary.auctionsCreated = 0
    siringSummary.auctionsCompleted = 0
    siringSummary.auctionsCancelled = 0

    siringSummary.valueCreated = BigInt.fromI32(0)
    siringSummary.valueCompleted = BigInt.fromI32(0)
    siringSummary.valueCancelled = BigInt.fromI32(0)
  }

  //Increment the count and value of siring auctions
  siringSummary.auctionsCompleted = siringSummary.auctionsCompleted + 1
  siringSummary.valueCompleted = siringSummary.valueCompleted + event.params.totalPrice
  
  siringSummary.save()
  
  let day = event.block.timestamp / BigInt.fromI32(86400)
  let dayID = day.toString()
  let dailyStatSiring = DailyStatSiring.load(dayID)
  if (dailyStatSiring == null) {
    dailyStatSiring = new DailyStatSiring(dayID)
    dailyStatSiring.auctionsCreatedToday = 0
    dailyStatSiring.auctionsCompletedToday = 0
    dailyStatSiring.auctionsCancelledToday = 0
    dailyStatSiring.valueCreatedToday = BigInt.fromI32(0)
    dailyStatSiring.valueCompletedToday = BigInt.fromI32(0)
  }
  dailyStatSiring.auctionsCompletedToday = dailyStatSiring.auctionsCompletedToday + 1
  dailyStatSiring.valueCompletedToday = dailyStatSiring.valueCompletedToday + event.params.totalPrice
  dailyStatSiring.save()

}

export function handleAuctionCancelled(event: AuctionCancelledEvent): void {
  let entity = new AuctionCancelled(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.save()

  //Get Sales summary entity if exists, else create new
  let siringSummary = SiringSummary.load("1");
  if (siringSummary == null) {
    siringSummary = new SiringSummary("1")
    siringSummary.auctionsCreated = 0
    siringSummary.auctionsCompleted = 0
    siringSummary.auctionsCancelled = 0

    siringSummary.valueCreated = BigInt.fromI32(0)
    siringSummary.valueCompleted = BigInt.fromI32(0)
    siringSummary.valueCancelled = BigInt.fromI32(0)
  }
  
  //Increment the count and value of siring auctions
  siringSummary.auctionsCancelled = siringSummary.auctionsCancelled + 1
  
  //Currently, value Cancelled also includes uactions still open. To be fixed
  siringSummary.valueCancelled = siringSummary.valueCreated - siringSummary.valueCompleted
  
  siringSummary.save()
  
  let day = event.block.timestamp / BigInt.fromI32(86400)
  let dayID = day.toString()
  let dailyStatSiring = DailyStatSiring.load(dayID)
  if (dailyStatSiring == null) {
    dailyStatSiring = new DailyStatSiring(dayID)
    dailyStatSiring.auctionsCreatedToday = 0
    dailyStatSiring.auctionsCompletedToday = 0
    dailyStatSiring.auctionsCancelledToday = 0
    dailyStatSiring.valueCreatedToday = BigInt.fromI32(0)
    dailyStatSiring.valueCompletedToday = BigInt.fromI32(0)
  }
  dailyStatSiring.auctionsCancelledToday = dailyStatSiring.auctionsCancelledToday + 1
  dailyStatSiring.save()

}

export function handlePause(event: PauseEvent): void {
  let entity = new Pause(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  entity.save()
}

export function handleUnpause(event: UnpauseEvent): void {
  let entity = new Unpause(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  entity.save()
}

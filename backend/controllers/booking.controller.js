import prisma from "../db/prisma.js"

export const startBooking = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guestCount } = req.body

        const existingListing = await prisma.listing.findUnique({ where: { id: listingId } })

        if(!existingListing) {
            return res.status(400).json({ error: "Listing was not found" })
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                guestId: req.user.id,
                listingId: listingId,
                checkIn: checkIn,
                checkOut: checkOut
            }
        })

        if(existingBooking) {
            return res.status(400).json({ error: "It's already been booked" })
        }

        const requestedTimings = {
            checkIn: checkIn,
            checkOut: checkOut
        }

        const bookedTimings = await prisma.booking.findMany({ where: { listingId: listingId }, select: { checkIn: true, checkOut: true } })

        const confirmation = conflictChecker(bookedTimings, requestedTimings)

        if(confirmation === "no") {
            return res.status(400).json({ error: "No available bookings within these times" })
        }

        // Calculating the total price
        const ppn = existingListing.pricePerNight
        const starting = new Date(checkIn)
        const ending = new Date(checkOut)
        const diff = Math.abs(ending.getTime() - starting.getTime())
        const nights = Math.ceil(diff / (1000 * 3600 * 24))
        const price = nights * ppn

        const newBooking = await prisma.booking.create({
            data: {
                guestId: req.user.id,
                listingId: listingId,
                checkIn: checkIn,
                checkOut: checkOut,
                totalPrice: price,
                guestCount: guestCount,
                status: "PENDING"
            }
        })

        res.status(201).json(newBooking)
    } catch (error) {
        console.log("Error in startBooking controller", error.message)
		res.status(500).json({ error: "Internal Server Error" })
    }
}

// Checking dates of conflict
const conflictChecker = (bookedTimings, requestedTimings) => {
    const reserveds = []
    const vacants = []
    const all = []
    for(let i = 0; i < bookedTimings.length; i++) {
        if(((requestedTimings.checkIn >= bookedTimings[i].checkIn && requestedTimings.checkIn <= bookedTimings[i].checkOut) || (requestedTimings.checkOut >= bookedTimings[i].checkIn && requestedTimings.checkOut <= bookedTimings[i].checkOut)) || ((requestedTimings.checkOut >= bookedTimings[i].checkIn && requestedTimings.checkIn <= bookedTimings[i].checkIn) && (requestedTimings.checkOut >= bookedTimings[i].checkOut && requestedTimings.checkIn <= bookedTimings[i].checkOut))){
            reserveds.push("reserved")
        } else {
            vacants.push("vacant")
        }
    }
    all.push(...reserveds, ...vacants)
    return all.includes("reserved") ? "no" : "yes"
}
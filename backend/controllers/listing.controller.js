import prisma from "../db/prisma.js"

export const createListing = async (req, res) => {
    try {
        const { title, description, pricePerNight, beds, baths, maxGuests, propertyType } = req.body

        let hostId = req.user.id

        const currentUser = await prisma.user.findUnique({ where: { id: hostId } })

        if(!currentUser) {
            return res.status(400).json({ error: "User doesn't exist" })
        }

        if(!title || !description || !pricePerNight || !beds || !baths || !maxGuests) {
            return res.status(400).json({ error: "Please fill in all fields" })
        }

        const existingListing = await prisma.listing.findUnique({ where: { title } })

        if(existingListing) {
            return res.status(400).json({ error: "Listing already exists" })
        }

        if(currentUser?.role !== "HOST") {
            return res.status(400).json({ error: "You're not authorized to Create listing" })

        }

        const newListing = await prisma.listing.create({
            data: {
                host: { connect: { id: hostId } },
                title,
                description,
                pricePerNight,
                beds,
                baths,
                maxGuests,
                propertyType
            }
        })

        res.status(201).json(newListing)
    } catch (error) {
        console.log("Error in createListing controller", error.message)
		res.status(500).json({ error: "Internal Server Error" })
    }
}
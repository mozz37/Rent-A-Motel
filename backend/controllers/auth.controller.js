import bcryptjs from "bcryptjs"
import prisma from "../db/prisma.js"
import generateToken from "../utils/generateToken.js"

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password, confirmPassword } = req.body

        if (!fullName || !username || !email || !password || !confirmPassword) {
			return res.status(400).json({ error: "Please fill in all fields" })
		}

        if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords do not match" })
		}

        const user = await prisma.user.findUnique({ where: { username } })

        if (user) {
			return res.status(400).json({ error: "User already exists" })
		}

        const salt = await bcryptjs.genSalt(10)
		const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await prisma.user.create({
			data: {
                username,
				fullName,
                email,
				password: hashedPassword,
			},
		})

        if (newUser) {
			generateToken(newUser.id, res)
			res.status(201).json({
				id: newUser.id,
				fullName: newUser.fullName,
				username: newUser.username,
                email: newUser.email
			})
		} else {
			res.status(400).json({ error: "Invalid user data" })
		}
    } catch (error) {
        console.log("Error in signup controller", error.message)
		res.status(500).json({ error: "Internal Server Error" })
    }
}
import bcryptjs from "bcryptjs"
import prisma from "../db/prisma.js"
import generateToken from "../utils/generateToken.js"

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password, confirmPassword, role } = req.body

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if(!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email address" })
		}

        if (!fullName || !username || !email || !password || !confirmPassword || !role) {
			return res.status(400).json({ error: "Please fill in all fields" })
		}

        if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords do not match" })
		}

        const existingUser = await prisma.user.findUnique({ where: { username } })

        if (existingUser) {
			return res.status(400).json({ error: "User already exists" })
		}

		const existingEmail = await prisma.user.findUnique({ where: { email } })

		if (existingEmail) {
			return res.status(400).json({ error: "Email already exists" })
		}

        const salt = await bcryptjs.genSalt(10)
		const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await prisma.user.create({
			data: {
                username,
				fullName,
                email,
				password: hashedPassword,
				role
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

export const login = async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await prisma.user.findUnique({ where: { email } })

		const isPasswordCorrect = await bcryptjs.compare(password, user.password)

		if(!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid email or password" })
		}

		generateToken(user.id, res)

		res.status(200).json({
			id: user.id,
			fullName: user.fullName,
			username: user.username
		})
	} catch (error) {
		console.log("Error in login controller", error.message)
		res.status(500).json({ error: "Internal Server Error" })
	}
}

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 })
		res.status(200).json({ message: "Logged out successfully" })
	} catch (error) {
		console.log("Error in logout controller", error.message)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
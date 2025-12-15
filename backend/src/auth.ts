import { Elysia, t } from "elysia";
import prisma from "./db";

export const authRoutes = new Elysia({ prefix: "/auth" })
    .post("/register", async ({ body, set }) => {
        const { fullName, email, phoneNumber, password } = body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            set.status = 400;
            return { message: "User already exists" };
        }

        // Hash password
        const hashedPassword = await Bun.password.hash(password);

        // Create user
        try {
            const user = await prisma.user.create({
                data: {
                    fullName,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                }
            });

            return {
                message: "User registered successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    isActive: user.isActive
                }
            };
        } catch (error) {
            console.error(error);
            set.status = 500;
            return { message: "Internal server error" };
        }
    }, {
        body: t.Object({
            fullName: t.String(),
            email: t.String(),
            phoneNumber: t.String(),
            password: t.String()
        })
    })
    .post("/login", async ({ body, set }) => {
        const { phoneNumber, password } = body;

        // Find user by phone number
        const user = await prisma.user.findFirst({
            where: { phoneNumber }
        });

        if (!user) {
            set.status = 401;
            return { message: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" };
        }

        // Check if user is active
        if (!user.isActive) {
            set.status = 403;
            return { message: "บัญชีนี้ถูกระงับการใช้งาน" };
        }

        // Verify password
        const isPasswordValid = await Bun.password.verify(password, user.password);

        if (!isPasswordValid) {
            set.status = 401;
            return { message: "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง" };
        }

        return {
            message: "เข้าสู่ระบบสำเร็จ",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        };
    }, {
        body: t.Object({
            phoneNumber: t.String(),
            password: t.String()
        })
    });

// Users routes
export const usersRoutes = new Elysia({ prefix: "/users" })
    .get("/:id", async ({ params, set }) => {
        const { id } = params;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            set.status = 404;
            return { message: "ไม่พบผู้ใช้" };
        }

        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        };
    });

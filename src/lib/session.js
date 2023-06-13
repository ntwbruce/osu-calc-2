// configure iron session options
export const sessionOptions = {
    password: process.env.NEXT_PUBLIC_SECRET_COOKIE_PASSWORD,
    cookieName: "osu-calc2",
    ttl: 86400,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production" || false,
    },
};
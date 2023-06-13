export default function handler(req, res) {
    // in future api routes can be called from here once authtoken stuff is stored in a valid place
    res.status(200).json({ name: 'John Doe' })
}

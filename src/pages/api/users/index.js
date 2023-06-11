export default function handler(req, res) {
    
    res.status(500).json({
        message: "not meant to call this route!"
    });
}

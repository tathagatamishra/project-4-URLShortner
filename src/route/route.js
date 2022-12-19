const express = require('express')
const redis = require('redis')
const Model = require("../model/model")

const router = express.Router()


const redisClient = redis.createClient({
    url: "redis://default:CW6Urr778VUu47LZQLOOpHIURmIS0S8G@redis-18636.c91.us-east-1-3.ec2.cloud.redislabs.com:18636"
})
redisClient.connect(console.log("Connected to 🔴 is"))


let urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i


router.post("/url/shorten", async (req, res) => {
    try {

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "💪 Body can't be empty 😒" })

        let realUrl = req.body.url.trim()
        if (!realUrl) return res.status(400).send({ status: false, message: "Enter a link to shorten 🤏" })


        if (!urlRegex.test(realUrl)) return res.status(400).send({ status: false, message: "Please enter a valid url 🌐" })



        let sameUrl = await Model.findOne({ longUrl: realUrl }).select({ _id: 0, __v: 0 })
        if (sameUrl) return res.status(200).send({ status: true, message: "Data already present in our database 😄", data: sameUrl })


        let ranNum = Math.floor(Math.random() * (15 - 10 + 1)) + 10
        let char = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let code = ""

        for (let i = 0; i < ranNum; i++) {
            code += char.charAt(Math.floor(Math.random() * char.length))
        }

        let newUrl = `localhost:3000/${code}`

        let urlData = {
            urlCode: code,
            longUrl: realUrl,
            shortUrl: newUrl
        }

        await Model.create(urlData)

       

        return res.status(201).send({ status: true, data: urlData })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
})


router.get("/:urlCode", async (req, res) => {
    try {
        let code = req.params.urlCode

        let cacheData = await redisClient.get(code)

        if (cacheData) return res.status(302).redirect(cacheData)


        let urlData = await Model.findOne({ urlCode: code }).select({ longUrl: 1, _id: 0 })

        if (!urlData) return res.status(404).send({ status: false, message: "This short url not exist in the database 😥" })

        let longUrl = urlData.longUrl

        await redisClient.set(code, longUrl, {
            EX: 10,
            NX: true,
        })

        return res.status(302).redirect(longUrl)

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
})


module.exports = router




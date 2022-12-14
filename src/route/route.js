const express = require('express')
const axios = require('axios')
const redis = require('redis')
const Model = require("../model/model")

const router = express.Router()


const redisClient = redis.createClient({
    url: "redis://default:CW6Urr778VUu47LZQLOOpHIURmIS0S8G@redis-18636.c91.us-east-1-3.ec2.cloud.redislabs.com:18636"
})
redisClient.connect(console.log("Connected to Redis.."))



let urlRegex = /^((ftp|http|https|www.):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;


router.post("/url/shorten", async (req, res) => {
    try {

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Body can't be empty" })

        let realUrl = req.body.url.trim()
        if (!realUrl) return res.status(400).send({ status: false, message: "Enter a link to shorten" })


        if (!urlRegex.test(realUrl)) return res.status(400).send({ status: false, message: "Please enter a valid url" })

        // let validUrl = await axios.get(realUrl).then(() => longUrl).catch(() => null)
        // if (!validUrl) return res.status(400).send({ status: false, message: "Please enter a working url" })


        let sameUrl = await Model.findOne({ longUrl: realUrl }).select({ _id: 0, __v: 0 })
        if (sameUrl) return res.status(200).send({ status: true, message: "Data already present in our database", data: sameUrl })



        let ranNum = Math.floor(Math.random() * (15 - 10 + 1)) + 10
        let char = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = ""

        for (let i = 0; i < ranNum; i++) {
            code += char.charAt(Math.floor(Math.random() * char.length));
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

        let cachVar = await redisClient.get(code)

        if (cachVar) return res.status(302).redirect(cachVar)


        let urlData = await Model.findOne({ urlCode: code }).select({ longUrl: 1, _id: 0 })

        let longUrl = urlData.longUrl

        if (!urlData) return res.status(404).send({ status: false, message: "This short url not exist in the database" })


        await redisClient.set(code, longUrl)

        return res.status(302).redirect(longUrl)

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
})

module.exports = router